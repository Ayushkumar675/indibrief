import type { NextAuthConfig } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

export const authConfig = {
  // In a real app, you'd want to use a secret generated with `openssl rand -base64 32`
  secret: process.env.AUTH_SECRET,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
} satisfies NextAuthConfig;
