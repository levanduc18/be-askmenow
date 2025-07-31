export interface AuthConfig {
  jwtSecret: string;
  jwtAccessTokenExpireMin: number;
  jwtRefreshTokenExpireDay: number;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
}
