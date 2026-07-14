import { supabase } from '../config/supabase';

export type AppSettingsRecord = {
  id: string;
  app_enabled: boolean;
  maintenance: boolean;
  force_update: boolean;
  minimum_version: string;
  latest_version: string;
  expiry_date: string | null;
  message: string;
};

export type UpdateAppSettingsInput = {
  appEnabled: boolean;
  maintenance: boolean;
  forceUpdate: boolean;
  minimumVersion: string;
  latestVersion: string;
  expiryDate?: string | null;
  message: string;
};

export const appSettingsService = {
  async getSettings(): Promise<AppSettingsRecord> {
    const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();

    if (error) {
      const wrappedError = new Error(error.message || 'Unable to read application settings.');
      (wrappedError as Error & { statusCode?: number }).statusCode = 500;
      throw wrappedError;
    }

    if (!data) {
      const wrappedError = new Error('Application settings are not configured.');
      (wrappedError as Error & { statusCode?: number }).statusCode = 404;
      throw wrappedError;
    }

    return {
      id: data.id,
      app_enabled: Boolean(data.app_enabled),
      maintenance: Boolean(data.maintenance),
      force_update: Boolean(data.force_update),
      minimum_version: data.minimum_version,
      latest_version: data.latest_version,
      expiry_date: data.expiry_date ?? null,
      message: data.message ?? 'Welcome',
    };
  },

  async updateSettings(input: UpdateAppSettingsInput): Promise<AppSettingsRecord> {
    const { data: existing, error: selectError } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    if (selectError) {
      const wrappedError = new Error(selectError.message || 'Unable to read application settings.');
      (wrappedError as Error & { statusCode?: number }).statusCode = 500;
      throw wrappedError;
    }

    if (!existing) {
      const wrappedError = new Error('Application settings are not configured.');
      (wrappedError as Error & { statusCode?: number }).statusCode = 404;
      throw wrappedError;
    }

    // Defensive: ensure we have an id to target
    if (!existing.id) {
      const wrappedError = new Error('Application settings record has no id.');
      (wrappedError as Error & { statusCode?: number }).statusCode = 500;
      throw wrappedError;
    }

    const { data: updatedData, error: updateError } = await supabase
      .from('app_settings')
      .update({
        app_enabled: input.appEnabled,
        maintenance: input.maintenance,
        force_update: input.forceUpdate,
        minimum_version: input.minimumVersion,
        latest_version: input.latestVersion,
        expiry_date: input.expiryDate || null,
        message: input.message,
      })
      .eq('id', existing.id)
      .single();

    if (updateError) {
      const wrappedError = new Error(updateError.message || 'Unable to update application settings.');
      (wrappedError as Error & { statusCode?: number }).statusCode = 500;
      throw wrappedError;
    }

    // If Supabase did not return the updated row (some SDK configs), do a fallback select
    let finalData: any = updatedData;
    if (!finalData) {
      const { data: reselect, error: reselectError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', existing.id)
        .single();

      if (reselectError) {
        const wrappedError = new Error(reselectError.message || 'Failed to read updated application settings.');
        (wrappedError as Error & { statusCode?: number }).statusCode = 500;
        throw wrappedError;
      }

      finalData = reselect;
    }

    return {
      id: finalData.id,
      app_enabled: Boolean(finalData.app_enabled),
      maintenance: Boolean(finalData.maintenance),
      force_update: Boolean(finalData.force_update),
      minimum_version: finalData.minimum_version,
      latest_version: finalData.latest_version,
      expiry_date: finalData.expiry_date ?? null,
      message: finalData.message ?? 'Welcome',
    };
  },
};
