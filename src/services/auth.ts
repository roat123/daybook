import { isValidEmail, normalizeEmail, passwordProblem } from '@/lib/validation';

export type User = { id: string; email: string };

export type AuthErrorCode = 'invalid-email' | 'weak-password' | 'email-taken' | 'wrong-credentials';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function authErrorMessage(error: unknown): string {
  return error instanceof AuthError ? error.message : 'Something went wrong. Try again.';
}

/**
 * What the screens need from a login service. The demo provider below keeps accounts on the phone;
 * a real one (Supabase, Firebase, your own API) implements the same three calls.
 */
export interface AuthProvider {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  deleteAccount(userId: string): Promise<void>;
}

type StoredUser = User & { salt: string; hash: string; createdAt: string };

export type DemoAuthDeps = {
  read: () => string | null;
  write: (value: string) => void;
  hash: (password: string, salt: string) => Promise<string>;
  newSalt: () => string;
  newId: () => string;
  /** Pretend network time, so loading states are visible in the demo. */
  delayMs?: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createDemoAuth(deps: DemoAuthDeps): AuthProvider {
  const load = (): StoredUser[] => {
    try {
      const parsed = JSON.parse(deps.read() ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const save = (users: StoredUser[]) => deps.write(JSON.stringify(users));
  const pause = () => wait(deps.delayMs ?? 0);

  return {
    async signUp(rawEmail, password) {
      await pause();
      const email = normalizeEmail(rawEmail);
      if (!isValidEmail(email)) throw new AuthError('invalid-email', 'Enter a valid email');
      const problem = passwordProblem(password);
      if (problem) throw new AuthError('weak-password', problem);
      const users = load();
      if (users.some((u) => u.email === email)) {
        throw new AuthError('email-taken', 'An account with this email already exists');
      }
      const salt = deps.newSalt();
      const user: StoredUser = {
        id: deps.newId(),
        email,
        salt,
        hash: await deps.hash(password, salt),
        createdAt: new Date().toISOString(),
      };
      save([...users, user]);
      return { id: user.id, email };
    },

    async signIn(rawEmail, password) {
      await pause();
      const email = normalizeEmail(rawEmail);
      const user = load().find((u) => u.email === email);
      // The same message for "no such email" and "wrong password", so emails cannot be guessed.
      if (!user || (await deps.hash(password, user.salt)) !== user.hash) {
        throw new AuthError('wrong-credentials', 'Wrong email or password');
      }
      return { id: user.id, email: user.email };
    },

    async deleteAccount(userId) {
      await pause();
      save(load().filter((u) => u.id !== userId));
    },
  };
}
