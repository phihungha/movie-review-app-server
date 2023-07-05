import { lexicographicSortSchema, printSchema } from 'graphql';
import { schemaBuilder } from '../schema-builder';
import { writeFileSync } from 'fs';
import prettier from 'prettier';
import './errors';
import './enums';
import './scalars';
import './genre';
import './crew-member';
import './acting-credit';
import './work-credit';
import './company';
import './movie';
import './user';
import './review';
import './comment';
import './collection';
import './root';

export const gqlSchema = schemaBuilder.toSchema();
const schemaText = printSchema(lexicographicSortSchema(gqlSchema));
const formattedSchemaText = prettier.format(schemaText, { parser: 'graphql' });
writeFileSync('./schema.graphql', formattedSchemaText);
