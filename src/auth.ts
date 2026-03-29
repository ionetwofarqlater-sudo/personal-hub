import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const rows = await sql`
          SELECT id, email, name, avatar_url, password_hash, role
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `;
        const user = rows[0];
        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash as string);
        if (!valid) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          name: (user.name as string | null) ?? null,
          image: (user.avatar_url as string | null) ?? null,
          role: (user.role as string) ?? "user"
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = (token.role as string) ?? "user";
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: { strategy: "jwt" }
});
