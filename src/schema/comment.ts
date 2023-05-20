import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Comment', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    review: t.relation('review'),
    postTime: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.postTime,
    }),
    lastUpdateTime: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastUpdateTime,
    }),
    content: t.exposeString('content'),
  }),
});
