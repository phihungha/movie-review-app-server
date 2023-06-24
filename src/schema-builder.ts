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
import { AuthError } from './errors';

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
    newUser: boolean;
  };
}>({
  plugins: [
    ErrorsPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    ValidationPlugin,
    PrismaPlugin,
  ],
  errorOptions: {
    defaultTypes: [Error, AuthError, ZodError],
  },
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
  },
  authScopes: (context) => ({
    criticUser: context.currentUser?.userType === UserType.Critic,
    regularUser: context.currentUser?.userType === UserType.Regular,
    newUser: context.decodedIdToken !== null && context.currentUser === null,
  }),
  scopeAuthOptions: {
    unauthorizedError: (_, context) => {
      if (context.decodedIdToken !== null && context.currentUser === null) {
        return new AuthError('User needs to update personal info');
      }
      return new AuthError('Not authorized');
    },
  },
  prisma: {
    client: prismaClient,
    filterConnectionTotalCount: true,
  },
});
