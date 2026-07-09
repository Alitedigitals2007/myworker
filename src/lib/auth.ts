import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./db";
import { compare } from "bcryptjs";
import { loginSchema } from "./validations";
import { authConfig } from "./auth.config";

async function logLoginAudit(params: {
  userId: string;
  userName: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failReason?: string;
}) {
  try {
    await prisma.loginAudit.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole as "SUPER_ADMIN" | "ADMIN" | "WORKER",
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        success: params.success,
        failReason: params.failReason
      }
    });
  } catch (error) {
    console.error("Failed to log login audit:", error);
  }
}

export const config: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials, request) {
        const ipAddress = request?.headers?.get("x-forwarded-for") || request?.headers?.get("x-real-ip") || "unknown";
        const userAgent = request?.headers?.get("user-agent") || "unknown";

        const validated = loginSchema.safeParse({
          ...credentials,
          loginType: credentials?.loginType || "admin"
        });

        if (!validated.success) {
          console.error("Invalid login data:", validated.error.format());
          return null;
        }

        const { loginType } = validated.data;

        if (loginType === "worker") {
          if (!validated.data.workerId) {
            throw new Error("WORKER_NOT_FOUND");
          }
          const { workerId, password } = validated.data;
          const worker = await prisma.worker.findUnique({
            where: { workerId },
            include: { user: true }
          });

          if (!worker || !worker.user) {
            await logLoginAudit({
              userId: "unknown",
              userName: workerId,
              userRole: "WORKER",
              ipAddress,
              userAgent,
              success: false,
              failReason: "WORKER_NOT_FOUND"
            });
            throw new Error("WORKER_NOT_FOUND");
          }

          const isPasswordValid = await compare(password, worker.user.password);
          if (!isPasswordValid) {
            await logLoginAudit({
              userId: worker.user.id,
              userName: worker.fullName,
              userRole: worker.user.role,
              ipAddress,
              userAgent,
              success: false,
              failReason: "INVALID_PASSWORD"
            });
            throw new Error("INVALID_PASSWORD");
          }

          await logLoginAudit({
            userId: worker.user.id,
            userName: worker.fullName,
            userRole: worker.user.role,
            ipAddress,
            userAgent,
            success: true
          });

          await prisma.user.update({
            where: { id: worker.user.id },
            data: { lastLogin: new Date() }
          });

          return {
            id: worker.user.id,
            email: worker.user.email,
            name: worker.fullName,
            role: worker.user.role,
            workerId: worker.workerId,
            image: worker.profilePicture
          };
        } else {
          if (!validated.data.email) {
            throw new Error("USER_NOT_FOUND");
          }
          const { email, password } = validated.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            await logLoginAudit({
              userId: "unknown",
              userName: email,
              userRole: "ADMIN",
              ipAddress,
              userAgent,
              success: false,
              failReason: "USER_NOT_FOUND"
            });
            throw new Error("USER_NOT_FOUND");
          }

          const isPasswordValid = await compare(password, user.password);
          if (!isPasswordValid) {
            await logLoginAudit({
              userId: user.id,
              userName: user.email,
              userRole: user.role,
              ipAddress,
              userAgent,
              success: false,
              failReason: "INVALID_PASSWORD"
            });
            throw new Error("INVALID_PASSWORD");
          }

          await logLoginAudit({
            userId: user.id,
            userName: user.email,
            userRole: user.role,
            ipAddress,
            userAgent,
            success: true
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.email,
            role: user.role,
            image: null
          };
        }
      }
    })
  ]
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(config);

export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
}

export async function isSuperAdmin() {
  const session = await auth();
  return session?.user?.role === "SUPER_ADMIN";
}