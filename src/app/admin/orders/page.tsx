"use client";

import { useEffect, useState } from "react";

type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

type Order = {
    _id: string;
    createdAt: string;
    status: string;
    subtotal: number;
    shippingCost: number;
    total: number;
    shippingAddress: {
        fullname: string;
        phone: string;
        line1: string;
        city: string;
        province: string;
        postal: string;
    };
    items: OrderItem[];
};

const STATUS_OPTION = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "complete",
    "canceled"
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function loadOrders() {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/admin/orders", {cache: "no-store"});

            if(!res.ok){
                const txt = await res.text();
                console.error("Gagal load admin orders:", res.status, txt);
                setError("Gagal memuat daftar pesanan");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setOrders(data.orders || []);
            setLoading(false);
        } catch(e) {
            console.error(e);
            setError("Gagal memuat daftar pesanan");
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function updateStatus(orderID: string, newStatus: string) {
        setSavingId(orderID);
        const res = await fetch("/api/admin/orders", {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({orderID, status: newStatus}),
        });

        setSavingId(null);

        const data =await res.json().catch(() => ({}));
        if(!res.ok) {
            alert(data.error || "Gagal mengubah status pesanan");
            return;
        }

        await loadOrders();
    }

    return (
        <main className="min-h-screen px-4 py-8 bg-slate-950 text-slate-100 flex justify-center">
            <div className="w-full max-w-5xl space-y-5">
                <h1 className="text-2xl font-semibold">Kelola Pesanan</h1>

                {loading && (
                    <p className="text-sm text-slate-400">Memuat daftar pesanan</p>
                )}

                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}

                {!loading && !error && orders.length === 0 && (
                    <p className="text-sm text-slate-400">
                        Belum ada pesanan yang tercatat
                    </p>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((o) => {
                            const created = new Date(o.createdAt);
                            return (
                                <div key={o._id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm">
                                    <div className="flex flex-wrap justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-xs test-slate-400">
                                                ID pesanan: {o._id.slice(-1)}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {created.toLocaleString("id-ID")}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-300">
                                                {o.shippingAddress.fullname} • {o.shippingAddress.phone}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {o.shippingAddress.line1}, {""}
                                                {o.shippingAddress.city}, {""}
                                                {o.shippingAddress.province} {o.shippingAddress.postal}
                                            </p>
                                        </div>

                                        <div className="text-right text-xs">
                                            <p className="mb-1 text-slate-300">Status</p>
                                            <select aria-label="StatusPesanan" defaultValue={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} disabled={savingId === o._id} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                                                {STATUS_OPTION.map((st) => (
                                                    <option value={st} key={st}>
                                                        {st}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-800 pt-2 mt-2">
                                        <p className="text-xs font-semibold mb-1">
                                            Item pesanan:
                                        </p>
                                        <div className="space-y-1 mb-2">
                                            {o.items.map(
                                                (
                                                    it: {name: string; quantity: number; price: number},
                                                    idx: number
                                                ) => (
                                                    <p key={idx} className="text-xs text-slate-300">
                                                        {it.name}{""}
                                                        <span className="text-slate-500">
                                                            x {it.quantity}
                                                        </span>{""}
                                                        • Rp {it.price.toLocaleString("id-ID")}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-300">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>Rp {o.subtotal.toLocaleString("id-ID")}</span>
                                            </div>
                                            <div className="justify-between flex">
                                                <span>Ongkir</span>
                                                <span>Rp {o.shippingCost.toLocaleString("id-ID")}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold mt-1">
                                                <span>Total</span>
                                                <span>Rp {o.total.toLocaleString("id-ID")}</span>
                                            </div>
                                        </div>

                                        {savingId === o._id && (
                                            <p className="mt-2 text-[11px] text-slate-400">
                                                Menyimpan perubahan status..
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}