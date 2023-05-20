import { Gender } from '@prisma/client';
import { schemaBuilder } from '../builder';

schemaBuilder.enumType(Gender, { name: 'Gender' });
