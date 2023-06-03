import { schemaBuilder } from '../../schema-builder';

export enum ReviewSortBy {
  PostTime,
  Score,
  ThankCount,
  CommentCount,
}

schemaBuilder.enumType(ReviewSortBy, { name: 'ReviewSortBy' });
