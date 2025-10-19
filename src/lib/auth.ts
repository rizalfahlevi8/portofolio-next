import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Hanya izinkan email tertentu
      const allowedEmail = process.env.ALLOWED_EMAIL || "rizalfahlevi810@gmail.com";
      
      if (user.email === allowedEmail) {
        return true;
      }
      
      // Redirect ke halaman login dengan error
      return '/login?error=unauthorized';
    },
    async session({ session, token }) {
      // Tambahkan data dari token ke session jika diperlukan
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user}) {
      // Simpan data user ke token saat pertama kali login
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};