import { schemaBuilder } from '../../schema-builder';

export enum MovieSortBy {
  title,
  releaseDate,
  criticScore,
  regularScore,
  viewedUserCount,
}

schemaBuilder.enumType(MovieSortBy, { name: 'MovieSortBy' });
