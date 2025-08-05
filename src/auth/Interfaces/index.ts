// src/auth/interfaces/index.ts
export interface JwtPayload {
  id: string;
  role?: string;
}

// You can add other interfaces here as needed
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role?: string;
  };
}