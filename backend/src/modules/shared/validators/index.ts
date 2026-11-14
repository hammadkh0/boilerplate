import { FileValidator } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';
import { isAfter, startOfToday } from 'date-fns';

import { SPREADSHEET_ALLOWED_TYPES, SPREADSHEET_EXTENSIONS } from '../constants';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments): boolean {
    if (!value) {
      return true;
    }

    const record = args.object as { startDate?: Date };
    if (record.startDate) {
      return isAfter(value, record.startDate);
    }
    return isAfter(value, startOfToday());
  }

  defaultMessage(args: ValidationArguments): string {
    const record = args.object as { startDate?: Date };
    return record.startDate
      ? 'End date must be after start date'
      : 'End date must be a future date';
  }
}

@ValidatorConstraint({ name: 'PasswordsMatch', async: false })
export class PasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const record = args.object as { newPassword?: string; password?: string };
    const password = record.newPassword ?? record.password;
    return password === confirmPassword;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}

type SpreadsheetFile = {
  mimetype: string;
  originalname: string;
  buffer?: Buffer;
};

function isSpreadsheetFile(file: unknown): file is SpreadsheetFile {
  if (typeof file !== 'object' || file === null) {
    return false;
  }
  const candidate = file as { mimetype?: unknown; originalname?: unknown };
  return typeof candidate.mimetype === 'string' && typeof candidate.originalname === 'string';
}

/**
 * Accepts CSV and Excel uploads.
 * Excel files must also match a zip signature, because xlsx is a zip container.
 */
export class CsvExcelFileValidator extends FileValidator {
  isValid(file?: unknown): boolean {
    if (!isSpreadsheetFile(file)) {
      return false;
    }

    const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    const extensionAllowed = (SPREADSHEET_EXTENSIONS as readonly string[]).includes(extension);
    const mimeAllowed = (SPREADSHEET_ALLOWED_TYPES as readonly string[]).includes(file.mimetype);
    if (!extensionAllowed || !mimeAllowed) {
      return false;
    }

    if (extension === '.csv') {
      return true;
    }

    if (!file.buffer || file.buffer.length < 4) {
      return false;
    }
    return file.buffer[0] === 0x50 && file.buffer[1] === 0x4b;
  }

  buildErrorMessage(): string {
    return `File must be one of: ${SPREADSHEET_EXTENSIONS.join(', ')}`;
  }
}
