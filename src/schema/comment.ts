import { Prisma } from '@prisma/client';
import { prismaClient } from '../api-clients';
import { NotFoundError } from '../errors';
import { schemaBuilder } from '../schema-builder';
import { ConnectionObjectType } from '../types';

const MIN_COMMENT_LENGTH = 1;

const Comment = schemaBuilder.prismaNode('Comment', {
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
    isMine: t.boolean({
      nullable: true,
      resolve: async (parent, _, context) => {
        if (!context.currentUser) {
          return null;
        }
        return parent.authorId === context.currentUser.id;
      },
    }),
  }),
});

export const CommentConnection: ConnectionObjectType =
  schemaBuilder.connectionObject({
    type: Comment,
    name: 'CommentConnection',
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
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const reviewId = +args.input.reviewId.id;

        try {
          await client.review.update({
            where: { id: reviewId },
            data: { commentCount: { increment: 1 } },
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

        return await client.comment.create({
          ...query,
          data: {
            review: { connect: { id: reviewId } },
            author: { connect: { id: currentUserId } },
            content: args.input.content,
          },
        });
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

        const comment = await client.comment.findUnique({ where: { id } });
        if (
          !comment ||
          comment.authorId !== currentUserId ||
          comment.isRemoved
        ) {
          throw new NotFoundError();
        }

        await client.review.update({
          where: { id: comment.reviewId },
          data: { commentCount: { decrement: 1 } },
        });

        return await client.comment.update({
          ...query,
          where: { id },
          data: {
            content: '',
            isRemoved: true,
            lastUpdateTime: new Date(),
          },
        });
      }),
  }),
}));
