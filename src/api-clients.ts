import { S3Client } from '@aws-sdk/client-s3';
import { fromIni, fromSSO } from '@aws-sdk/credential-providers';
import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient();

const credentials =
  process.env.NODE_ENV === 'production' ? fromIni({}) : fromSSO({});
export const s3Client = new S3Client({ credentials });
