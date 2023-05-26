import { schemaBuilder } from '../schema-builder';
import { Gender, UserType, User } from '@prisma/client';
import { ReviewSortBy } from './enums/review-sort-by';
import { SortDirection } from './enums/sort-direction';
import { createReviewsOrderByQuery } from './movie';
import { prismaClient } from '../prisma-client';
import bcrypt from 'bcrypt';

schemaBuilder.prismaNode('User', {
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
    userType: t.field({ type: UserType, resolve: (parent) => parent.userType }),
    blogUrl: t.string({
      nullable: true,
      select: { criticUser: true },
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

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

const CriticSignUpInput = schemaBuilder.inputType('CriticSignUpInput', {
  fields: (t) => ({
    username: t.string({ required: true }),
    email: t.string({ required: true }),
    name: t.string({ required: true }),
    password: t.string({ required: true }),
    dateOfBirth: t.field({ type: 'Date' }),
    gender: t.field({ type: Gender }),
    blogUrl: t.string({ required: true }),
  }),
});

schemaBuilder.mutationField('criticSignUp', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      input: t.arg({ type: CriticSignUpInput, required: true }),
    },
    resolve: async (query, _, args) =>
      await prismaClient.user.create({
        ...query,
        data: {
          username: args.input.username,
          name: args.input.name,
          email: args.input.email,
          dateOfBirth: args.input.dateOfBirth,
          gender: args.input.gender,
          userType: UserType.Critic,
          hashedPassword: await hashPassword(args.input.password),
          criticUser: { create: { blogUrl: args.input.blogUrl } },
        },
      }),
  })
);

const RegularSignUpInput = schemaBuilder.inputType('RegularSignUpInput', {
  fields: (t) => ({
    username: t.string({ required: true }),
    email: t.string({ required: true }),
    name: t.string({ required: true }),
    password: t.string({ required: true }),
    dateOfBirth: t.field({ type: 'Date' }),
    gender: t.field({ type: Gender }),
  }),
});

schemaBuilder.mutationField('regularSignUp', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      input: t.arg({ type: RegularSignUpInput, required: true }),
    },
    resolve: async (query, _, args) =>
      await prismaClient.user.create({
        ...query,
        data: {
          username: args.input.username,
          name: args.input.name,
          email: args.input.email,
          dateOfBirth: args.input.dateOfBirth,
          gender: args.input.gender,
          userType: UserType.Regular,
          hashedPassword: await hashPassword(args.input.password),
          regularUser: { create: {} },
        },
      }),
  })
);

const CriticUserUpdateInput = schemaBuilder.inputType('CriticUserUpdateInput', {
  fields: (t) => ({
    username: t.string(),
    email: t.string(),
    name: t.string(),
    password: t.string(),
    dateOfBirth: t.field({ type: 'Date' }),
    gender: t.field({ type: Gender }),
    blogUrl: t.string(),
  }),
});

schemaBuilder.mutationField('updateCriticUser', (t) =>
  t.prismaField({
    type: 'User',
    authScopes: { user: true },
    args: {
      id: t.arg.globalID({ required: true }),
      input: t.arg({ type: CriticUserUpdateInput, required: true }),
    },
    resolve: async (query, _, args) =>
      await prismaClient.user.update({
        ...query,
        where: { id: +args.id.id },
        data: {
          username: args.input.username ?? undefined,
          name: args.input.name ?? undefined,
          email: args.input.email ?? undefined,
          dateOfBirth: args.input.dateOfBirth,
          gender: args.input.gender,
          hashedPassword: args.input.password
            ? await hashPassword(args.input.password)
            : undefined,
          criticUser: { update: { blogUrl: args.input.blogUrl ?? undefined } },
        },
      }),
  })
);

const RegularUserUpdateInput = schemaBuilder.inputType(
  'RegularUserUpdateInput',
  {
    fields: (t) => ({
      username: t.string(),
      email: t.string(),
      name: t.string(),
      password: t.string(),
      dateOfBirth: t.field({ type: 'Date' }),
      gender: t.field({ type: Gender }),
    }),
  }
);

schemaBuilder.mutationField('updateRegularUser', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      id: t.arg.globalID({ required: true }),
      input: t.arg({ type: RegularUserUpdateInput, required: true }),
    },
    resolve: async (query, _, args) =>
      await prismaClient.user.update({
        ...query,
        where: { id: +args.id.id },
        data: {
          username: args.input.username ?? undefined,
          name: args.input.name ?? undefined,
          email: args.input.email ?? undefined,
          dateOfBirth: args.input.dateOfBirth,
          gender: args.input.gender,
          hashedPassword: args.input.password
            ? await hashPassword(args.input.password)
            : undefined,
        },
      }),
  })
);
