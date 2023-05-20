import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Genre', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    movies: t.relatedConnection('movies', { cursor: 'id' }),
  }),
});
