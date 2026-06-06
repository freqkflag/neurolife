import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get('S3_BUCKET', 'neurolife-docs');
    this.client = new S3Client({
      endpoint: config.get('S3_ENDPOINT', 'http://localhost:9000'),
      region: config.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY', 'neurolife'),
        secretAccessKey: config.get('S3_SECRET_KEY', 'neurolifesecret'),
      },
      forcePathStyle: true,
    });
  }

  async getUploadUrl(fileName: string, mimeType: string) {
    const key = `documents/${randomUUID()}/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 });
    return { uploadUrl, storageKey: key };
  }
}
