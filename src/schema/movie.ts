import { schemaBuilder } from '../schema-builder';
import { prismaClient } from '../prisma-client';
import { MovieSortBy } from './enums/movie-sort-by';
import { SortDirection } from './enums/sort-direction';
import { Prisma } from '@prisma/client';
import { ReviewSortBy } from './enums/review-sort-by';

export function createReviewsOrderByQuery(
  sortByArgValue: ReviewSortBy | undefined | null,
  sortDirection: SortDirection | undefined | null
): Prisma.Enumerable<Prisma.ReviewOrderByWithRelationInput> | undefined {
  if (sortByArgValue === undefined || sortByArgValue === null) {
    return { postTime: 'desc' };
  }
  const orderByDirection = sortDirection === SortDirection.Asc ? 'asc' : 'desc';
  switch (sortByArgValue) {
    case ReviewSortBy.PostTime:
      return { postTime: orderByDirection };
    case ReviewSortBy.Score:
      return { score: orderByDirection };
    case ReviewSortBy.ThankCount:
      return { thankCount: orderByDirection };
    case ReviewSortBy.CommentCount:
      return { commentCount: orderByDirection };
  }
}

schemaBuilder.prismaNode('Movie', {
  id: { field: 'id' },
  fields: (t) => ({
    title: t.exposeString('title'),
    posterUrl: t.exposeString('posterUrl', { nullable: true }),
    releaseDate: t.field({
      type: 'Date',
      resolve: (parent) => parent.releaseDate,
    }),
    runningTime: t.exposeInt('runningTime'),
    genres: t.relation('genres'),
    productionCompanies: t.relation('productionCompanies'),
    distributedCompanies: t.relation('distributionCompanies'),

    directors: t.relation('directors'),
    writers: t.relation('writers'),
    dops: t.relation('dops'),
    editors: t.relation('editors'),
    composers: t.relation('composers'),
    actingCredits: t.relation('actingCredits'),

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

    userScore: t.exposeFloat('userScore', { nullable: true }),
    userReviewCount: t.exposeInt('userReviewCount'),
    criticScore: t.exposeFloat('criticScore', { nullable: true }),
    criticReviewCount: t.exposeInt('criticReviewCount'),
    viewedUsers: t.relatedConnection('viewedUsers', { cursor: 'id' }),
    viewedUserCount: t.exposeInt('viewedUserCount'),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
  }),
});

function createMoviesOrderByQuery(
  sortByArgValue: MovieSortBy | undefined | null,
  sortDirection: SortDirection | undefined | null
): Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput> | undefined {
  if (sortByArgValue === undefined || sortByArgValue === null) {
    return { releaseDate: 'desc' };
  }
  const orderByDirection = sortDirection === SortDirection.Asc ? 'asc' : 'desc';
  switch (sortByArgValue) {
    case MovieSortBy.title:
      return { title: orderByDirection };
    case MovieSortBy.releaseDate:
      return { releaseDate: orderByDirection };
    case MovieSortBy.criticScore:
      return { criticScore: orderByDirection };
    case MovieSortBy.regularScore:
      return { userScore: orderByDirection };
    case MovieSortBy.viewedUserCount:
      return { viewedUserCount: orderByDirection };
  }
}

schemaBuilder.queryFields((t) => ({
  movies: t.prismaConnection({
    type: 'Movie',
    cursor: 'id',
    args: {
      titleContains: t.arg.string(),
      genres: t.arg.stringList(),
      minRegularScore: t.arg.int(),
      maxRegularScore: t.arg.int(),
      minCriticScore: t.arg.int(),
      maxCriticScore: t.arg.int(),
      sortBy: t.arg({ type: MovieSortBy }),
      sortDirection: t.arg({ type: SortDirection }),
    },
    resolve: async (query, root, args, ctx, info) =>
      prismaClient.movie.findMany({
        ...query,
        where: {
          title: {
            contains: args.titleContains ?? undefined,
            mode: 'insensitive',
          },
          genres: {
            some: {
              name: { in: args.genres ?? undefined, mode: 'insensitive' },
            },
          },
          criticScore: {
            lte: args.maxCriticScore ?? 10,
            gte: args.minCriticScore ?? 0,
          },
          userScore: {
            lte: args.maxRegularScore ?? 10,
            gte: args.minRegularScore ?? 0,
          },
        },
        orderBy: createMoviesOrderByQuery(args.sortBy, args.sortDirection),
      }),
  }),
  movie: t.prismaField({
    type: 'Movie',
    nullable: true,
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, root, args, ctx, info) =>
      prismaClient.movie.findUnique({
        ...query,
        where: { id: +args.id.id },
      }),
  }),
}));
