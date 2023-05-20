import { schemaBuilder } from '../schema-builder';
import { Gender, UserType } from '@prisma/client';

schemaBuilder.prismaNode('User', {
  id: { field: 'id' },
  fields: (t) => ({
    username: t.exposeString('username'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    name: t.exposeString('name'),
    gender: t.field({
      type: Gender,
      nullable: true,
      resolve: (parent) => parent.gender,
    }),
    dateOfBirth: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.dateOfBirth,
    }),
    userType: t.field({
      type: UserType,
      resolve: (parent) => parent.userType,
    }),

    reviews: t.relatedConnection('reviews', { cursor: 'id' }),
    reviewThanks: t.relatedConnection('reviewThanks', { cursor: 'id' }),
    comments: t.relatedConnection('comments', { cursor: 'id' }),
    viewedMovies: t.relatedConnection('viewedMovies', { cursor: 'id' }),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
    likedCollections: t.relatedConnection('likedCollections', { cursor: 'id' }),
  }),
});
