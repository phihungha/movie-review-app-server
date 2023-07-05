import { CrewWorkRole } from '@prisma/client';
import { schemaBuilder } from '../../schema-builder';

schemaBuilder.enumType(CrewWorkRole, { name: 'CrewWorkRole' });
