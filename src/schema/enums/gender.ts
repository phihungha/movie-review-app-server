import { Gender } from '@prisma/client';
import { schemaBuilder } from '../../schema-builder';

schemaBuilder.enumType(Gender, { name: 'Gender' });
