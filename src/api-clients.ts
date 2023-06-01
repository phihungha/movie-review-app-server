import { S3Client } from '@aws-sdk/client-s3';
import { fromSSO } from '@aws-sdk/credential-providers';
import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient();
export const s3Client = new S3Client({ credentials: fromSSO({}) });
