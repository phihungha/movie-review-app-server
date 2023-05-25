import { GraphQLJWT } from 'graphql-scalars';
import { schemaBuilder } from '../../schema-builder';

schemaBuilder.addScalarType('Jwt', GraphQLJWT, {});
