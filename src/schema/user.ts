import { schemaBuilder } from '../schema-builder';
import { Gender, Prisma, UserType } from '@prisma/client';
import { ReviewSortBy } from './enums/review-sort-by';
import { SortDirection } from './enums/sort-direction';
import { getReviewsOrderByQuery } from './movie';
import { prismaClient, s3Client } from '../api-clients';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { userDateOfBirthSchema } from '../validation-schemas';
import { AlreadyExistsError } from '../errors';
import { getAuth } from 'firebase-admin/auth';

async function getFirebaseUser(uid: string) {
  return await getAuth().getUser(uid);
}

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
        orderBy: getReviewsOrderByQuery(args.sortBy, args.sortDirection),
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
        where: { id: args.id.id },
      }),
  }),
  viewer: t.prismaField({
    type: 'User',
    nullable: true,
    resolve: (query, parent, args, context) =>
      prismaClient.user.findUnique({
        ...query,
        where: { id: context.currentUser?.id },
      }),
  }),
  userProfileImageUploadUrl: t.string({
    authScopes: { criticUser: true, regularUser: true },
    resolve: (parent, args, context) => {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const currentUserId = context.currentUser!.id;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: 'public/userProfileImages/' + currentUserId,
      });
      return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    },
  }),
}));

const CriticSignUpInput = schemaBuilder.inputType('CriticSignUpInput', {
  fields: (t) => ({
    username: t.string({ required: true, validate: { minLength: 1 } }),
    dateOfBirth: t.field({
      type: 'Date',
      validate: { schema: userDateOfBirthSchema },
    }),
    gender: t.field({ type: Gender }),
    blogUrl: t.string({ required: true, validate: { url: true } }),
  }),
});

const RegularSignUpInput = schemaBuilder.inputType('RegularSignUpInput', {
  fields: (t) => ({
    username: t.string({ required: true, validate: { minLength: 1 } }),
    dateOfBirth: t.field({
      type: 'Date',
      validate: { schema: userDateOfBirthSchema },
    }),
    gender: t.field({ type: Gender }),
  }),
});

const CriticUserUpdateInput = schemaBuilder.inputType('CriticUserUpdateInput', {
  fields: (t) => ({
    username: t.string({ validate: { minLength: 1 } }),
    avatarUrl: t.string({ validate: { url: true } }),
    dateOfBirth: t.field({
      type: 'Date',
      validate: { schema: userDateOfBirthSchema },
    }),
    gender: t.field({ type: Gender }),
    blogUrl: t.string({ validate: { url: true } }),
  }),
});

const RegularUserUpdateInput = schemaBuilder.inputType(
  'RegularUserUpdateInput',
  {
    fields: (t) => ({
      username: t.string({ validate: { minLength: 1 } }),
      avatarUrl: t.string({ validate: { url: true } }),
      dateOfBirth: t.field({
        type: 'Date',
        validate: { schema: userDateOfBirthSchema },
      }),
      gender: t.field({ type: Gender }),
    }),
  }
);

schemaBuilder.mutationFields((t) => ({
  criticSignUp: t.prismaField({
    type: 'User',
    authScopes: { newUser: true },
    errors: {
      types: [AlreadyExistsError],
    },
    args: {
      input: t.arg({ type: CriticSignUpInput, required: true }),
    },
    resolve: async (query, _, args, context) => {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const firebaseUser = await getFirebaseUser(context.decodedIdToken!.uid);
      if (!firebaseUser.displayName || !firebaseUser.email) {
        throw new Error(
          'Firebase user does not have display name or/and email'
        );
      }
      try {
        return await prismaClient.user.create({
          ...query,
          data: {
            id: firebaseUser.uid,
            username: args.input.username,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            dateOfBirth: args.input.dateOfBirth,
            gender: args.input.gender,
            userType: UserType.Critic,
            criticUser: { create: { blogUrl: args.input.blogUrl } },
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new AlreadyExistsError(err.meta?.target as string);
        } else {
          throw err;
        }
      }
    },
  }),
  regularSignUp: t.prismaField({
    type: 'User',
    errors: {
      types: [AlreadyExistsError],
    },
    args: {
      input: t.arg({ type: RegularSignUpInput, required: true }),
    },
    resolve: async (query, _, args, context) => {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const firebaseUser = await getFirebaseUser(context.decodedIdToken!.uid);
      if (!firebaseUser.displayName || !firebaseUser.email) {
        throw new Error(
          'Firebase user does not have display name or/and email'
        );
      }
      try {
        return await prismaClient.user.create({
          ...query,
          data: {
            id: firebaseUser.uid,
            username: args.input.username,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            dateOfBirth: args.input.dateOfBirth,
            gender: args.input.gender,
            userType: UserType.Regular,
            regularUser: { create: {} },
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new AlreadyExistsError(err.meta?.target as string);
        } else {
          throw err;
        }
      }
    },
  }),
  updateCriticUser: t.prismaField({
    type: 'User',
    authScopes: { criticUser: true },
    args: {
      input: t.arg({ type: CriticUserUpdateInput, required: true }),
    },
    resolve: async (query, _, args, context) => {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const firebaseUser = await getFirebaseUser(context.decodedIdToken!.uid);
      if (!firebaseUser.displayName || !firebaseUser.email) {
        throw new Error(
          'Firebase user does not have display name or/and email'
        );
      }
      try {
        return await prismaClient.user.update({
          ...query,
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          where: { id: context.currentUser!.id },
          data: {
            username: args.input.username ?? undefined,
            name: firebaseUser.displayName ?? undefined,
            email: firebaseUser.email ?? undefined,
            avatarUrl: args.input.avatarUrl,
            dateOfBirth: args.input.dateOfBirth,
            gender: args.input.gender,
            criticUser: {
              update: { blogUrl: args.input.blogUrl ?? undefined },
            },
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new AlreadyExistsError(err.meta?.target as string);
        } else {
          throw err;
        }
      }
    },
  }),
  updateRegularUser: t.prismaField({
    type: 'User',
    authScopes: { regularUser: true },
    args: {
      input: t.arg({ type: RegularUserUpdateInput, required: true }),
    },
    resolve: async (query, _, args, context) => {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const firebaseUser = await getFirebaseUser(context.decodedIdToken!.uid);
      if (!firebaseUser.displayName || !firebaseUser.email) {
        throw new Error(
          'Firebase user does not have display name or/and email'
        );
      }
      try {
        return await prismaClient.user.update({
          ...query,
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          where: { id: context.currentUser!.id },
          data: {
            username: args.input.username ?? undefined,
            name: firebaseUser.displayName ?? undefined,
            email: firebaseUser.email ?? undefined,
            avatarUrl: args.input.avatarUrl,
            dateOfBirth: args.input.dateOfBirth,
            gender: args.input.gender,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new AlreadyExistsError(err.meta?.target as string);
        } else {
          throw err;
        }
      }
    },
  }),
}));
