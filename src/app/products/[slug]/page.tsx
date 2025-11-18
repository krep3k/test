import { connectDB } from "@/lib/db";
import Product from "@/models/product";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { number } from "zod";

export default async function ProductDetailPage({
    params,
} : {
    params: Promise<{slug: string}>;
}) {
    const {slug} = await params;
    await connectDB();
    const productDoc = await Product.findOne ({slug}).lean();
    if(!productDoc) {
        return notFound();
    }

    const p: any = JSON.parse(JSON.stringify(productDoc));

    return (
        <main className="min-h-screen px-4 py-10 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto space-y-6">
                <a href="/" className="inline-flex text-xs text-sky-400 underline mb-2">← Kembali ke beranda</a>
                <div className="grid gap-6 md:grid-cols-[1.2fr, 1fr]">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex items-center justify-center">
                        {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="max-h-80 w-full object-contain"/>
                        ): (
                            <div className="h-64 w-full flex items-center justify-center text-xs text-slate-500">
                                Belum ada gambar
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-xl font-semibold">{p.name}</h1>
                        <p className="text-sky-400 text-lg ">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-slate-400">
                            Stok tersedia:  {p.stock ?? 0}
                        </p>
                        {p.category && (
                            <p className="text-xs text-slate-400">
                                Katergori:{""}
                                <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 ">
                                    {p.category}
                                </span>
                            </p>
                        )}
                        {p.description && (
                            <p className="text-sm text-slate-300 whitespace-pre-line">
                                {p.description}
                            </p>
                        )}
                        <AddToCartButton productId={p._id}></AddToCartButton>
                    </div>
                </div>
            </div>
        </main>
    );
}