import { prismaClient } from './builder';

export async function authenticate() {
  return await prismaClient.user.findFirstOrThrow({
    where: {
      id: 1,
    },
  });
}
