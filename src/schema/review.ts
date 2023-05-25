import { UserType } from '@prisma/client';
import { schemaBuilder } from '../schema-builder';
import { prismaClient } from '../prisma-client';

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

const CreateReviewInput = schemaBuilder.inputType('CreateReviewInput', {
  fields: (t) => ({
    movieId: t.globalID({ required: true }),
    title: t.string({ required: true }),
    content: t.string({ required: true }),
    score: t.int({ required: true }),
    externalUrl: t.string(),
  }),
});

schemaBuilder.mutationField('createReview', (t) =>
  t.prismaField({
    type: 'Review',
    authScopes: { user: true },
    args: {
      input: t.arg({ type: CreateReviewInput, required: true }),
    },
    resolve: async (query, _, args, context) =>
      await prismaClient.review.create({
        ...query,
        data: {
          title: args.input.title,
          content: args.input.content,
          score: args.input.score,
          movie: { connect: { id: +args.input.movieId.id } },
          author: { connect: { id: context.currentUser!.id } },
          authorType: context.currentUser!.userType,
          externalUrl: args.input.externalUrl,
        },
      }),
  })
);

const EditReviewInput = schemaBuilder.inputType('EditReviewInput', {
  fields: (t) => ({
    title: t.string(),
    content: t.string(),
    externalUrl: t.string(),
  }),
});

schemaBuilder.mutationField('editReview', (t) =>
  t.prismaField({
    type: 'Review',
    authScopes: { user: true },
    args: {
      id: t.arg.globalID({ required: true }),
      input: t.arg({ type: EditReviewInput, required: true }),
    },
    resolve: async (query, _, args) =>
      await prismaClient.review.update({
        ...query,
        where: { id: +args.id.id },
        data: {
          title: args.input.title ?? undefined,
          content: args.input.content ?? undefined,
          externalUrl: args.input.externalUrl,
        },
      }),
  })
);

schemaBuilder.mutationField('deleteReview', (t) =>
  t.prismaField({
    type: 'Review',
    authScopes: { user: true },
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: async (query, _, args) =>
      await prismaClient.review.delete({
        ...query,
        where: { id: +args.id.id },
      }),
  })
);

schemaBuilder.mutationField('thankReview', (t) =>
  t.prismaField({
    type: 'Review',
    authScopes: { user: true },
    args: {
      reviewId: t.arg.globalID({ required: true }),
      thank: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _, args, context) => {
      const currentUserId = context.currentUser!.id;
      const userIdData = { id: currentUserId };
      const result = await prismaClient.review.update({
        select: {
          _count: {
            select: {
              thankUsers: true,
            },
          },
        },
        where: { id: +args.reviewId.id },
        data: {
          thankUsers: args.thank
            ? { connect: userIdData }
            : { disconnect: userIdData },
        },
      });
      const thankCount = result._count.thankUsers;
      return await prismaClient.review.update({
        ...query,
        where: { id: +args.reviewId.id },
        data: {
          thankCount,
        },
      });
    },
  })
);
