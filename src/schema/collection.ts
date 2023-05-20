import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Collection', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    name: t.exposeString('name'),
    movies: t.relatedConnection('movies', { cursor: 'id' }),
    likeUsers: t.relatedConnection('likeUsers', { cursor: 'id' }),
    likeCount: t.exposeInt('likeCount'),
  }),
});
