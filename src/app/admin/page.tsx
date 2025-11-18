"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function adminPage() {
    const {data: session, status} = useSession();

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-slate-400">Memuat dashboard admin...</p>
            </main>
        );
    }

    const user = session?.user as any;
    if(!user || user.role !== "admin") {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-2">
                    <p className="text-sm text-slate-400">
                        Kamu tidak punya akses ke halaman admin
                    </p>
                    <a href="/" className="text-xs text-sky-400 underline">Kembali ke beranda</a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                <h1 className="text-xl font-semibold mb-3">Dashboard Admin</h1>
                <p className="text-sm text-slate-300 mb-4">
                    Halo, <span className="font-medium">{user.email}</span>. Disini akan ada manajemen produk dan pesanan
                </p>

                <div className="space-y-2 text-xs text-slate-400">
                    <p>✅ Halaman ini hanya bisa diakses oleh user dengan role <b>Admin</b></p>
                    <p>✅ Kita akan tambahkan CRUD produk & pesanan di tahap berikutnya.</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <a href="/admin/products" className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                        Kelola produk
                    </a>
                    <a href="/admin/orders" className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                        Kelola pesanan
                    </a>
                </div>
                <a href="/account" className="mt-5 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-xs hover:bg-slate-800">Kembali ke akun</a>
            </div>
        </main>
    );
}