import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db";

const providers: NextAuthConfig["providers"] = [
  GitHub({
    clientId: process.env["GITHUB_CLIENT_ID"]!,
    clientSecret: process.env["GITHUB_CLIENT_SECRET"]!,
  }),
];

if (process.env["EMAIL_SERVER"]) {
  providers.push(
    Nodemailer({
      server: process.env["EMAIL_SERVER"],
      from: process.env["EMAIL_FROM"]!,
    }),
  );
}

if (process.env["NODE_ENV"] === "development") {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;
        return prisma.user.findUnique({ where: { email } });
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/sign-in",
    newUser: "/auth/sign-up",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};
