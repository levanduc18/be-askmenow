export default () => ({
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtAccessTokenExpireMin: parseInt(process.env.JWT_AT_EXPIRE_MIN || '30', 10),
    jwtRefreshTokenExpireDay: parseInt(process.env.JWT_RT_EXPIRE_DAY || '7', 10),
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
});
