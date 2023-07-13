import { schemaBuilder } from '../schema-builder';
import { prismaClient } from '../api-clients';
import { MovieSortBy } from './enums/movie-sort-by';
import { SortDirection } from './enums/sort-direction';
import { Gender, Prisma, UserType, Review as ReviewDb } from '@prisma/client';
import { ReviewSortBy } from './enums/review-sort-by';
import { NotFoundError } from '../errors';
import { calcDateOfBirthFromAge } from '../utils';
import { reviewScoreSchema } from '../validation-schemas';
import { Review, ReviewConnection } from './review';
import { UserConnection } from './user';
import { CollectionConnection } from './collection';
import { ConnectionObjectType } from '../types';

export function getReviewsOrderByQuery(
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

const Movie = schemaBuilder.prismaNode('Movie', {
  id: { field: 'id' },
  fields: (t) => ({
    title: t.exposeString('title'),
    posterUrl: t.exposeString('posterUrl', { nullable: true }),
    releaseDate: t.field({
      type: 'Date',
      resolve: (parent) => parent.releaseDate,
    }),
    runningTime: t.exposeInt('runningTime'),
    synopsis: t.exposeString('synopsis', { nullable: true }),
    genres: t.relation('genres'),
    productionCompanies: t.relation('productionCompanies'),
    distributedCompanies: t.relation('distributionCompanies'),
    workCredits: t.relation('workCredits'),
    actingCredits: t.relation('actingCredits'),

    criticReviews: t.relatedConnection(
      'reviews',
      {
        cursor: 'id',
        args: {
          textContains: t.arg.string(),
          minScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
          maxScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
          sortBy: t.arg({ type: ReviewSortBy }),
          sortDirection: t.arg({ type: SortDirection }),
        },
        query: (args) => ({
          where: {
            authorType: UserType.Critic,
            score: { gte: args.minScore ?? 0, lte: args.maxScore ?? 10 },
            OR: [
              {
                title: {
                  contains: args.textContains ?? '',
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: args.textContains ?? '',
                  mode: 'insensitive',
                },
              },
            ],
          },
          orderBy: getReviewsOrderByQuery(args.sortBy, args.sortDirection),
        }),
      },
      ReviewConnection
    ),
    regularReviews: t.relatedConnection(
      'reviews',
      {
        cursor: 'id',
        args: {
          textContains: t.arg.string(),
          minScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
          maxScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
          sortBy: t.arg({ type: ReviewSortBy }),
          sortDirection: t.arg({ type: SortDirection }),
        },
        query: (args) => ({
          where: {
            authorType: UserType.Regular,
            score: { gte: args.minScore ?? 0, lte: args.maxScore ?? 10 },
            OR: [
              {
                title: {
                  contains: args.textContains ?? '',
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: args.textContains ?? '',
                  mode: 'insensitive',
                },
              },
            ],
          },
          orderBy: getReviewsOrderByQuery(args.sortBy, args.sortDirection),
        }),
      },
      ReviewConnection
    ),
    viewerReview: t.prismaField({
      type: Review,
      nullable: true,
      resolve: async (query, parent, _, context) => {
        if (!context.currentUser?.id) {
          return null;
        }

        const result = await prismaClient.review.findMany({
          ...query,
          where: { authorId: context.currentUser?.id, movieId: parent.id },
        });
        return result.length === 0 ? null : result[0];
      },
    }),

    regularScore: t.exposeFloat('regularScore', { nullable: true }),
    regularReviewCount: t.exposeInt('regularReviewCount'),
    criticScore: t.exposeFloat('criticScore', { nullable: true }),
    criticReviewCount: t.exposeInt('criticReviewCount'),
    regularScoreByCriteria: t.float({
      nullable: true,
      args: {
        gender: t.arg({ type: Gender }),
        minAge: t.arg.int({ validate: { min: 0 } }),
        maxAge: t.arg.int({ validate: { min: 0 } }),
      },
      resolve: async (parent, args) => {
        const result = await prismaClient.review.aggregate({
          _avg: {
            score: true,
          },
          where: {
            movieId: parent.id,
            authorType: UserType.Regular,
            author: {
              gender: args.gender,
              dateOfBirth: {
                lte: args.minAge
                  ? calcDateOfBirthFromAge(args.minAge)
                  : undefined,
                gte: args.maxAge
                  ? calcDateOfBirthFromAge(args.maxAge)
                  : undefined,
              },
            },
          },
        });
        return result._avg.score;
      },
    }),
    numberOfReviewsPerScore: t.int({
      args: {
        score: t.arg.int({
          required: true,
          validate: { schema: reviewScoreSchema },
        }),
        authorType: t.arg({ type: UserType, required: true }),
      },
      resolve: (parent, args) =>
        prismaClient.review.count({
          where: {
            movieId: parent.id,
            authorType: args.authorType,
            score: args.score,
          },
        }),
    }),

    viewedUsers: t.relatedConnection(
      'viewedUsers',
      { cursor: 'id' },
      UserConnection
    ),
    viewedUserCount: t.exposeInt('viewedUserCount'),
    isViewedByViewer: t.boolean({
      nullable: true,
      resolve: async (parent, _, context) => {
        if (!context.currentUser) {
          return null;
        }
        const result = await prismaClient.movie.findUnique({
          where: { id: parent.id },
          include: { viewedUsers: { where: { id: context.currentUser.id } } },
        });
        return result?.viewedUsers.length === 1;
      },
    }),

    collections: t.relatedConnection(
      'collections',
      { cursor: 'id' },
      CollectionConnection
    ),
  }),
});

export const MovieConnection: ConnectionObjectType =
  schemaBuilder.connectionObject({
    type: Movie,
    name: 'MovieConnection',
  });

function getMoviesOrderByQuery(
  sortByArgValue: MovieSortBy | undefined | null,
  sortDirection: SortDirection | undefined | null
): Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput> | undefined {
  if (sortByArgValue === undefined || sortByArgValue === null) {
    return { releaseDate: 'desc' };
  }
  const orderByDirection = sortDirection === SortDirection.Asc ? 'asc' : 'desc';
  switch (sortByArgValue) {
    case MovieSortBy.Title:
      return { title: orderByDirection };
    case MovieSortBy.ReleaseDate:
      return { releaseDate: orderByDirection };
    case MovieSortBy.CriticScore:
      return { criticScore: orderByDirection };
    case MovieSortBy.RegularScore:
      return { regularScore: orderByDirection };
    case MovieSortBy.ViewedUserCount:
      return { viewedUserCount: orderByDirection };
  }
}

function calcTrendingDateLimit(): Date {
  const today = new Date();
  today.setDate(-60);
  return today;
}

schemaBuilder.queryFields((t) => ({
  movies: t.prismaConnection(
    {
      type: 'Movie',
      cursor: 'id',
      args: {
        titleContains: t.arg.string(),
        genres: t.arg.stringList(),
        releaseYear: t.arg.int({
          validate: { min: 1900, max: new Date().getFullYear() },
        }),
        minRegularScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
        maxRegularScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
        minCriticScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
        maxCriticScore: t.arg.int({ validate: { schema: reviewScoreSchema } }),
        sortBy: t.arg({ type: MovieSortBy }),
        sortDirection: t.arg({ type: SortDirection }),
      },
      resolve: async (query, _, args) =>
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
            releaseDate: args.releaseYear
              ? {
                  gte: new Date(args.releaseYear, 0, 1),
                  lte: new Date(args.releaseYear, 11, 31),
                }
              : undefined,
            criticScore: {
              lte: args.maxCriticScore ?? undefined,
              gte: args.minCriticScore ?? undefined,
            },
            regularScore: {
              lte: args.maxRegularScore ?? undefined,
              gte: args.minRegularScore ?? undefined,
            },
          },
          orderBy: getMoviesOrderByQuery(args.sortBy, args.sortDirection),
        }),
    },
    MovieConnection
  ),

  trendingMovies: t.prismaConnection(
    {
      type: 'Movie',
      cursor: 'id',
      resolve: (query) =>
        prismaClient.movie.findMany({
          ...query,
          where: {
            releaseDate: { gte: calcTrendingDateLimit() },
          },
          orderBy: {
            viewedUserCount: 'desc',
          },
        }),
    },
    MovieConnection
  ),

  justReleasedMovies: t.prismaConnection(
    {
      type: 'Movie',
      cursor: 'id',
      resolve: (query) =>
        prismaClient.movie.findMany({
          ...query,
          orderBy: { releaseDate: 'desc' },
        }),
    },
    MovieConnection
  ),

  movie: t.prismaField({
    type: 'Movie',
    nullable: true,
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args) =>
      prismaClient.movie.findUnique({
        ...query,
        where: { id: +args.id.id },
      }),
  }),
}));

schemaBuilder.mutationFields((t) => ({
  markMovieAsViewed: t.prismaField({
    type: 'Movie',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
      isViewed: t.arg.boolean({ required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const userId = context.currentUser!.id;

        let viewedUsersUpdateQuery;
        if (args.isViewed) {
          viewedUsersUpdateQuery = {
            connect: { id: userId },
          };
        } else {
          viewedUsersUpdateQuery = {
            disconnect: { id: userId },
          };
        }

        let movie;
        try {
          movie = await client.movie.update({
            select: {
              _count: {
                select: {
                  viewedUsers: true,
                },
              },
            },
            where: { id: +args.id.id },
            data: { viewedUsers: viewedUsersUpdateQuery },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2016'
          ) {
            throw new NotFoundError();
          } else {
            throw err;
          }
        }

        return await client.movie.update({
          ...query,
          where: { id: +args.id.id },
          data: { viewedUserCount: movie._count.viewedUsers },
        });
      }),
  }),
}));
