export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errors?: unknown[];
  data?: T;
  timestamp?: string;
}
