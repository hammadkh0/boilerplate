import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

import { AppConfigService } from '../../config/app-config.service';
import { isPrismaUniqueConstraintError } from '../helpers';
import type { ApiFailure } from '../types';

/**
 * Turns thrown errors into `{ success: false, error }`.
 * Prisma errors become plain messages. Stack traces stay in the logs, and in the body only outside production.
 */
@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly config: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = this.mapException(exception);

    if (mapped.statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(mapped.message, stack);
    }

    const body: ApiFailure = {
      success: false,
      error: {
        statusCode: mapped.statusCode,
        message: mapped.message,
        ...(mapped.details ? { details: mapped.details } : {}),
      },
    };

    response.status(mapped.statusCode).json(body);
  }

  private mapException(exception: unknown): {
    statusCode: number;
    message: string;
    details?: string[];
  } {
    if (isPrismaUniqueConstraintError(exception)) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with these details already exists.',
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError && exception.code === 'P2025') {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Record not found' };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();
      if (typeof raw === 'string') {
        return { statusCode, message: raw };
      }
      if (typeof raw === 'object' && raw !== null) {
        const body = raw as { message?: string | string[]; error?: string };
        if (Array.isArray(body.message)) {
          return {
            statusCode,
            message: 'Validation failed',
            details: body.message,
          };
        }
        return { statusCode, message: body.message ?? exception.message };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.config.isProduction
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Internal server error',
    };
  }
}
