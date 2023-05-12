import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import { gqlSchema } from './schema';
dotenv.config();

const server = new ApolloServer({ schema: gqlSchema });

const serverPort = +(process.env.SERVER_PORT ?? '3000');

startStandaloneServer(server, {
  listen: { port: serverPort },
}).then(() => console.log(`API Server ready at port ${serverPort}`));
