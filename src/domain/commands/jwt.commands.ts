export interface JwtClaims {
  userOrProviderId?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}
