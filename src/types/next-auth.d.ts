import "next-auth";
import "next-auth/jwt";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "WORKER";

interface ExtendedUser {
  id: string;
  role: UserRole;
  workerId?: string;
  image?: string | null;
  name?: string | null;
  email?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    workerId?: string;
    picture?: string | null;
  }
}
