"use client";

import { Session } from "inspector/promises";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function accountPage() {
    const {data: session, status} = useSession();
    if(status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-slate-400">Mamuat data akun...</p>
            </main>
        );
    }

    if(!session) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-slate-400">
                    Kamu belum login, silahkan{""}
                    <a href="/login" className="text-sky-400 underline">Masuk</a>
                    .
                </p>
            </main>
        );
    }

    const user = session.user as any;
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-s-slate-800 bg-slate-900/80 p-6">
                <h1 className="text-xl font-semibold mb-3">Akun saya</h1>
                <p className="text-sm text-slate-300 mb-1">
                    Role:{""}
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs">
                        {user.role}
                    </span>
                </p>

                <div className="flex gap-3 mb-4">
                    <a href="/" className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-center hover:bg-slate-800">
                        Kembali ke beranda
                    </a>
                    {user.role === "admin" && (
                        <a href="/admin" className="flex-1 rounded-lg border border-sky-500 px-3 py-2 text-sm text-center text-sky-300 hover:bg-sky-500/10">
                            Dashboard admin
                        </a>
                    )}
                </div>
                <button onClick={() => signOut ({callbackUrl: "/"})} className="w-full rounded-lg bg-red-500/90 py-2 text-sm font-medium text-shadow-slate-950 hover:bg-red-400">Keluar</button>
            </div>
        </main>
    );
}