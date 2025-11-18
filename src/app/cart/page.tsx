"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type cartItem = {
    product: {
        _id: string;
        name: string;
        price: number;
        slug: string;
        imageUrl: string;
    };
    quantity: number;
};

export default function CartPage() {
    const [items, setItems] = useState<cartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function loadCart() {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/cart", {cache: "no-store"});
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            if(!res.ok) {
                const txt = await res.text();
                console.error("load cart gagal:", res.status, txt);
                setError("Gagal memuat keranjang:");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setItems(data.items || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError("Gagal memuat keranjang");
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCart();
    }, []);

    const subtotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 0
    );

    async function changeQty(productId: string, newQty: number) {
        setUpdatingId(productId);
        const res = await fetch("/api/cart", {
            method: "PATCH",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({productId, quantity: newQty}),
        });
        setUpdatingId(null);

        if(!res.ok) {
            alert("Gagal mengubah jumlah");
            return;
        }

        await loadCart();
    }

    return(
        <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4">Keranjang</h1>
                <a href="/" className="text-xs text-sky-400 underline">← Kembali ke beranda</a>
                {loading && (
                    <p className="mt-6 text-sm text-slate-400">Memuat Keranjang...</p>
                )}
                {error && (
                    <p className="text-sm mt-6 text-red-400">{error}</p>
                )}
                {!loading && !error && items.length === 0 && (
                    <p className="mt-6 text-slate-400 text-sm">Keranjang kamu masih kosong. Jelajahi produk di beranda terlebih dahulu</p>
                )}
                {!loading && !error && items.length > 0 && (
                    <div className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr]">
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3" key={item.product._id}>
                                    <div className="h-20 w-20 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center text-[11px] text-slate-500 overflow-hidden">
                                        {item.product.imageUrl ? (
                                            <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover"/>
                                        ) : (
                                            <span>tanpa gambar</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium line-clamp-2">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-sky-400">
                                            Rp {item.product.price.toLocaleString("id-ID")}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                            <button onClick={() => changeQty(item.product._id, item.quantity - 1)} disabled={updatingId === item.product._id} className="h-7 w-7 rounded-full border border-slate-600 flex items-center justify-center hover:bg-slate-800">
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => changeQty(item.product._id, item.quantity + 1)} disabled={updatingId === item.product._id} className="h-7 w-7 rounded-full border border-slate-600 flex items-center justify-center hover:bg-slate-800">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm">
                            <h2 className="font-semibold mb-2">Ringkasan</h2>
                            <div className="justify-between flex text-xs text-slate-300 mb-2">
                                <span>Subtotal</span>
                                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                            </div>
                            <button className="mt-3 w-full rounded-lg bg-sky-500 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400" onClick={() => router.push("/checkout")} disabled={items.length === 0}>
                                Lanjut ke checkout (soon)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}