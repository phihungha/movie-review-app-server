import { Prisma, Review, UserType } from '@prisma/client';
import { schemaBuilder } from '../schema-builder';
import { prismaClient } from '../api-clients';
import { PrismaTxClient } from '../types';
import { AlreadyExistsError, NotFoundError } from '../errors';

schemaBuilder.prismaNode('Review', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    movie: t.relation('movie'),
    authorType: t.field({
      type: UserType,
      resolve: (parent) => parent.authorType,
    }),
    title: t.exposeString('title'),
    postTime: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.postTime,
    }),
    content: t.exposeString('content'),
    score: t.exposeInt('score'),
    externalUrl: t.exposeString('externalUrl', { nullable: true }),
    thankUsers: t.relatedConnection('thankUsers', { cursor: 'id' }),
    thankCount: t.exposeInt('thankCount'),
    comments: t.relatedConnection('comments', {
      cursor: 'id',
      query: { orderBy: { postTime: 'desc' } },
    }),
    commentCount: t.exposeInt('commentCount'),
    isThankedByViewer: t.boolean({
      nullable: true,
      resolve: async (parent, _, context) => {
        if (!context.currentUser) {
          return null;
        }
        const result = await prismaClient.review.findUnique({
          where: { id: parent.id },
          include: { thankUsers: { where: { id: context.currentUser.id } } },
        });
        return result?.thankUsers.length === 1;
      },
    }),
  }),
});

schemaBuilder.queryField('review', (t) =>
  t.prismaField({
    type: 'Review',
    nullable: true,
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args) =>
      prismaClient.review.findUnique({
        ...query,
        where: { id: +args.id.id },
      }),
  })
);

async function updateAggregateData(txClient: PrismaTxClient, review: Review) {
  const movieId = review.movieId;
  const authorType = review.authorType;

  const aggregateResult = await txClient.review.aggregate({
    _avg: { score: true },
    _count: { id: true },
    where: { movieId, authorType },
  });
  const aggregateScore = aggregateResult._avg.score;
  const reviewCount = aggregateResult._count.id;

  let updateData;
  if (authorType === UserType.Critic) {
    updateData = {
      criticScore: aggregateScore,
      criticReviewCount: reviewCount,
    };
  } else {
    updateData = {
      regularScore: aggregateScore,
      regularReviewCount: reviewCount,
    };
  }

  await txClient.movie.update({
    where: { id: movieId },
    data: { ...updateData },
  });
}

const CreateReviewInput = schemaBuilder.inputType('CreateReviewInput', {
  fields: (t) => ({
    movieId: t.globalID({ required: true }),
    title: t.string({ required: true, validate: { minLength: 1 } }),
    content: t.string({ required: true, validate: { minLength: 1 } }),
    score: t.int({ required: true, validate: { min: 0, max: 10 } }),
    externalUrl: t.string({ validate: { url: true } }),
  }),
});

const EditReviewInput = schemaBuilder.inputType('EditReviewInput', {
  fields: (t) => ({
    title: t.string({ validate: { minLength: 1 } }),
    score: t.int({ validate: { min: 0, max: 10 } }),
    content: t.string({ validate: { minLength: 1 } }),
    externalUrl: t.string({ validate: { url: true } }),
  }),
});

schemaBuilder.mutationFields((t) => ({
  createReview: t.prismaField({
    type: 'Review',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError, AlreadyExistsError],
    },
    args: {
      input: t.arg({ type: CreateReviewInput, required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUser = context.currentUser!;

        const existingReviews = await client.review.findMany({
          where: { authorId: currentUser.id, movieId: +args.input.movieId.id },
        });
        if (existingReviews.length !== 0) {
          throw new AlreadyExistsError(
            'Review',
            "You've already made a review for this movie. Please edit it instead of making a new one"
          );
        }

        let review;
        try {
          review = await client.review.create({
            ...query,
            data: {
              title: args.input.title,
              content: args.input.content,
              score: args.input.score,
              movie: { connect: { id: +args.input.movieId.id } },
              author: { connect: { id: currentUser.id } },
              authorType: currentUser.userType,
              externalUrl: args.input.externalUrl,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            throw new NotFoundError('Movie not found');
          } else {
            throw err;
          }
        }

        await updateAggregateData(client, review);

        return review;
      }),
  }),

  editReview: t.prismaField({
    type: 'Review',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
      input: t.arg({ type: EditReviewInput, required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;

        let review;
        try {
          review = await client.review.update({
            ...query,
            where: { id: +args.id.id },
            data: {
              title: args.input.title ?? undefined,
              content: args.input.content ?? undefined,
              score: args.input.score ?? undefined,
              externalUrl: args.input.externalUrl,
              lastUpdateTime: new Date(),
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            throw new NotFoundError();
          } else {
            throw err;
          }
        }

        if (review.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        await updateAggregateData(client, review);

        return review;
      }),
  }),

  deleteReview: t.prismaField({
    type: 'Review',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const id = +args.id.id;

        let review;
        try {
          review = await client.review.delete({
            ...query,
            where: { id },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            throw new NotFoundError();
          } else {
            throw err;
          }
        }

        if (review.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        await updateAggregateData(client, review);

        return review;
      }),
  }),

  thankReview: t.prismaField({
    type: 'Review',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      reviewId: t.arg.globalID({ required: true }),
      thank: t.arg.boolean({ required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const userIdUpdateData = { id: currentUserId };
        const id = +args.reviewId.id;

        let result;
        try {
          result = await client.review.update({
            select: {
              _count: {
                select: {
                  thankUsers: true,
                },
              },
            },
            where: { id },
            data: {
              thankUsers: args.thank
                ? { connect: userIdUpdateData }
                : { disconnect: userIdUpdateData },
            },
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

        const thankCount = result._count.thankUsers;
        return await client.review.update({
          ...query,
          where: { id },
          data: { thankCount },
        });
      }),
  }),
}));
