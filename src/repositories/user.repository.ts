import { supabase } from '../config/supabase';

export const userRepository = {
  async findByEmail(_email: string) {
    return supabase.from('users').select('*').eq('user_name', _email).maybeSingle();
  },

  async findByUsername(username: string) {
    return supabase
      .from('users')
      .select('id, name, user_name, role, password_hash')
      .eq('user_name', username)
      .maybeSingle();
  },

  async listUsers() {
    return supabase
      .from('users')
      .select('id, name, user_name, role, active, created_at')
      .order('created_at', { ascending: false });
  },

  async create(data: { name: string; userName: string; passwordHash: string; role: string; active: boolean }) {
    return supabase
      .from('users')
      .insert([
        {
          name: data.name,
          user_name: data.userName,
          password_hash: data.passwordHash,
          role: data.role,
          active: data.active,
        },
      ] as never[])
      .select('id, name, user_name, role, active, created_at')
      .single();
  },

  async deleteUser(id: string) {
    return supabase.from('users').delete().eq('id', id);
  },

  async updatePassword(id: string, passwordHash: string) {
    return supabase.from('users').update({ password_hash: passwordHash } as never).eq('id', id).select('id').single();
  },
};
