import { schemaBuilder } from '../schema-builder';
import { prismaClient } from '../prisma-client';
import { MovieSortBy } from './enums/movie-sort-by';
import { SortDirection } from './enums/sort-direction';
import { Prisma } from '@prisma/client';

schemaBuilder.prismaNode('Movie', {
  id: { field: 'id' },
  fields: (t) => ({
    title: t.exposeString('title'),
    posterUrl: t.exposeString('posterUrl', { nullable: true }),
    releaseDate: t.field({
      type: 'DateTime',
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

    reviews: t.relatedConnection('reviews', { cursor: 'id' }),
    userScore: t.exposeFloat('userScore', { nullable: true }),
    userReviewCount: t.exposeInt('userReviewCount'),
    criticScore: t.exposeFloat('criticScore', { nullable: true }),
    criticReviewCount: t.exposeInt('criticReviewCount'),
    viewedUsers: t.relatedConnection('viewedUsers', { cursor: 'id' }),
    viewedUserCount: t.exposeInt('viewedUserCount'),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
  }),
});

function createOrderByQuery(
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
      nameContains: t.arg.string(),
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
          title: { contains: args.nameContains ?? undefined },
          genres: { some: { name: { in: args.genres ?? undefined } } },
          criticScore: {
            lte: args.maxCriticScore ?? 10,
            gte: args.minCriticScore ?? 0,
          },
          userScore: {
            lte: args.maxRegularScore ?? 10,
            gte: args.minRegularScore ?? 0,
          },
        },
        orderBy: createOrderByQuery(args.sortBy, args.sortDirection),
      }),
  }),
}));
