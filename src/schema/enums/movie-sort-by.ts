import { schemaBuilder } from '../../schema-builder';

export enum MovieSortBy {
  Title,
  ReleaseDate,
  CriticScore,
  RegularScore,
  ViewedUserCount,
}

schemaBuilder.enumType(MovieSortBy, { name: 'MovieSortBy' });
