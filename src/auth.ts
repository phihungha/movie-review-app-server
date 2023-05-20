import { prismaClient } from './prisma-client';

export async function authenticate() {
  return await prismaClient.user.findFirstOrThrow({
    where: {
      id: 1,
    },
  });
}
