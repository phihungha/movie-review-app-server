import { UserType } from '@prisma/client';
import { schemaBuilder } from '../../builder';

schemaBuilder.enumType(UserType, { name: 'UserType' });
