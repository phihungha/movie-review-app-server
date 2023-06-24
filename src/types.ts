import { User } from '@prisma/client';
import { prismaClient } from './api-clients';

export interface Context {
  currentUser: User | null;
}

type PrismaTransactionFunc = typeof prismaClient.$transaction;
type PrismaTransaction = Parameters<PrismaTransactionFunc>[0];
export type PrismaTxClient = Parameters<PrismaTransaction>[0];
