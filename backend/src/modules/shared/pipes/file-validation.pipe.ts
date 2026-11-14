import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

type UploadedFile = {
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

type FileValidationOptions = {
  fieldName: string;
  minFiles: number;
  maxFiles: number;
  allowedTypes: readonly string[];
  maxFileSize: number;
};

/**
 * Checks file count, declared type, size, and magic bytes.
 * Text types may have no detectable signature. Every other allowed type must match the bytes.
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions) {}

  async transform(files: UploadedFile | UploadedFile[] | undefined): Promise<UploadedFile[]> {
    if (!files || (Array.isArray(files) && files.length === 0)) {
      if (this.options.minFiles === 0) {
        return [];
      }
      throw new BadRequestException(
        `${this.options.fieldName} must include at least ${this.options.minFiles} file`,
      );
    }

    const fileArray = Array.isArray(files) ? files : [files];
    if (fileArray.length < this.options.minFiles || fileArray.length > this.options.maxFiles) {
      throw new BadRequestException(
        `${this.options.fieldName} must include between ${this.options.minFiles} and ${this.options.maxFiles} files`,
      );
    }

    for (const [index, file] of fileArray.entries()) {
      if (!this.options.allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `${this.options.fieldName}[${index}] has a type that is not allowed`,
        );
      }
      if (file.size > this.options.maxFileSize) {
        throw new BadRequestException(`${this.options.fieldName}[${index}] exceeds the size limit`);
      }
      await this.assertMagicBytes(file, index);
    }

    return fileArray;
  }

  private async assertMagicBytes(file: UploadedFile, index: number): Promise<void> {
    if (!file.buffer) {
      throw new BadRequestException(`${this.options.fieldName}[${index}] is missing file bytes`);
    }

    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected) {
      const allowsText = this.options.allowedTypes.some((type) => type.startsWith('text/'));
      if (!allowsText) {
        throw new BadRequestException(
          `${this.options.fieldName}[${index}] has an unrecognized file signature`,
        );
      }
      return;
    }

    if (!this.options.allowedTypes.includes(detected.mime)) {
      throw new BadRequestException(
        `${this.options.fieldName}[${index}] contents do not match an allowed type`,
      );
    }
  }
}
