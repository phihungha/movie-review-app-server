import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import { gqlSchema } from './schema';
import { Context } from './types';
import { authenticate } from './auth';
import { NoJwtSecretError, NoS3BucketError } from './errors';

dotenv.config();

if (!process.env.S3_BUCKET) {
  throw new NoS3BucketError();
}

if (!process.env.JWT_SECRET) {
  throw new NoJwtSecretError();
}

const server = new ApolloServer<Context>({ schema: gqlSchema });
const serverPort = +(process.env.SERVER_PORT ?? '3000');
startStandaloneServer(server, {
  listen: { port: serverPort },
  context: async ({ req }) => ({
    currentUser: await authenticate(req.headers.authorization),
  }),
}).then(() => console.log(`API Server ready at port ${serverPort}`));
