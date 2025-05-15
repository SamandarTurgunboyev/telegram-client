import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongoose";
import User from "@/models/user.models";
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: 'email', type: "email" },
            },
            async authorize(credentials) {
                await connectToDatabase()
                const user = await User.findOne({ email: credentials?.email })
                return user
            },
        }),
        GithubProvider({
            clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET!
        }),
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async session({ session }) {
            await connectToDatabase()
            const isExistingUser = await User.findOne({ email: session.user?.email })
            if (!isExistingUser) {
                const user = await User.create({
                    email: session.user?.email,
                    isVerifed: true,
                    avatar: session.user?.image
                })
                session.currentUser = user
                return session
            }
            session.currentUser = isExistingUser
            return session
        },
    },
    session: { strategy: "jwt" },
    jwt: { secret: process.env.NEXT_PUBLIC_JWT_SECRET },
    secret: process.env.NEXT_PUBLIC_SECRET,
    pages: { signIn: "/auth", signOut: "/auth" }
}