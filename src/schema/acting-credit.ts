import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('ActingCredit', {
  id: { field: 'crewId_movieId' },
  fields: (t) => ({
    actor: t.relation('crew'),
    movie: t.relation('movie'),
    characterName: t.exposeString('characterName'),
  }),
});
