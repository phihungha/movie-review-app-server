import { lexicographicSortSchema, printSchema } from 'graphql';
import { schemaBuilder } from '../builder';
import { writeFileSync } from 'fs';
import './error';
import './enums';
import './scalars';
import './genre';
import './crew-member';
import './company';
import './movie';
import './user';
import './review';
import './comment';
import './collection';
import './query';

export const gqlSchema = schemaBuilder.toSchema();
const schemaText = printSchema(lexicographicSortSchema(gqlSchema));
writeFileSync('./schema.graphql', schemaText);
