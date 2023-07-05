import { schemaBuilder } from '../schema-builder';

schemaBuilder.prismaNode('CrewMember', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    workedOnMovies: t.relatedConnection('workedOnMovies', {
      cursor: 'crewId_movieId_role',
    }),
    actedMovies: t.relatedConnection('actedMovies', {
      cursor: 'crewId_movieId_characterName',
    }),
  }),
});
