import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.DATABASE_URL) {
  const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
  
  dotenv.config({ 
    path: path.resolve(process.cwd(), envFile) 
  });
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});