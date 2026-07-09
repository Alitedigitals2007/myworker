import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.AUTH_MAX_AGE) || 2592000,
    updateAge: Number(process.env.AUTH_UPDATE_AGE) || 86400,
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role as
          | "SUPER_ADMIN"
          | "ADMIN"
          | "WORKER";
        if ("workerId" in user) {
          token.workerId = (user as { workerId?: string }).workerId;
        }
        token.picture = (user as { image?: string | null }).image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "SUPER_ADMIN"
          | "ADMIN"
          | "WORKER";
        session.user.workerId = token.workerId as string | undefined;
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
