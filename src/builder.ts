import SchemaBuilder from '@pothos/core';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ErrorsPlugin from '@pothos/plugin-errors';
import ValidationPlugin from '@pothos/plugin-validation';
import { Context } from './types';

export const schemaBuilder = new SchemaBuilder<{ Context: Context }>({
  plugins: [RelayPlugin, ScopeAuthPlugin, ErrorsPlugin, ValidationPlugin],
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
});
