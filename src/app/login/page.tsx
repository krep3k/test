"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const r = useRouter();
    const [loading, setLoading] = useState(false);
    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setLoading(true);
        const res = await signIn("credentials", {
            email: form.get("email"),
            password: form.get("password"),
            redirect: false,
        });
        setLoading(false);
        if (res?.error) {
            alert("Email atau password salah");
            return;
        }
        r.push("/account");
    }
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm border border-slate-700 rounded-2x1 bg-slate-900/80 p-6">
                <h1 className="text-xl font-semibold mb-4 text-slate-100">Masuk</h1>
                <form onSubmit={onSubmit} className="space-y-3 text-sm">
                    <label><input type="email" name="email" placeholder="Email" required className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"/></label>
                    <label><input type="password" name="password" placeholder="Password" required className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"/></label>
                    <button disabled={loading} className="w-full rounded-lg bg-sky-500 py-2 font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60">
                        {loading ? "Masuk..." : "Masuk"}
                    </button>
                </form>
                <p className="mt-3 text-xs text-slate-400">
                    Belum punya akun?{""}
                    <a href="/register" className="text-sky-400 underline">Daftar</a>
                </p>
            </div>
        </main>
    );
}