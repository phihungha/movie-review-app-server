import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Company', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    producedMovies: t.relatedConnection('producedMovies', { cursor: 'id' }),
    distributedMovies: t.relatedConnection('distributedMovies', {
      cursor: 'id',
    }),
  }),
});
