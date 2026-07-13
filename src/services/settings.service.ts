import { userRepository } from '../repositories/user.repository';
import { authService } from './auth.service';

interface CreateUserInput {
  name: string;
  userName: string;
  password: string;
  role?: string;
  active?: boolean;
}

interface UpdatePasswordInput {
  newPassword: string;
  confirmPassword: string;
}

export const settingsService = {
  async createUser(data: CreateUserInput) {
    const name = data.name?.trim();
    const userName = data.userName?.trim();
    const password = data.password?.trim();
    const role = (data.role || 'user').trim();
    const active = data.active ?? true;

    if (!name || !userName || !password) {
      const error = new Error('Name, username, and password are required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    if (!['user', 'admin', 'manager'].includes(role)) {
      const error = new Error('Role must be user, admin, or manager.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { data: existingUser, error: lookupError } = await userRepository.findByUsername(userName);

    if (lookupError) {
      throw lookupError;
    }

    if (existingUser) {
      const error = new Error('Username already exists.');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const passwordHash = await authService.hashPassword(password);
    const { data: createdUser, error } = await userRepository.create({
      name,
      userName,
      passwordHash,
      role,
      active,
    });

    if (error) {
      throw error;
    }

    return {
      id: createdUser?.id,
      name: createdUser?.name,
      userName: createdUser?.user_name,
      role: createdUser?.role,
      active: createdUser?.active,
      createdAt: createdUser?.created_at,
    };
  },

  async listUsers() {
    const { data: users, error } = await userRepository.listUsers();

    if (error) {
      throw error;
    }

    return (users ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      userName: user.user_name,
      role: user.role,
      active: user.active,
      createdAt: user.created_at,
    }));
  },

  async deleteUser(id: string) {
    const userId = id?.trim();

    if (!userId) {
      const error = new Error('User ID is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const { error } = await userRepository.deleteUser(userId);

    if (error) {
      throw error;
    }

    return { id: userId };
  },

  async updatePassword(id: string, data: UpdatePasswordInput) {
    const userId = id?.trim();
    const newPassword = data.newPassword?.trim();
    const confirmPassword = data.confirmPassword?.trim();

    if (!userId) {
      const error = new Error('User ID is required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    if (!newPassword || !confirmPassword) {
      const error = new Error('New password and confirmation are required.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error('Passwords do not match.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters.');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const passwordHash = await authService.hashPassword(newPassword);
    const { error } = await userRepository.updatePassword(userId, passwordHash);

    if (error) {
      throw error;
    }

    return { id: userId };
  },
};
