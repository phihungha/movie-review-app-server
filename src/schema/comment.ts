import { Prisma } from '@prisma/client';
import { prismaClient } from '../api-clients';
import { NotFoundError } from '../errors';
import { schemaBuilder } from '../schema-builder';

const MIN_COMMENT_LENGTH = 1;

schemaBuilder.prismaNode('Comment', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    review: t.relation('review'),
    postTime: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.postTime,
    }),
    lastUpdateTime: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastUpdateTime,
    }),
    content: t.exposeString('content'),
  }),
});

const CreateCommentInput = schemaBuilder.inputType('CreateCommentInput', {
  fields: (t) => ({
    reviewId: t.globalID({ required: true }),
    content: t.string({
      required: true,
      validate: { minLength: MIN_COMMENT_LENGTH },
    }),
  }),
});

const EditCommentInput = schemaBuilder.inputType('EditCommentInput', {
  fields: (t) => ({
    content: t.string({
      validate: { minLength: MIN_COMMENT_LENGTH },
    }),
  }),
});

schemaBuilder.mutationFields((t) => ({
  createComment: t.prismaField({
    type: 'Comment',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      input: t.arg({ type: CreateCommentInput, required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        const reviewId = +args.input.reviewId.id;
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;

        let review;
        try {
          review = await client.comment.create({
            ...query,
            data: {
              review: { connect: { id: reviewId } },
              author: { connect: { id: currentUserId } },
              content: args.input.content,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            throw new NotFoundError('Review not found');
          } else {
            throw err;
          }
        }

        client.review.update({
          where: { id: +args.input.reviewId.id },
          data: { commentCount: { increment: 1 } },
        });

        return review;
      }),
  }),

  editComment: t.prismaField({
    type: 'Comment',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
      input: t.arg({ type: EditCommentInput, required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const id = +args.id.id;

        const comment = await client.comment.update({
          ...query,
          where: { id },
          data: {
            content: args.input.content ?? undefined,
            lastUpdateTime: new Date(),
          },
        });

        if (comment.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        return comment;
      }),
  }),

  deleteComment: t.prismaField({
    type: 'Comment',
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

        const comment = await client.comment.update({
          ...query,
          where: { id },
          data: {
            content: '',
            isRemoved: true,
            lastUpdateTime: new Date(),
          },
        });

        if (comment.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        const commentCount = await client.comment.count({
          where: { reviewId: comment.reviewId, isRemoved: false },
        });
        await client.review.update({
          where: { id: comment.reviewId },
          data: { commentCount },
        });

        return comment;
      }),
  }),
}));
