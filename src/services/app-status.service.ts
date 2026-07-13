import { supabase } from '../config/supabase';

export type AppStatusResponse = {
  success: boolean;
  appEnabled: boolean;
  maintenance?: boolean;
  forceUpdate?: boolean;
  minimumVersion?: string;
  latestVersion?: string;
  expiryDate?: string;
  message?: string;
};

export const appStatusService = {
  async getStatus(): Promise<AppStatusResponse> {
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

    const expiryDateValue = data.expiry_date ? String(data.expiry_date) : null;
    const isExpired = expiryDateValue ? this.isDateAfterToday(expiryDateValue) : false;

    const response: AppStatusResponse = {
      success: true,
      appEnabled: Boolean(data.app_enabled) && !isExpired,
      maintenance: Boolean(data.maintenance),
      forceUpdate: Boolean(data.force_update),
      minimumVersion: data.minimum_version ?? undefined,
      latestVersion: data.latest_version ?? undefined,
      expiryDate: expiryDateValue ?? undefined,
      message: data.message ?? 'Welcome',
    };

    if (!response.appEnabled) {
      response.message = 'Application license has expired. Please contact administrator.';
    }

    return response;
  },

  isDateAfterToday(value: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    parsed.setHours(0, 0, 0, 0);

    return parsed < today;
  },
};
