import SchemaBuilder from '@pothos/core';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ErrorsPlugin from '@pothos/plugin-errors';
import ValidationPlugin from '@pothos/plugin-validation';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { Context } from './types';
import { prismaClient } from './api-clients';
import { UserType } from '@prisma/client';
import { ZodError } from 'zod';

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
    ErrorsPlugin,
    ValidationPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    ValidationPlugin,
    PrismaPlugin,
  ],
  errorOptions: {
    defaultTypes: [Error, ZodError],
  },
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
  authScopes: (context) => ({
    criticUser: context.currentUser?.userType === UserType.Critic,
    regularUser: context.currentUser?.userType === UserType.Regular,
  }),
  prisma: {
    client: prismaClient,
    filterConnectionTotalCount: true,
  },
});
