import { Injectable, PipeTransform } from '@nestjs/common';

/**
 * Removes `undefined` keys before a query object reaches Prisma.
 * `null` stays, because on Postgres it means the column is NULL.
 */
@Injectable()
export class RemoveUndefinedPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return value;
    }

    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
  }
}
