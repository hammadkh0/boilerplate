import { uuidv7 } from 'uuidv7';

const FOLDER_PATTERN = /^[a-z0-9-]+$/;
const EXTENSION_PATTERN = /^[a-z0-9]+$/;

/**
 * Builds a private object key from a folder and a new id.
 * The client's filename is never part of the key.
 * Throws when the folder or extension is not a short safe token.
 */
export function buildStorageKey(folder: string, extension: string): string {
  if (!FOLDER_PATTERN.test(folder) || !EXTENSION_PATTERN.test(extension)) {
    throw new Error('Invalid storage key');
  }
  return `${folder}/${uuidv7()}.${extension}`;
}
