import SchemaBuilder from '@pothos/core';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ErrorsPlugin from '@pothos/plugin-errors';
import ValidationPlugin from '@pothos/plugin-validation';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { Context } from './types';
import { prismaClient } from './prisma-client';
import { UserType } from '@prisma/client';

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
    Jwt: {
      Input: string;
      Output: string;
    };
  };
  PrismaTypes: PrismaTypes;
  AuthScopes: {
    regularUser: boolean;
    criticUser: boolean;
  };
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
  authScopes: (context) => ({
    criticUser: context.currentUser?.userType === UserType.Critic,
    regularUser: context.currentUser?.userType === UserType.Regular,
  }),
  errorOptions: {
    defaultTypes: [],
  },
  prisma: {
    client: prismaClient,
    filterConnectionTotalCount: true,
  },
});
