import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { signOut } from "next-auth/react";
import Product from "@/models/product";

type simpleProduct = {
  _id: string;
  name: string;
  price: number;
  slug: string;
  stock: number;
  imageUrl: string;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

async function getLatestProducts(): Promise<simpleProduct[]> {
  await connectDB();
  const docs = await Product.find({isActive: true}).sort({createdAt: -1}).limit(3).lean();
  return docs.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    slug: p.slug,
    stock: p.stock ?? 0,
    imageUrl: p.imageUrl ?? "",
  }));
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const products = await getLatestProducts();
  const user = session?.user as any || undefined;
  const role = user?.role || "guest";
  const firstLetter = typeof user?.name === "string" && user.name.length > 0 ? user.name[0].toUpperCase() : "U";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#120020] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-10 lg:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <section className="flex-1">
            <p className="text-xs font-semibold tracking-[0.35em] text-pink-400">SELAMAT DATANG</p>
            <h1 className="">
              di E-Commerce {""}
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">SMK Letris Indonesia 2</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300">
              Platform bagi para siswa agar dapat memasarkan produk hasil karya mereka secara online. Temukan berbagai produk menarik yang dibuat dengan penuh kreativitas dan semangat kewirausahaan siswa.
            </p>
            <div className="mt-8 max-w-md rounded-3xl border border-pink-500/10 bg-slate-950/60 p-5 shadow-[0_18px_45px_rgba(255,0,128,0.15)] backdrop-blur">
              {user ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 text-lg font-bold text-white">{firstLetter}</div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold tracking-[0.25em] text-pink-300">HALO</span>
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-slate-400">
                        Role: {""}
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-pink-300">{role}</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href="/account" className="rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-pink-600">Lihat Akun</a>
                    {role === "admin" ? (
                      <a href="/admin/orders" className="rounded-full border border-pink-400/70 px-4 py-2 text-xs font-semibold text-pink-200 hover:bg-pink-500/10">Kelola Pesanan</a>
                    ) : (
                      <a href="/orders" className="rounded-full border border-pink-400/70 px-4 py-2 text-xs font-semibold text-pink-200 hover:bg-pink-500/10">Riwayat Pesanan</a>
                    )}
                    {role === "user" && (
                      <a href="/products/upload" className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold text-white shadow hover:from-pink-600 hover:to-fuchsia-600">Upload Produk</a>
                    )}
                    {role === "admin" && (
                      <a href="/admin" className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700">Dashboard Admin</a>
                    )}
                    {role === "user" && (
                      <a href="/cart" className="rounded-full border border-pink-400/70 px-4 py-2 text-xs font-semibold text-pink-200 hover:bg-pink-500/10">Keranjang</a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-100">Kamu belum login</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Silahkan masuk untuk mengakses fitur penuh dari platform ini.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href="/login" className="rounded-full bg-pink-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-pink-600">Masuk</a>
                    <a href="/register" className="rounded-full border border-pink-400/70 px-5 py-2 text-xs font-semibold text-pink-200 hover:bg-pink-500/10">Daftar</a>
                  </div>
                </>
              )}
            </div>
          </section>
          <section className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-[0.25em] text-slate-300">PRODUK TERBARU</h2>
              <span className="text-[11px] text-slate-400">{products.length} Produk tersedia</span>
            </div>
            {products.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
                Belum ada produk tersedia saat ini. Silahkan cek kembali nanti atau upload produk melalui tombol {""}
                <span className="font-semibold text-pink-300">Upload Produk</span>{""}
                di panel kiri
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <a href={`/products/${p.slug}`} key={p._id} className="group flex flex-col rounded-3xl border border-slate-800 bg-slate-950/60 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-pink-500/70 hover:bg-slate-900/80">
                    <div className="relative mb-3 overflow-hidden rounded-2xl bg-slate-900/80 pt-[75%]">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">Belum ada gambar</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="text-sm font-semibold text-slate-50">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-pink-300">
                        {formatRupiah(p.price)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">Stok: {p.stock}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
        <footer className="mt-12 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-sky-400 text-sm font-bold text-white">
                <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full"/>
              </div>
              <div>
                <p className="font-semibold text-slate-100">E-Commerce SMK Letris Indonsia 2</p>
                <p className="text-[11px] text-slate-400">&copy; fiqri & friends</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-[11px] sm:text-right">
              <p>
                powered by:{""}
                <span className="font-medium text-pink-300">
                  fiqrimuhamad135@gmail.com
                </span>
              </p>
              <p>
                Instagram:{""}
                <span className="font-medium text-pink-300">
                  <a href="">@linkInstagram</a>
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-500">
            &copy; Semua hak dilindungi undang-undang. E-Commerce SMK Letris Indonesia 2 adalah platform yang masih bersifat edukasi dan demonstrasi saja.
          </div>
        </footer>
      </div>
    </main>
  )
}