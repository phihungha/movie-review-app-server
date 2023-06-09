import { AuthError } from '../errors';
import { schemaBuilder } from '../schema-builder';

const ErrorInterface = schemaBuilder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

schemaBuilder.objectType(Error, {
  name: 'BaseError',
  interfaces: [ErrorInterface],
});

schemaBuilder.objectType(AuthError, {
  name: 'AuthError',
  interfaces: [ErrorInterface],
});
