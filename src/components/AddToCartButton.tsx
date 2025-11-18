"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ok } from "assert";

export default function AddToCartButton({productId} : {productId: string}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleClick() {
        try {
            setLoading(true);
            const res = await fetch ("/api/cart", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({productId, quantity: 1}),
            });
            setLoading(false);

            if(res.status === 401) {
                const go = confirm(
                    "Kamu harus login dulu untuk menambah ke keranjang. Mau ke halaman login?"
                );
                if(go) router.push("/login");
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || "Gagal menambah ke keranjang");
                return;
            }

            alert("Produk ditambahkan ke keranjang");
            router.refresh();
        } catch (e) {
            console.error(e);
            setLoading(false);
            alert("Terjadi kesalahan saat menambahkan ke keranjang");
        }
    }

    return (
        <button className="mt-4 w-full rounded-lg bg-sky-500 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60" onClick={handleClick} disabled={loading}>
            {loading ? "Menambahkan:...": "Tambah ke keranjang"}
        </button>
    );
}