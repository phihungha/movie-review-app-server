import { schemaBuilder } from '../schema-builder';
import { MovieConnection } from './movie';

schemaBuilder.prismaNode('Company', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    producedMovies: t.relatedConnection(
      'producedMovies',
      { cursor: 'id' },
      MovieConnection
    ),
    distributedMovies: t.relatedConnection(
      'distributedMovies',
      {
        cursor: 'id',
      },
      MovieConnection
    ),
  }),
});
