import { lexicographicSortSchema, printSchema } from 'graphql';
import { schemaBuilder } from '../builder';
import { writeFileSync } from 'fs';
import './query';

export const gqlSchema = schemaBuilder.toSchema();
const schemaText = printSchema(lexicographicSortSchema(gqlSchema));
writeFileSync('./schema.graphql', schemaText);
