import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';

interface LoginInput {
  username: string;
  password: string;
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const maxAttempts = 5;
const windowMs = 15 * 60 * 1000;

const getClientKey = (data: LoginInput): string => {
  const header = data?.username?.trim().toLowerCase() || 'unknown';
  return `login:${header}`;
};

export const authService = {
  async login(data: LoginInput): Promise<unknown> {
    const username = data.username?.trim();
    const password = data.password?.trim();

    if (!username || !password) {
      const error = new Error('Username and password are required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const clientKey = getClientKey({ username, password });
    const now = Date.now();
    const attemptState = loginAttempts.get(clientKey);

    if (attemptState && attemptState.resetAt > now) {
      if (attemptState.count >= maxAttempts) {
        const error = new Error('Too many login attempts. Please try again later.');
        (error as Error & { statusCode?: number }).statusCode = 429;
        throw error;
      }

      attemptState.count += 1;
      loginAttempts.set(clientKey, attemptState);
    } else {
      loginAttempts.set(clientKey, { count: 1, resetAt: now + windowMs });
    }

    const { data: user, error } = await userRepository.findByUsername(username);

    if (error) {
      throw error;
    }

    if (!user?.password_hash) {
      const error = new Error('Invalid username or password.');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      const error = new Error('Invalid username or password.');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    loginAttempts.delete(clientKey);

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.user_name,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        userName: user.user_name,
        role: user.role,
      },
    };
  },

  async listUsers(): Promise<Array<{ id: string; userName: string }>> {
    const { data: users, error } = await userRepository.listUsers();

    if (error) {
      throw error;
    }

    return (users ?? []).map((user) => ({
      id: user.id,
      userName: user.user_name,
    }));
  },

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },
};
