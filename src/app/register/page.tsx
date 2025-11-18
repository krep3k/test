"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const form = new FormData(e.currentTarget);

        const res = await fetch("/api/register", {
            method : "POST",
            body : JSON.stringify({
                name: form.get("name"),
                email: form.get("email"),
                password: form.get("password"),
            }),
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await res.json().catch(() => ({}));
        setLoading(false);
        if (!res.ok) {
            alert(data.error || "Gagal daftar")
        }

        alert("berhasil daftar, silahkan login");
        router.push("/login")
    }
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm border border-slate-700 rounded-2xl bg-slate-900/80 p-6">
                <h1 className="text-xl font-semibold mb-4 text-slate-100">Daftar</h1>
                <form onSubmit={onSubmit} className="space-y-3 text-sm">
                    <label><input name="name" placeholder="Nama" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100" /></label>
                    <label><input name="email" type="email" placeholder="Email" required className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"/></label>
                    <label><input type="password" name="password" placeholder="Password (minimal 6 karakter)" className="w-full rounded-lg border border-slate-700 bg-slate900 px-3 py-2 text-slate-100"/></label>
                    <button disabled={loading} className="w-full rounded-lg bg-sky-500 py-2 font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60">
                        {loading ? "Mendaftar...": "Daftar"}
                    </button>
                </form>
                <p className="mt-3 text-xs text-slate-400">
                    Sudah punya akun?{""}
                    <a href="/login" className="text-sky-400 underline">Masuk</a>
                </p>
            </div>
        </main>
    );
}