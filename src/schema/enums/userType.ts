import { UserType } from '@prisma/client';
import { schemaBuilder } from '../../schema-builder';

schemaBuilder.enumType(UserType, { name: 'UserType' });
