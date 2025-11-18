"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItem = {
    product: {
        _id: string;
        name: string;
        price: number;
        imageUrl?: string;
    };
    quantity: number;
};

export default function CheckoutPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function loadCart() {
        try {
            setLoadingCart(true);
            const res = await fetch("/api/cart", {cache: "no-store"});

            if(res.status === 401) {
                router.push("/login");
                return;
            }

            if(!res.ok) {
                setError("Gagal memuat keranjang untuk checkout");
                setLoadingCart(false);
                return;
            }

            const data = await res.json();
            setItems(data.items || []);
            setLoadingCart(false);
        } catch(e) {
            console.error(e);
            setError("Gagal memuat keranjang untk checkout");
            setLoadingCart(false);
        }
    }

    useEffect (() => {
        loadCart();
    }, []);

    const subtotal = items.reduce(
        (sum, it) => sum + it.product.price * it.quantity, 0
    );

    const shippingCost = 20000;
    const total = subtotal + shippingCost;

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(items.length === 0) {
            alert("Keranjang masih kosong");
            return;
        }

        const form = new FormData(e.currentTarget);
        setSubmitting(true);

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify ({
                fullname: form.get("fullname"),
                phone: form.get("phone"),
                line1: form.get("line1"),
                city: form.get("city"),
                province: form.get("province"),
                postal: form.get("postal"),
            }),
        });

        const data = await res.json().catch(() => ({}));
        setSubmitting(false);

        alert("Pesanan berhasil dibuat");
        router.push("/orders");
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
            <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-[1.5fr,1fr]">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
                    <a href="/cart" className="text-xs text-sky-400 underline">
                        ← Kembali ke keranjan
                    </a>

                    {loadingCart ? (
                        <p className="mt-4 text-sm text-slate-400">
                            Memuat data Keranjang...
                        </p>
                    ):items.length === 0 ? (
                        <p className="text-sm mt-4 text-slate-400">
                            Keranjang kosong. Tidak ada yang bisa di checkout
                        </p>
                    ):(
                        <>
                            <h2 className="mt-6 text-sm font-semibold mb-2">
                                Ringkasan produk
                            </h2>
                            <div className="space-y-2 mb-6">
                                {items.map((it) => (
                                    <div key={it.product._id} className="flex justify-between text-sm rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
                                        <span>
                                            {it.product.name}{""}
                                            <span className="text-xs text-slate-400">
                                                x {it.quantity}
                                            </span>
                                        </span>
                                        <span className="text-sm text-sky-400">
                                            Rp {""}
                                            {(
                                                it.product.price * it.quantity
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <h2 className="text-sm font-semibold m-2">
                                Alamat Pengiriman
                            </h2>
                            <form onSubmit={onSubmit} className="space-y-3 text-sm">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <label htmlFor=""><input name="fullname" placeholder="Nama Lengkap" required className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"/></label>
                                    <label htmlFor=""><input name="phone" placeholder="No.Hp / Whatsapp" required className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"/></label>
                                    <label htmlFor=""><input name="line1" placeholder="Alamat (Jalan, No. rumah, dll)" required className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"/></label>
                                    <label htmlFor=""><input name="city" placeholder="Kota / Kabupaten" required className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"/></label>
                                    <label htmlFor=""><input name="province" placeholder="Provinsi" required className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"/></label>
                                    <label htmlFor=""><input name="postal" placeholder="Kode Pos" required className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"/></label>
                                </div>
                                <button disabled={submitting || items.length === 0} className="mt-2 w-full rounded-lg bg-sky-500 py-2 font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60">
                                    {submitting ? "Memproses pesanan...": "Membuat pesanan"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm">
                    <h2 className="font-semibold mb-3">Ringkasan pembayaran</h2>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Subtotal</span>
                        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Ongkir (flat)</span>
                        <span>{shippingCost.toLocaleString("id-ID")}</span>
                    </div>
                    <hr className="my-2 border-slate-700"/>
                    <div className="flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500">
                        Pembayaran sementara masih manual. Nanti bisa diganti integrasi Midtrans
                    </p>
                </div>
            </div>
        </main>
    );
}