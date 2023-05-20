import { GraphQLLocalDateTime } from 'graphql-scalars';
import { schemaBuilder } from '../../builder';

schemaBuilder.addScalarType('DateTime', GraphQLLocalDateTime, {});
