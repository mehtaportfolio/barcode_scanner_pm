export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export const successResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = <T>(message = 'Error', data: T | null = null): ApiResponse<T | null> => ({
  success: false,
  message,
  data,
});
