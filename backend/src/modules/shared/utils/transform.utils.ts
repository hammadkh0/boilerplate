import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

/**
 * Transform function for a multipart field that carries a JSON object.
 * Invalid JSON becomes `undefined` so class-validator can reject the field.
 */
export function parseJsonToInstance<T extends object>(cls: new () => T) {
  return ({ value }: { value: unknown }): T | undefined => {
    if (value === undefined || value === null) {
      return undefined;
    }

    let parsed: unknown = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value) as unknown;
      } catch {
        return undefined;
      }
    }

    return plainToInstance(cls, parsed);
  };
}

/** Parses a JSON string from multipart form data. Already-parsed values pass through. */
export function parseJsonField({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      throw new BadRequestException('Invalid JSON in request field');
    }
  }
  return value;
}
