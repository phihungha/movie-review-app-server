import { schemaBuilder } from '../schema-builder';

schemaBuilder.prismaNode('ActingCredit', {
  id: { field: 'crewId_movieId_characterName' },
  fields: (t) => ({
    actor: t.relation('crew'),
    movie: t.relation('movie'),
    characterName: t.exposeString('characterName'),
  }),
});
