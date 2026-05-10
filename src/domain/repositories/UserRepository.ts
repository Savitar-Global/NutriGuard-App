import type { User, AuthProvider } from '@/domain/entities/User';

export interface SeedUserInput {
  uid: string;
  email: string;
  displayName: string | null;
  authProvider: AuthProvider;
}

export interface UserRepository {
  get(uid: string): Promise<User | null>;
  seedIfMissing(input: SeedUserInput): Promise<User>;
  update(uid: string, patch: Partial<User>): Promise<void>;
  delete(uid: string): Promise<void>;
}
