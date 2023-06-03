import { GraphQLDate, GraphQLDateTime } from 'graphql-scalars';
import { schemaBuilder } from '../../schema-builder';

schemaBuilder.addScalarType('DateTime', GraphQLDateTime, {});
schemaBuilder.addScalarType('Date', GraphQLDate, {});
