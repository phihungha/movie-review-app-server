import { schemaBuilder } from '../schema-builder';
import { Gender, UserType } from '@prisma/client';
import { ReviewSortBy } from './enums/review-sort-by';
import { SortDirection } from './enums/sort-direction';
import { createReviewsOrderByQuery } from './movie';
import { prismaClient } from '../prisma-client';

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

    reviews: t.relatedConnection('reviews', {
      cursor: 'id',
      args: {
        searchTerm: t.arg.string(),
        minScore: t.arg.int(),
        maxScore: t.arg.int(),
        sortBy: t.arg({ type: ReviewSortBy }),
        sortDirection: t.arg({ type: SortDirection }),
      },
      query: (args) => ({
        where: {
          score: { gte: args.minScore ?? 0, lte: args.maxScore ?? 10 },
          OR: [
            { title: { contains: args.searchTerm ?? '', mode: 'insensitive' } },
            {
              content: { contains: args.searchTerm ?? '', mode: 'insensitive' },
            },
          ],
        },
        orderBy: createReviewsOrderByQuery(args.sortBy, args.sortDirection),
      }),
    }),

    reviewThanks: t.relatedConnection('reviewThanks', { cursor: 'id' }),

    comments: t.relatedConnection('comments', {
      cursor: 'id',
      args: {
        contentContains: t.arg.string(),
      },
      query: (args) => ({
        where: {
          content: {
            contains: args.contentContains ?? '',
            mode: 'insensitive',
          },
        },
        orderBy: { postTime: 'desc' },
      }),
    }),

    viewedMovies: t.relatedConnection('viewedMovies', { cursor: 'id' }),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
    likedCollections: t.relatedConnection('likedCollections', { cursor: 'id' }),
  }),
});

schemaBuilder.queryFields((t) => ({
  users: t.prismaConnection({
    type: 'User',
    cursor: 'id',
    args: {
      name: t.arg.string(),
    },
    resolve: (query, parent, args, context, info) =>
      prismaClient.user.findMany({
        ...query,
        where: { name: { contains: args.name ?? undefined } },
      }),
  }),
  user: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, parent, args, context, info) =>
      prismaClient.user.findUnique({
        ...query,
        where: { id: +args.id.id },
      }),
  }),
}));
