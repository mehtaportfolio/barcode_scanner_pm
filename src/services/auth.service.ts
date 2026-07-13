import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';

interface LoginInput {
  username: string;
  password: string;
}

export const authService = {
  async login(data: LoginInput): Promise<unknown> {
    const username = data.username?.trim();
    const password = data.password?.trim();

    if (!username || !password) {
      const error = new Error('Username and password are required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
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
