import { User } from "@prisma/client";
import NextAuth from "next-auth";
import { Role } from "../enums/role.enum";

declare module "next-auth" {
  interface Session {
    user: { role: Role; name: string };
  }
}
