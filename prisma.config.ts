import { defineConfig } from '@prisma/config';

const isMigrationCommand = process.env.NODE_ENV_ACTION === 'migration' || !!process.env.DIRECT_URL;

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: isMigrationCommand ? process.env.DIRECT_URL : process.env.DATABASE_URL,
  },
});