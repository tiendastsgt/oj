import { ChangePasswordRequest } from '../../../core/models/change-password-request.model';

export type { ChangePasswordRequest };
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const DEFAULT_REDIRECT = '/expedientes';
