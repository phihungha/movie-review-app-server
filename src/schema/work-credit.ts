import { CrewWorkRole } from '@prisma/client';
import { schemaBuilder } from '../schema-builder';

schemaBuilder.prismaNode('WorkCredit', {
  id: { field: 'crewId_movieId_role' },
  fields: (t) => ({
    crew: t.relation('crew'),
    movie: t.relation('movie'),
    role: t.field({ type: CrewWorkRole, resolve: (parent) => parent.role }),
  }),
});
