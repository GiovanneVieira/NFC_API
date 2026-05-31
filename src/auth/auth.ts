import { betterAuth } from 'better-auth';
import { openAPI, jwt } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getCleanOrigins } from 'src/utils/cors.utils'; 

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const isDevelopment = process.env.NODE_ENV === 'development';

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Array estrito de strings para validação de tipos
  trustedOrigins: getCleanOrigins(process.env.CORS_ORIGINS),
  
  // Controle de segurança condicional
  advanced: {
    disableOriginCheck: isDevelopment, // true em dev (libera Expo), false em prod (blindagem máxima)
  },
  
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      RA: { type: 'string', required: true, input: true },
      role: { type: 'string', required: false, input: true, defaultValue: 'STUDENT' },
      course: { type: 'string', required: false, input: false },
      cpf: { type: 'string', required: false, input: false },
      cardValidity: { type: 'date', required: false, input: false },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: 'jwt',
    },
  },
  plugins: [
    openAPI(),
    jwt({
      jwt: {
        expiresIn: '15m',
        issuer: baseURL,
        audience: baseURL,
        definePayload: ({ user }) => {
          const u = user as { id: string; email: string; RA?: string };
          return { id: u.id, email: u.email, RA: u.RA };
        },
      },
      jwks: {
        keyPairConfig: { alg: 'EdDSA', crv: 'Ed25519' },
        rotationInterval: 60 * 60 * 24 * 30,
        gracePeriod: 60 * 60 * 24 * 7,
      },
    }),
  ],
});