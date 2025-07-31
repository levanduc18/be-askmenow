export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    webUrl: process.env.WEB_URL || 'http://localhost:8080',
  },
});
