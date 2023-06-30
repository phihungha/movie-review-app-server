import { Prisma } from '@prisma/client';
import { prismaClient } from '../api-clients';
import { schemaBuilder } from '../schema-builder';
import { CollectionSortBy } from './enums/collection-sort-by';
import { SortDirection } from './enums/sort-direction';
import { NotFoundError } from '../errors';
import { MovieConnection } from './movie';
import { UserConnection } from './user';
import { ConnectionObjectType } from '../types';

const MIN_COLLECTION_NAME_LENGTH = 1;

export function getCollectionsOrderByQuery(
  sortByArgValue: CollectionSortBy | undefined | null,
  sortDirection: SortDirection | undefined | null
): Prisma.Enumerable<Prisma.CollectionOrderByWithRelationInput> | undefined {
  if (sortByArgValue === undefined || sortByArgValue === null) {
    return { name: 'desc' };
  }
  const orderByDirection = sortDirection === SortDirection.Asc ? 'asc' : 'desc';
  switch (sortByArgValue) {
    case CollectionSortBy.Name:
      return { name: orderByDirection };
    case CollectionSortBy.CreationDate:
      return { creationTime: orderByDirection };
    case CollectionSortBy.LikeCount:
      return { likeCount: orderByDirection };
  }
}

const Collection = schemaBuilder.prismaNode('Collection', {
  id: { field: 'id' },
  fields: (t) => ({
    author: t.relation('author'),
    name: t.exposeString('name'),
    creationTime: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.creationTime,
    }),
    lastUpdateTime: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastUpdateTime,
    }),
    movies: t.relatedConnection('movies', { cursor: 'id' }, MovieConnection),
    likeUsers: t.relatedConnection(
      'likeUsers',
      { cursor: 'id' },
      UserConnection
    ),
    likeCount: t.exposeInt('likeCount'),
  }),
});

export const CollectionConnection: ConnectionObjectType =
  schemaBuilder.connectionObject({
    type: Collection,
    name: 'CollectionConnection',
  });

schemaBuilder.queryFields((t) => ({
  collections: t.prismaConnection(
    {
      type: 'Collection',
      cursor: 'id',
      args: {
        nameContains: t.arg.string(),
        sortBy: t.arg({ type: CollectionSortBy }),
        sortDirection: t.arg({ type: SortDirection }),
      },
      resolve: (query, _, args) =>
        prismaClient.collection.findMany({
          ...query,
          where: {
            name: {
              contains: args.nameContains ? args.nameContains : undefined,
            },
          },
          orderBy: getCollectionsOrderByQuery(args.sortBy, args.sortDirection),
        }),
    },
    CollectionConnection
  ),

  collection: t.prismaField({
    type: 'Collection',
    nullable: true,
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args) =>
      prismaClient.collection.findUnique({
        ...query,
        where: { id: +args.id.id },
      }),
  }),
}));

schemaBuilder.mutationFields((t) => ({
  createCollection: t.prismaField({
    type: 'Collection',
    authScopes: { regularUser: true, criticUser: true },
    args: {
      name: t.arg.string({
        required: true,
        validate: { minLength: MIN_COLLECTION_NAME_LENGTH },
      }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.collection.create({
        ...query,
        data: {
          name: args.name,
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          author: { connect: { id: context.currentUser!.id } },
        },
      }),
  }),

  editCollection: t.prismaField({
    type: 'Collection',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
      name: t.arg.string({
        required: true,
        validate: { minLength: MIN_COLLECTION_NAME_LENGTH },
      }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const id = +args.id.id;

        let collection;
        try {
          collection = await client.collection.update({
            ...query,
            where: { id },
            data: {
              name: args.name,
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

        if (collection.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        return collection;
      }),
  }),

  addToCollection: t.prismaField({
    type: 'Collection',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
      movieIds: t.arg.globalIDList({ required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const id = +args.id.id;

        let collection;
        try {
          collection = await client.collection.update({
            ...query,
            where: { id },
            data: {
              movies: {
                connect: args.movieIds.map((movie) => ({ id: +movie.id })),
              },
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

        if (collection.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        return collection;
      }),
  }),

  removeFromCollection: t.prismaField({
    type: 'Collection',
    authScopes: { regularUser: true, criticUser: true },
    errors: {
      types: [NotFoundError],
    },
    args: {
      id: t.arg.globalID({ required: true }),
      movieIds: t.arg.globalIDList({ required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const id = +args.id.id;

        let collection;
        try {
          collection = await client.collection.update({
            ...query,
            where: { id },
            data: {
              movies: {
                disconnect: args.movieIds.map((movie) => ({ id: +movie.id })),
              },
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

        if (collection.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        return collection;
      }),
  }),

  deleteCollection: t.prismaField({
    type: 'Collection',
    errors: {
      types: [NotFoundError],
    },
    authScopes: { regularUser: true, criticUser: true },
    args: {
      id: t.arg.globalID({ required: true }),
    },
    resolve: (query, _, args, context) =>
      prismaClient.$transaction(async (client) => {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const currentUserId = context.currentUser!.id;
        const id = +args.id.id;

        let collection;
        try {
          collection = await client.collection.delete({
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

        if (collection.authorId !== currentUserId) {
          throw new NotFoundError();
        }

        return collection;
      }),
  }),
}));
