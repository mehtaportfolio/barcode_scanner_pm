import { supabase } from '../config/supabase';

export const containerRepository = {
  async create(data: { containerNumber: string }) {
    return supabase
      .from('containers')
      .insert([{ container_number: data.containerNumber, status: 'OPEN', created_by: null, closed_by: null }] as never[])
      .select('id, container_number')
      .single();
  },

  async findOpenByNumber(containerNumber: string) {
    return supabase.from('containers').select('id, container_number').eq('container_number', containerNumber).eq('status', 'OPEN');
  },

  async findAll() {
    return supabase
      .from('containers')
      .select('id, container_number, status, created_at, closed_at, created_by')
      .order('created_at', { ascending: false });
  },

  async findById(id: string) {
    return supabase.from('containers').select('*').eq('id', id).single();
  },

  async findByIdForUser(id: string, userId: string) {
    return supabase
      .from('containers')
      .select('*')
      .eq('id', id)
      .or(`created_by.eq.${userId},created_by.is.null`)
      .single();
  },

  async close(id: string) {
    return supabase
      .from('containers')
      .update({ status: 'CLOSED', closed_at: new Date().toISOString(), closed_by: null } as never)
      .eq('id', id)
      .select('*')
      .single();
  },

  async reopen(id: string) {
    return supabase
      .from('containers')
      .update({ status: 'OPEN', closed_at: null, closed_by: null } as never)
      .eq('id', id)
      .select('*')
      .single();
  },

  async delete(id: string) {
    return supabase.from('containers').delete().eq('id', id);
  },
};
