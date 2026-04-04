import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./mongoose";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        await dbConnect();
        try {
          const userEmail = user.email as string;
          const existingUser = await User.findOne({ email: userEmail });
          if (!existingUser) {
            await User.create({
              name: user.name || "User",
              email: userEmail,
              image: user.image || undefined,
            });
          }
          return true;
        } catch (error) {
          console.error("Error signing in user:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      await dbConnect();
      if (session.user?.email) {
        const sessionEmail = session.user.email as string;
        const dbUser = await User.findOne({ email: sessionEmail });
        if (dbUser) {
          (session.user as any).id = dbUser._id.toString();
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    // We will build this custom signin page later based on the Stitch UI
    signIn: "/login",
  },
};
