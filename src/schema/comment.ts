import { prismaClient } from '../prisma-client';
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

schemaBuilder.mutationField('createComment', (t) =>
  t.prismaField({
    type: 'Comment',
    authScopes: { user: true },
    args: {
      input: t.arg({ type: CreateCommentInput, required: true }),
    },
    resolve: async (query, _, args, context) =>
      (
        await prismaClient.$transaction([
          prismaClient.comment.create({
            ...query,
            data: {
              review: { connect: { id: +args.input.reviewId.id } },
              author: { connect: { id: context.currentUser!.id } },
              content: args.input.content,
            },
          }),
          prismaClient.review.update({
            where: { id: +args.input.reviewId.id },
            data: {
              commentCount: { increment: 1 },
            },
          }),
        ])
      )[0],
  })
);

const EditCommentInput = schemaBuilder.inputType('EditCommentInput', {
  fields: (t) => ({
    content: t.string({ required: true }),
  }),
});

schemaBuilder.mutationField('editComment', (t) =>
  t.prismaField({
    type: 'Comment',
    authScopes: { user: true },
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
  })
);

schemaBuilder.mutationField('deleteComment', (t) =>
  t.prismaField({
    type: 'Comment',
    authScopes: { user: true },
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
  })
);
