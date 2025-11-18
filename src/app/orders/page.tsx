"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
    _id: string;
    createdAt: string;
    status: string;
    subtotal: number;
    shippingCost: number;
    total: number;
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadOrders() {
        try {
            setLoading(true);
            const res = await fetch("/api/orders", {cache: "no-store"});

            if(!res.ok) {
                const txt = await res.text();
                console.error("Gagal memuat orders: ", res.status, txt);
                setError("Gagal memuat riwayat pesanan");
                return;
            }

            const data = await res.json();
            setOrders(data.orders || []);
            setLoading(false);
        } catch(e) {
            console.error(e);
            setError("Gagal memuat riwayat pesanan");
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-2">Riwayat pesanan</h1>
                <a href="/" className="text-xs text-sky-400 underline">
                    ← Kembali ke beranda
                </a>
                {loading && (
                    <p className="mt-4 text-sm text-slate-400">Memuat Pesanan...</p>
                )}
                {error && (
                    <p className="mt-4 text-sm text-red-400">{error}</p>
                )}
                {!loading && !error && orders.length === 0 && (
                    <p className="mt-4 text-sm text-slate-400">
                        Kamu belum punya pesanan. Silahkan checkout dulu dari keranjang
                    </p>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="mt-5 space-y-4 text-sm">
                        {orders.map((o) => {
                            const created = new Date(o.createdAt);
                            return (
                                <div key={o._id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                ID pesanan: {o._id.slice(-8)}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {created.toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800">{o.status}</span>
                                    </div>
                                    <div className="mb-3 space-y-1">
                                        {o.items.map((it, idx) => (
                                            <p key={idx} className="text-xs text-slate-300">
                                                {it.name}{""}
                                                <span className="text-slate-500">x {it.quantity}</span>{""}
                                                • Rp {it.price.toLocaleString("id-ID")}
                                            </p>
                                        ))}
                                    </div>

                                    <div className="text-xs text-slate-300">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>Rp {o.subtotal.toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>ngkir</span>
                                            <span>Rp {o.shippingCost.toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold mt-1">
                                            <span>Total</span>
                                            <span>Rp {o.total.toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}