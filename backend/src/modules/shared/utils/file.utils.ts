export const MIME_TO_FILE_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

const SAFE_EXTENSION_REGEX = /^[a-z0-9]{1,12}$/;

type UploadFileLike = {
  mimetype?: string;
  originalname?: string;
};

/**
 * Picks a short extension for a storage key.
 * Prefers a safe extension from the original name, then the MIME map.
 * Callers that build S3 keys should still prefer a server-generated id over this name.
 */
export function resolveUploadFileExtension(file: UploadFileLike): string {
  const fromName = file.originalname?.split('.').pop()?.toLowerCase();
  if (fromName && SAFE_EXTENSION_REGEX.test(fromName)) {
    return fromName;
  }

  const mime = file.mimetype?.toLowerCase();
  if (mime && MIME_TO_FILE_EXTENSION[mime]) {
    return MIME_TO_FILE_EXTENSION[mime];
  }

  const mimeSubtype = mime?.split('/')[1];
  if (mimeSubtype && SAFE_EXTENSION_REGEX.test(mimeSubtype)) {
    return mimeSubtype;
  }

  return 'bin';
}

/** Content-Disposition value that keeps a Unicode filename and an ASCII fallback. */
export function buildAttachmentContentDisposition(fileName: string): string {
  const trimmed = fileName.trim() || 'download';
  const withoutQuotes = trimmed.replace(/["\r\n]/g, '_');
  const asciiFallback = withoutQuotes.replace(/[^\x20-\x7E]/g, '_') || 'download';

  if (asciiFallback === withoutQuotes) {
    return `attachment; filename="${asciiFallback}"`;
  }

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(withoutQuotes)}`;
}
