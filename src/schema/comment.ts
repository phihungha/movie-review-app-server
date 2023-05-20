import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Comment', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    review: t.relation('review'),
    content: t.exposeString('content'),
  }),
});
