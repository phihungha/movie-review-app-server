import { User } from '@prisma/client';

export interface Context {
  currentUser: User | null;
}
