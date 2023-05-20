import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('User', {
  id: { field: 'id' },
  fields: (t) => ({
    username: t.exposeString('username'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    name: t.exposeString('name'),
    reviews: t.relatedConnection('reviews', { cursor: 'id' }),
    reviewThanks: t.relatedConnection('reviewThanks', { cursor: 'id' }),
    comments: t.relatedConnection('comments', { cursor: 'id' }),
    viewedMovies: t.relatedConnection('viewedMovies', { cursor: 'id' }),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
    likedCollections: t.relatedConnection('likedCollections', { cursor: 'id' }),
  }),
});
