import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'apple',
    password: process.env.DB_PASSWORD || 'apple123',
    database: process.env.DB_NAME || 'apple_clone',
  },
};
