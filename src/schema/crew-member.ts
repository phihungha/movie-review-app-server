import { schemaBuilder } from '../schema-builder';
import { MovieConnection } from './movie';

schemaBuilder.prismaNode('CrewMember', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    directedMovies: t.relatedConnection(
      'directedMovies',
      { cursor: 'id' },
      MovieConnection
    ),
    writtenMovies: t.relatedConnection(
      'writtenMovies',
      { cursor: 'id' },
      MovieConnection
    ),
    dopMovies: t.relatedConnection(
      'directedMovies',
      { cursor: 'id' },
      MovieConnection
    ),
    scoredMovies: t.relatedConnection(
      'scoredMovies',
      { cursor: 'id' },
      MovieConnection
    ),
    editedMovies: t.relatedConnection(
      'editedMovies',
      { cursor: 'id' },
      MovieConnection
    ),
  }),
});
