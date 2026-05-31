import { betterAuth } from 'better-auth';
import { openAPI, jwt } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

/**
 * Origens confiáveis para CORS das rotas de autenticação.
 * Configurável via TRUSTED_ORIGINS (separado por vírgula). O default cobre o
 * Expo (web/dev) e a própria API.
 */
const trustedOrigins = (
  process.env.TRUSTED_ORIGINS ??
  'http://localhost:8081,http://localhost:19006,http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
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
      RA: {
        type: 'string',
        required: true,
        input: true,
      },
      role: {
        type: 'string',
        required: false,
        input: true,
        defaultValue: 'STUDENT',
      },
      // Dados da carteirinha: definidos pela instituição (não no sign-up).
      // Declarados aqui para o better-auth ficar ciente das colunas (evita
      // drift com `auth generate`).
      course: {
        type: 'string',
        required: false,
        input: false,
      },
      cpf: {
        type: 'string',
        required: false,
        input: false,
      },
      cardValidity: {
        type: 'date',
        required: false,
        input: false,
      },
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
        keyPairConfig: {
          alg: 'EdDSA',
          crv: 'Ed25519',
        },
        rotationInterval: 60 * 60 * 24 * 30,
        gracePeriod: 60 * 60 * 24 * 7,
      },
    }),
  ],
});
