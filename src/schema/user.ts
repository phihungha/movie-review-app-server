import { schemaBuilder } from '../schema-builder';
import { Gender, User, UserType } from '@prisma/client';
import { ReviewSortBy } from './enums/review-sort-by';
import { SortDirection } from './enums/sort-direction';
import { createReviewsOrderByQuery } from './movie';
import { prismaClient } from '../prisma-client';
import bcrypt from 'bcrypt';

const User = schemaBuilder.prismaNode('User', {
  id: { field: 'id' },
  fields: (t) => ({
    username: t.exposeString('username'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    name: t.exposeString('name'),
    gender: t.field({
      type: Gender,
      nullable: true,
      resolve: (parent) => parent.gender,
    }),
    dateOfBirth: t.field({
      type: 'Date',
      nullable: true,
      resolve: (parent) => parent.dateOfBirth,
    }),
    userType: t.field({
      type: UserType,
      resolve: (parent) => parent.userType,
    }),
    blogUrl: t.string({
      nullable: true,
      select: {
        criticUser: true,
      },
      resolve: (user) => user.criticUser?.blogUrl,
    }),

    reviews: t.relatedConnection('reviews', {
      cursor: 'id',
      args: {
        textContains: t.arg.string(),
        minScore: t.arg.int(),
        maxScore: t.arg.int(),
        sortBy: t.arg({ type: ReviewSortBy }),
        sortDirection: t.arg({ type: SortDirection }),
      },
      query: (args) => ({
        where: {
          score: { gte: args.minScore ?? 0, lte: args.maxScore ?? 10 },
          OR: [
            {
              title: { contains: args.textContains ?? '', mode: 'insensitive' },
            },
            {
              content: {
                contains: args.textContains ?? '',
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: createReviewsOrderByQuery(args.sortBy, args.sortDirection),
      }),
    }),

    reviewThanks: t.relatedConnection('reviewThanks', { cursor: 'id' }),

    comments: t.relatedConnection('comments', {
      cursor: 'id',
      args: {
        contentContains: t.arg.string(),
      },
      query: (args) => ({
        where: {
          content: {
            contains: args.contentContains ?? '',
            mode: 'insensitive',
          },
        },
        orderBy: { postTime: 'desc' },
      }),
    }),

    viewedMovies: t.relatedConnection('viewedMovies', { cursor: 'id' }),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
    likedCollections: t.relatedConnection('likedCollections', { cursor: 'id' }),
  }),
});

schemaBuilder.queryFields((t) => ({
  users: t.prismaConnection({
    type: 'User',
    cursor: 'id',
    args: {
      nameContains: t.arg.string(),
    },
    resolve: (query, _, args) =>
      prismaClient.user.findMany({
        ...query,
        where: { name: { contains: args.nameContains ?? undefined } },
      }),
  }),
  user: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args) =>
      prismaClient.user.findUnique({
        ...query,
        where: { id: +args.id.id },
      }),
  }),
}));

function userTypeDataCreationQuery(
  userType: UserType,
  blogUrl?: string | null
) {
  if (userType === UserType.Critic) {
    if (!blogUrl) {
      throw new Error('Critic user needs a blog or website URL');
    }
    return {
      criticUser: { create: { blogUrl } },
    };
  }

  return { regularUser: { create: {} } };
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

const SignUpInput = schemaBuilder.inputType('SignUpInput', {
  fields: (t) => ({
    username: t.string({ required: true }),
    email: t.string({ required: true }),
    name: t.string({ required: true }),
    password: t.string({ required: true }),
    dateOfBirth: t.field({ type: 'Date' }),
    gender: t.field({ type: Gender }),
    userType: t.field({ type: UserType, required: true }),
    blogUrl: t.string(),
  }),
});

schemaBuilder.mutationField('signUp', (t) =>
  t.field({
    type: User,
    args: {
      input: t.arg({ type: SignUpInput, required: true }),
    },
    resolve: async (_, args) =>
      await prismaClient.user.create({
        data: {
          username: args.input.username,
          name: args.input.name,
          email: args.input.email,
          dateOfBirth: args.input.dateOfBirth,
          gender: args.input.gender,
          userType: args.input.userType,
          ...userTypeDataCreationQuery(args.input.userType, args.input.blogUrl),
          hashedPassword: await hashPassword(args.input.password),
        },
      }),
  })
);
