import { schemaBuilder } from '../../schema-builder';

export enum SortDirection {
  Asc,
  Desc,
}

schemaBuilder.enumType(SortDirection, { name: 'SortDirection' });
