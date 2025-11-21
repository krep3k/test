import NextAuth, {type NextAuthOptions} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Email & Password",
            credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password"}},
            async authorize(creds) {
                if (!creds?.email || !creds?.password) return null;
                const email = creds.email.toString().trim().toLowerCase();
                const plainPassword = creds.password.toString();
                await connectDB();
                const user = await User.findOne({email});
                if (!user) {
                    console.log("Login : User tidak ditemukan untuk email", email);
                    return null;
                }
                const match = await bcrypt.compare(plainPassword, user.passwordHash);
                if(!match) {
                    console.log("Login : Password salah untuk email", email);
                    return null;
                }
                console.log("Login sukses untuk email", email);
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name || "User",
                    role: user.role,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = (user as any).role || "user";
            return token;
        },
        async session({ session, token }) {
            (session.user as any).id = token.sub;
            (session.user as any).role = (token as any).role || "user";
            return session;
        },
    },

    pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);

export {
    handler as GET, handler as POST
};