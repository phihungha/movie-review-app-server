import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import { gqlSchema } from './schema';
import { Context } from './types';
import { authenticate } from './auth';
import { NoS3BucketError } from './errors';
import { applicationDefault, initializeApp } from 'firebase-admin/app';

dotenv.config();

if (!process.env.S3_BUCKET) {
  throw new NoS3BucketError();
}

initializeApp({ credential: applicationDefault() });

const server = new ApolloServer<Context>({ schema: gqlSchema });
const serverPort = +(process.env.SERVER_PORT ?? '3000');
startStandaloneServer(server, {
  listen: { port: serverPort },
  context: async ({ req }) => ({
    ...(await authenticate(req.headers.authorization)),
  }),
}).then(() => console.log(`API Server ready at port ${serverPort}`));
