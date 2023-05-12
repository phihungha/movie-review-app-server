import { schemaBuilder } from '../builder';

export const errorType = schemaBuilder.objectType(Error, {
  name: 'Error',
  fields: (t) => ({
    message: t.exposeString('name'),
  }),
});
