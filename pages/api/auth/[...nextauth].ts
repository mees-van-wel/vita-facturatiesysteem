import axios from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma.lib";
import * as argon2 from "argon2";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "email",
      credentials: {
        email: { label: "E-mail", type: "email", required: true },
        password: { label: "Wachtwoord", type: "password", required: true },
      },
      // @ts-ignore
      authorize: async (credentials) => {
        // const res = await axios.post(
        //   `${process.env.NEXTAUTH_URL}/api/authorize`,
        //   credentials
        // );

        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (
          user &&
          !user.deactivated &&
          (await argon2.verify(user.password, credentials.password))
        )
          return user;

        // if (res.status === 200 && !!res.data) return res.data;

        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      return { ...token, ...user };
    },
    // @ts-ignore
    session: ({ session, token }) => {
      return {
        ...session,
        user: { ...session.user, role: token.role, id: token.id },
      };
    },
  },
  pages: {
    signIn: "/",
  },
  theme: {
    colorScheme: "auto",
    // logo: "",
  },
};

export default NextAuth(authOptions);
