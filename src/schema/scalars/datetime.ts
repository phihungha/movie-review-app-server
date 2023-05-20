import { GraphQLLocalDateTime } from 'graphql-scalars';
import { schemaBuilder } from '../../schema-builder';

schemaBuilder.addScalarType('DateTime', GraphQLLocalDateTime, {});
