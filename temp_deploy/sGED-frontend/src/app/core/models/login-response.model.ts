import { AuthUser } from './auth-user.model';

export interface LoginResponseData extends AuthUser {
  token: string;
}
