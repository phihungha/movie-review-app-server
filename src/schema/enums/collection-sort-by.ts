import { schemaBuilder } from '../../schema-builder';

export enum CollectionSortBy {
  Name,
  CreationDate,
  LikeCount,
}

schemaBuilder.enumType(CollectionSortBy, { name: 'CollectionSortBy' });
