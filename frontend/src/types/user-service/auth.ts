import { Role } from '../common/enums';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserAuth {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  user: UserAuth;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}