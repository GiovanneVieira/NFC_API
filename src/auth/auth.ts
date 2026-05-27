import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';


const prismaService = new PrismaService();
export const auth = betterAuth({
    database: prismaAdapter(prismaService, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
});
