import { prismaClient } from './api-clients';
import JsonWebToken from 'jsonwebtoken';
import { NoJwtSecretError } from './errors';
import { User } from '@prisma/client';

if (!process.env.JWT_SECRET) {
  throw new NoJwtSecretError();
}

export async function authenticate(authField?: string): Promise<User | null> {
  if (!authField) {
    return null;
  }
  const authFieldParts = authField.split('Bearer ');
  const accessToken = authFieldParts.at(1);
  if (!accessToken) {
    return null;
  }

  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const payload = JsonWebToken.verify(accessToken, process.env.JWT_SECRET!);
  if (!payload.sub) {
    return null;
  }
  const userId = +payload.sub;

  return await prismaClient.user.findFirst({ where: { id: userId } });
}
