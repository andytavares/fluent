import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { authConfig } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _auth = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  session: { strategy: "database" },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const handlers: ReturnType<typeof NextAuth>["handlers"] = _auth.handlers;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const signIn = _auth.signIn;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const signOut = _auth.signOut;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const auth = _auth.auth;
