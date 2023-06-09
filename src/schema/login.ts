import JsonWebToken from 'jsonwebtoken';
import { schemaBuilder } from '../schema-builder';
import { prismaClient } from '../api-clients';
import bcrypt from 'bcrypt';
import { AuthError } from '../errors';

class AuthResult {
  constructor(public accessToken: string) {}
}

schemaBuilder.objectType(AuthResult, {
  name: 'AuthResult',
  fields: (t) => ({
    accessToken: t.field({
      type: 'Jwt',
      resolve: (parent) => parent.accessToken,
    }),
  }),
});

async function generateAccessToken(
  username: string,
  password: string
): Promise<string> {
  const users = await prismaClient.user.findMany({
    where: {
      OR: [{ username }, { email: username }],
    },
  });
  if (users.length === 0) {
    throw new AuthError('Incorrect username or password');
  }

  const user = users[0];
  const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordCorrect) {
    throw new AuthError('Incorrect username or password');
  }

  const jwtPayload = { username, sub: user.id };
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  return JsonWebToken.sign(jwtPayload, process.env.JWT_SECRET!);
}

schemaBuilder.mutationField('login', (t) =>
  t.field({
    type: AuthResult,
    errors: {
      types: [AuthError],
    },
    args: {
      username: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_, args) => {
      const accessToken = await generateAccessToken(
        args.username,
        args.password
      );
      return new AuthResult(accessToken);
    },
  })
);
