import { z } from 'zod';
import { calcDateOfBirthFromAge } from './utils';

export const reviewScoreSchema = z.number().int().min(0).max(10);

const MIN_USER_AGE = 14;
export const userDateOfBirthSchema = z
  .date()
  .max(calcDateOfBirthFromAge(MIN_USER_AGE));
