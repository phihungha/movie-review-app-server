import { S3Client } from '@aws-sdk/client-s3';
import { fromIni, fromSSO } from '@aws-sdk/credential-providers';
import { PrismaClient } from '@prisma/client';
import { NoS3BucketError } from './errors';

export const prismaClient = new PrismaClient();

if (!process.env.S3_BUCKET) {
  throw new NoS3BucketError();
}
const credentials =
  process.env.NODE_ENV === 'production' ? fromIni({}) : fromSSO({});
export const s3Client = new S3Client({ credentials });
