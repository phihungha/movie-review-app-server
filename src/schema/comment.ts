import { prismaClient } from '../api-clients';
import { schemaBuilder } from '../schema-builder';

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
    content: t.string({ required: true }),
  }),
});

const EditCommentInput = schemaBuilder.inputType('EditCommentInput', {
  fields: (t) => ({
    content: t.string({ required: true }),
  }),
});

schemaBuilder.mutationFields((t) => ({
  createComment: t.prismaField({
    type: 'Comment',
    authScopes: { regularUser: true, criticUser: true },
    args: {
      input: t.arg({ type: CreateCommentInput, required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        const review = await client.comment.create({
          ...query,
          data: {
            review: { connect: { id: +args.input.reviewId.id } },
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            author: { connect: { id: context.currentUser!.id } },
            content: args.input.content,
          },
        });
        client.review.update({
          where: { id: +args.input.reviewId.id },
          data: {
            commentCount: { increment: 1 },
          },
        });
        return review;
      }),
  }),
  editComment: t.prismaField({
    type: 'Comment',
    authScopes: { regularUser: true, criticUser: true },
    args: {
      id: t.arg.globalID({ required: true }),
      input: t.arg({ type: EditCommentInput, required: true }),
    },
    resolve: (query, _, args) =>
      prismaClient.comment.update({
        ...query,
        where: { id: +args.id.id },
        data: {
          content: args.input.content,
          lastUpdateTime: new Date(),
        },
      }),
  }),
  deleteComment: t.prismaField({
    type: 'Comment',
    authScopes: { regularUser: true, criticUser: true },
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args) =>
      prismaClient.$transaction(async (client) => {
        const comment = await client.comment.update({
          ...query,
          where: { id: +args.id.id },
          data: {
            content: '',
            isRemoved: true,
            lastUpdateTime: new Date(),
          },
        });

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
