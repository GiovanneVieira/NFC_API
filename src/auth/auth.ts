import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-modules/prisma/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

@Injectable()
export class AuthService {
  public readonly authClient: any;

  constructor(private prismaService: PrismaService) {
    this.authClient = betterAuth({
      database: prismaAdapter(prismaService, {
        provider: 'postgresql', // or "mysql", "postgresql", ...etc
      }),
      emailAndPassword: {
        enabled: true,
      },
      secret: process.env.BETTER_AUTH_SECRET,
    });
  }
}
