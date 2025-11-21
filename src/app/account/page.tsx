"use client";

import { Session } from "inspector/promises";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

type sellerProduct = {
    _id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: string;
};

type sellerStat = {
    productId: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
};

export default function accountPage() {
    const {data: session, status} = useSession();
    const router = useRouter();
    const [products, setProducts] = useState<sellerProduct[]>([]);
    const [stats, setStats] = useState<sellerStat[]>([]);
    const [totalItemsSold, setTotalItemsSold] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    useEffect(() => {
        if(status === "loading") return;
        if(!session) {
            router.push("/login");
        }
    }, [session, status, router]);

    useEffect(() => {
        if(status !== "authenticated") return;
        if(!session.user || (session.user as any).role !== "user") return;
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const res = await fetch("/api/seller/products", {cache: "no-store"});
                const data = await res.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error("Gagal mengambil produk:", err);
            } finally {
                setLoadingProducts(false);
            }
        };
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const res = await fetch("/api/seller/stats", {cache: "no-store"});
                const data = await res.json();
                setStats(data.stats || []);
                setTotalItemsSold(data.totalProductsSold || 0);
                setTotalRevenue(data.totalRevenue || 0);
            } catch (err) {
                console.error("Gagal mengambil statistik:", err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchProducts();
        fetchStats();
    }, [status, session]);
    const isSeller = (session?.user as any)?.role === "user";
    if (status === "loading" || !session) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <p>Memuat akun...</p>
            </main>
        );
    }

    const chartData = {
        labels: stats.map((s) => s.name),
        datasets: [
            {
                label: "Total Terjual",
                data: stats.map((s) => s.totalSold),
                backgroundColor: "#f4b276",
                borderRadius: 12,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {color: "#e5e7eb"}
            },
            title: {
                display: false,
                text: "",
            },
        },
        scales: {
            x: {
                ticks: {color: "#9ca3af"},
                grid: {display: false}
            },
            y: {
                tricks: {color: "#9ca3af", precision: 0},
                grid: {color: "rgba(148, 163, 184, 0.2)"}
            },
        },
    } as const;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">My account</p>
                        <h1 className="text-2xl md:text-3xl font-semibold">{session.user?.name || "User"}</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Role: {""}
                            <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-slate-800 text-slate-100 border border-slate-700">{(session.user as any)?.role || ""}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 md:items-end">
                        <a href="/" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm">Kembali ke beranda</a>
                        {(session.user as any)?.role === "user" && (
                            <a href="/products/upload" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-400 text-slate-950 text-sm font-semibold shadow-lg shadow-pink-500/30">Unggah Produk</a>
                        )}
                        {(session.user as any)?.role === "admin" && (
                            <a href="/admin" className="w-full md:w-auto text-center px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-sm font-semibold shadow-lg shadow-indigo-500/30">
                                Dashboard Admin
                            </a>
                        )}
                        <button onClick={() => signOut({callbackUrl: "/"})} className="w-full md:w-auto px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold">Keluar</button>
                    </div>
                </div>
                {isSeller && (
                    <>
                        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg md:text-xl font-semibold">Produk yang saya jual</h2>
                                <span className="text-xs text-slate-400">
                                    {loadingProducts ? "Memuat produk..." : `${products.length} produk ditemukan`}
                                </span>
                            </div>
                            {loadingProducts ? (
                                <p className="text-sm text-slate-400">Memuat produk...</p>
                            ) : products.length === 0 ? (
                                <p className="text-sm text-slate-400">Anda belum mengunggah produk.</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {products.map((p) => (
                                        <div key={p._id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                                            {p.imageUrl && (
                                                <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-900 mb-2">
                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover"/>
                                                </div>
                                            )}
                                            <h3 className="font-semibold text-sm line-clamp-2">{p.name}</h3>
                                            <p className="text-sm text-pink-300">{p.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                                            <p className="text-xs text-slate-400">Stok: {p.stock}</p>
                                            <a href={`/products/${p.slug}`} className="mt-2 text-xs text-pink-300 hover:text-pink-200 underline underline-offset-4">Lihat Detail</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg md:text-xl font-semibold">Statistik penjulan saya</h2>
                                {!loadingStats && (
                                    <div className="text-xs text-slate-400 text-right">
                                        <div>
                                            Total terjual
                                            <span className="font-semibold text-pink-300">{totalItemsSold}</span>
                                        </div>
                                        <div>
                                            Total pendapatan: {""}
                                            <span className="font-semibold text-pink-300">
                                                {totalRevenue.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {loadingStats ? (
                                <p className="text-sm text-slate-400">Memuat statistik penjualan...</p>
                            ) : stats.length === 0 ? (
                                <p className="text-sm text-slate-400">Anda belum memiliki statistik penjualan.</p>
                            ) : (
                                <div className="w-full max-w-3xl mx-auto">
                                    <Bar data={chartData} options={chartOptions}></Bar>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}