import { User } from '@prisma/client';
import { prismaClient } from './api-clients';
import { DecodedIdToken } from 'firebase-admin/auth';
import { schemaBuilder } from './schema-builder';

export interface Context {
  currentUser: User | null;
  decodedIdToken: DecodedIdToken | null;
}

type PrismaTransactionFunc = typeof prismaClient.$transaction;
type PrismaTransaction = Parameters<PrismaTransactionFunc>[0];
export type PrismaTxClient = Parameters<PrismaTransaction>[0];

// Type to avoid implicit any due to self-referencing initialization
export type ConnectionObjectType = ReturnType<
  typeof schemaBuilder.connectionObject
>;
