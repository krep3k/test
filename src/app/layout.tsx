import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "E-commerce pkm",
  description: "project kuliah e-commerce dengan sistem akun",
};

export default function RootLayout({children}:{children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}