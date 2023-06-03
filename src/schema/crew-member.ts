import { schemaBuilder } from '../schema-builder';

schemaBuilder.prismaNode('CrewMember', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    directedMovies: t.relatedConnection('directedMovies', { cursor: 'id' }),
    writtenMovies: t.relatedConnection('writtenMovies', { cursor: 'id' }),
    dopMovies: t.relatedConnection('directedMovies', { cursor: 'id' }),
    scoredMovies: t.relatedConnection('scoredMovies', { cursor: 'id' }),
    editedMovies: t.relatedConnection('editedMovies', { cursor: 'id' }),
  }),
});
