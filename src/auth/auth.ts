import { betterAuth } from 'better-auth';
import { openAPI, jwt } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
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
        issuer: process.env.BETTER_AUTH_URL,
        audience: process.env.BETTER_AUTH_URL,
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          RA: user.RA,
        }),
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
