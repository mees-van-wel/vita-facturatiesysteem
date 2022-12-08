import axios from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "email",
      credentials: {
        email: { label: "E-mail", type: "email", required: true },
        password: { label: "Wachtwoord", type: "password", required: true },
      },
      authorize: async (credentials, req) => {
        const res = await axios.post(
          "http://localhost:3000/api/authorize",
          credentials
        );

        if (res.status === 200 && !!res.data) return res.data;

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
