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
