import { Prisma, PrismaClient, User } from '@prisma/client';

export interface Context {
  currentUser: User | null;
}

export type PrismaTxClient = Omit<
  PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;
