"use client";

import link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";

export async function getLatestProducts() {
  await connectDB();
  const products = await Product.find({isActive: true})
  .sort({createdAt: -1})
  .limit(8)
  .lean();

  return JSON.parse(JSON.stringify(products)) as any[];
}

export default async function Home() {
  const products = await getLatestProducts();
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 text-slate-100 px-4 pb-16">
      <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 right-0 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl"></div>

      <div className="relative max-w-5xl mx-auto pt-20">
        <section className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.35em] text-sky-400 mb-4">E-Commerce • v0.1</p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Selamat Datang
            <span className="block mt-3 text-lg md:text-xl font-normal text-slate-300">
              ke pengalaman belanja{""}
              <span className="text-sky-400 font-medium"> Futuristik</span>
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 mb-8 max-w-xl mx-auto">
            Sistem masih dalam tahap pengujian. Silahkan buat akun atau masuk untuk menguji alur login, akun, dan transaksi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/login" className="inline-flex items-center justify-center rounded-full border border-sky-400/70 bg-sky-500/20 px-7 py-2.5 text-sm font-medium tracking-wide hover:bg-sky-500/35 hover:border-sky-300 transition">Masuk</a>
            <a href="/register" className="inline-flex items-center justify-center rounded-full border border-slate-600 px-7 py-2.5 text-sm font-medium tracking-wide hover:border-slate-300 hover:bg-slate-800/70 transition">Daftar</a>
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-slate-200">Produk Terbaru</h2>
            <span className="text-[11px] text-slate-500">
              {products.length === 0
              ? "Belum ada produk"
              : `${products.length} produk ditampilkan`
              }
            </span>
          </div>
          {products.length ===0 ? (
            <p className="text-xs text-slate-500">
              Tambahkan produk dari admin untuk melihat daftar di sini.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p: any) => (
                <a href={`/products/${p.slug}`} key={p._id} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-3 hover:border-sky-500/60 hover:bg-slate-900 transition">
                  <div className="aspect-4/3 mb-2 overflow-hidden rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-[1.03] transition"/>
                    ) : (
                      <span>Belum ada gambar</span>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-xs text-sky-400 mb-1">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                  <p className="text-[11px] text-slate-500">Stok: {p.stock ?? 0}</p>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}