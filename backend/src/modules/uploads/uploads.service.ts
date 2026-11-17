import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { AppConfigService } from '../config/app-config.service';
import { chunk } from '../shared/utils';
import { PRESIGNED_URL_TTL_SECONDS } from './constants';
import { buildStorageKey } from './helpers';

const DELETE_BATCH_SIZE = 1000;

/**
 * Private S3 storage. Every method refuses to run when S3_ENABLED is false.
 * Keys are server-generated. Download links are presigned and expire.
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private client: S3Client | undefined;

  constructor(private readonly config: AppConfigService) {}

  /** Throws when S3 is turned off, before the caller does image work. */
  assertConfigured(): void {
    this.assertEnabled();
  }

  async uploadBuffer(
    folder: string,
    body: Buffer,
    contentType: string,
    extension: string,
  ): Promise<string> {
    const bucket = this.requireBucket();
    const key = buildStorageKey(folder, extension);
    await this.run('put', (client) =>
      client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      ),
    );
    return key;
  }

  async getFileByKey(key: string, expiresInSeconds = PRESIGNED_URL_TTL_SECONDS): Promise<string> {
    const bucket = this.requireBucket();
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    try {
      return await getSignedUrl(this.requireClient(), command, { expiresIn: expiresInSeconds });
    } catch (error) {
      this.logFailure('sign', error);
      throw new InternalServerErrorException('Storage request failed');
    }
  }

  async deleteByKey(key: string): Promise<void> {
    const bucket = this.requireBucket();
    await this.run('delete', (client) =>
      client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })),
    );
  }

  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    const bucket = this.requireBucket();
    await this.run('copy', (client) =>
      client.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${sourceKey}`,
          Key: destinationKey,
        }),
      ),
    );
  }

  /** Deletes every object under a prefix, one DeleteObjects call per 1000 keys. */
  async deleteObjectsWithPrefix(prefix: string): Promise<void> {
    const bucket = this.requireBucket();
    const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;
    if (normalized === '/') {
      throw new InternalServerErrorException('Storage prefix is required');
    }

    let continuationToken: string | undefined;
    do {
      const listed = await this.run('list', (client) =>
        client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: normalized,
            ContinuationToken: continuationToken,
          }),
        ),
      );
      const keys = (listed.Contents ?? [])
        .map((item) => item.Key)
        .filter((key): key is string => typeof key === 'string' && key.length > 0);
      for (const batch of chunk(keys, DELETE_BATCH_SIZE)) {
        await this.run('delete-many', (client) =>
          client.send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: batch.map((key) => ({ Key: key })), Quiet: true },
            }),
          ),
        );
      }
      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
    } while (continuationToken);
  }

  private requireBucket(): string {
    this.assertEnabled();
    const bucket = this.config.s3Bucket;
    if (!bucket) {
      throw new ServiceUnavailableException('Storage is not configured');
    }
    return bucket;
  }

  private assertEnabled(): void {
    if (!this.config.s3Enabled) {
      throw new ServiceUnavailableException('Storage is not configured');
    }
  }

  private requireClient(): S3Client {
    const region = this.config.s3Region;
    const accessKeyId = this.config.s3AccessKeyId;
    const secretAccessKey = this.config.s3SecretAccessKey;
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new ServiceUnavailableException('Storage is not configured');
    }
    this.client ??= new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    return this.client;
  }

  private async run<T>(action: string, work: (client: S3Client) => Promise<T>): Promise<T> {
    const client = this.requireClient();
    try {
      return await work(client);
    } catch (error) {
      this.logFailure(action, error);
      throw new InternalServerErrorException('Storage request failed');
    }
  }

  private logFailure(action: string, error: unknown): void {
    const message = error instanceof Error ? error.message : 'unknown storage error';
    this.logger.error(`Storage ${action} failed: ${message}`);
  }
}
