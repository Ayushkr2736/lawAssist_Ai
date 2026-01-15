import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login", // Redirect to login page on error so we can see it
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                console.log("Attempting Google Sign In for:", user.email);
                try {
                    console.log("Connecting to MongoDB...");
                    await dbConnect();
                    console.log("MongoDB Connected. Checking user...");

                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser && user.email) {
                        console.log("User not found, creating new user...");
                        await User.create({
                            name: user.name || "Unknown",
                            email: user.email,
                            image: user.image || undefined,
                            provider: "google",
                            providerId: account.providerAccountId,
                        });
                        console.log("User created successfully");
                    } else {
                        console.log("User already exists:", existingUser ? existingUser._id : "False alarm");
                    }

                    return true;
                } catch (error) {
                    console.error("❌ SIGN IN ERROR:", error);
                    if (error instanceof Error) {
                        console.error("Error message:", error.message);
                    }
                    return false;
                }
            }
            return true;
        },
        async session({ session }) {
            if (session.user?.email) {
                try {
                    await dbConnect();
                    const dbUser = await User.findOne({ email: session.user.email });
                    if (dbUser) {
                        session.user.id = dbUser._id.toString();
                    }
                } catch (error) {
                    console.error("Error in session callback:", error);
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable NextAuth debugging
};

// Extend next-auth types
declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}
