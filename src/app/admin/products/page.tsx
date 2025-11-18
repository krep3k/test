"use client";

import React, { useEffect, useState } from "react";

type Product = {
    _id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: string;
};

export default function AdminProductsPage() {
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState <string | null>(null);
    const [products, setProducts] = useState<Product[] > ([]);

    async function loadProducts() {
        try {
            setListLoading(true)
            setError(null);

            const res = await fetch("/api/products", {
                cache: "no-store",
            });

            if(!res.ok) {
                const text = await res.text();
                console.error("gagal load produk:", res.status, text);
                setError(`Gagal memuat produk (status ${res.status})`);
                setListLoading(false);
                return;
            }

            const data = await res.json();
            setProducts (data.products || []);
            setListLoading(false);
        } catch(err) {
            console.error("ERROR loadProducts:", err);
            setError("Terjadi error saat memuat produk");
            setListLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setLoading(true);

        const res = await fetch("/api/admin/products", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: form.get("name"),
                slug: form.get("slug"),
                price: form.get("price"),
                stock: form.get("stock"),
                imageUrl: form.get("imageUrl"),
                category: form.get("category"),
                description: form.get("description"),
            }),
        });

        const data = await res.json().catch(() => ({}));
        setLoading(false);

        if(!res.ok) {
            alert(data.error || "gagal menyimpan product");
            return;
        }
        (e.target as HTMLFormElement).reset();
        await loadProducts();
    }

    return (
        <main className="min-h-screen px-4 py-8 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold">Manajemen Produk</h1>
                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <h2 className="text-sm font-semibold mb-3">Tambah Produk Baru</h2>
                    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2 text-sm">
                        <label><input name="name" placeholder="Nama Produk" className="rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2" required/></label>
                        <label><input name="slug" placeholder="Slug (contoh: hoodie-hitam-unik)" className="rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2" required/></label>
                        <label><input name="price" type="number" placeholder="Harga (Rp)" className="rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2" required/></label>
                        <label><input name="stock" type="number" placeholder="Stok" className="rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2"/></label>
                        <label><input name="imageUrl" placeholder="URL gambar (opsional)" className="md:col-span-2 rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2"/></label>
                        <label><input name="category" placeholder="Kategori (opsional)" className="rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2"/></label>
                        <label><input name="description" placeholder="Deskripsi (opsional)" className="md:col-span-2 min-h-20 rounded-lg border boder-slate-700 bg-slate-900 px-3 py-2"/></label>
                        <button disabled={loading} className="md:col-span-2 mt-1 rounded-lg bg-sky-500 py-2 font-medium text-slate-950 hover:bg-sky-400 disabled: opacity-60">{loading ? "Menyimpan...": "Simpan Produk"}</button>
                    </form>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm">
                    <h2 className="text-sm font-semibold mb-3">Daftar Produk</h2>
                    {listLoading && (
                        <p className="text-slate-400 text-xs">Memuat data produk...</p>
                    )}
                    {error && !listLoading && (
                        <p className="text-red-400 text-xs mb-2">{error}</p>
                    )}
                    {!listLoading && !error && products.length === 0 && (
                        <p className="text-slate-400 text-xs">Belum ada produk. tambahkan produk melalui form diatas</p>
                    )}
                    {!listLoading && !error && products.length > 0 && (
                        <div className="space-y-2">
                            {products.map((p) => (
                                <div key={p._id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-xs text-slate-400">
                                            slug: {p.slug} • Rp{""}
                                            {p.price.toLocaleString("id-ID")} • stok: {p.stock}
                                        </p>
                                    </div>
                                    <a href={`/products/${p.slug}`} className="text-xs text-sky-400 underline" target="_blank">Lihat</a>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}