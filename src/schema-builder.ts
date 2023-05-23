import SchemaBuilder from '@pothos/core';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ErrorsPlugin from '@pothos/plugin-errors';
import ValidationPlugin from '@pothos/plugin-validation';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { Context } from './types';
import { prismaClient } from './prisma-client';

export const schemaBuilder = new SchemaBuilder<{
  Context: Context;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    Date: {
      Input: Date;
      Output: Date;
    };
  };
  PrismaTypes: PrismaTypes;
}>({
  plugins: [
    RelayPlugin,
    ScopeAuthPlugin,
    ErrorsPlugin,
    ValidationPlugin,
    PrismaPlugin,
  ],
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
  authScopes: async (context) => ({
    user: context.currentUser ? true : false,
  }),
  errorOptions: {
    defaultTypes: [],
  },
  prisma: {
    client: prismaClient,
    filterConnectionTotalCount: true,
  },
});