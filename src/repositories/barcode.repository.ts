import { supabase } from '../config/supabase';

export const barcodeRepository = {
  async create(data: { containerId: string; barcode: string }) {
    return supabase
      .from('barcode_scans')
      .insert([{ container_id: data.containerId, barcode: data.barcode, scanned_by: null }] as never[])
      .select('id')
      .single();
  },

  async findByContainerAndBarcode(containerId: string, barcode: string) {
    return supabase.from('barcode_scans').select('id').eq('container_id', containerId).eq('barcode', barcode).limit(1);
  },

  async countByContainerId(containerId: string) {
    return supabase.from('barcode_scans').select('*', { count: 'exact', head: true }).eq('container_id', containerId);
  },

  async findByContainerId(containerId: string) {
    return supabase.from('barcode_scans').select('*').eq('container_id', containerId).order('scanned_at', { ascending: false });
  },

  async findById(id: string) {
    return supabase.from('barcode_scans').select('*').eq('id', id).single();
  },

  async update(id: string, data: { barcode: string }) {
    return supabase
      .from('barcode_scans')
      .update({ barcode: data.barcode } as never)
      .eq('id', id)
      .select('*')
      .single();
  },

  async delete(id: string) {
    return supabase.from('barcode_scans').delete().eq('id', id);
  },

  async deleteByContainerId(containerId: string) {
    return supabase.from('barcode_scans').delete().eq('container_id', containerId);
  },
};
