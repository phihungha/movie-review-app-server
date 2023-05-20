import { schemaBuilder } from '../schema-builder';

export const queryType = schemaBuilder.queryType({
  fields: (t) => ({
    ok: t.boolean({ resolve: () => true }),
  }),
});
