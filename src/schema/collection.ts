import { schemaBuilder } from '../schema-builder';

schemaBuilder.prismaNode('Collection', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    name: t.exposeString('name'),
    creationTime: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.creationTime,
    }),
    lastUpdateTime: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastUpdateTime,
    }),
    movies: t.relatedConnection('movies', { cursor: 'id' }),
    likeUsers: t.relatedConnection('likeUsers', { cursor: 'id' }),
    likeCount: t.exposeInt('likeCount'),
  }),
});
