import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const name = (body.name || "").trim();
        const slug = (body.slug || "").trim().toLowerCase();
        const price = Number(body.price || 0);
        const stock = Number(body.stock || 0);
        const imageUrl = (body.imageUrl || "").trim();
        const category = (body.category || "").trim();
        const description = (body.description || "").trim();

        if(!name || !slug || !price) {
            return NextResponse.json(
                {error: "Nama, slug, dan harga wajib diisi"},
                {status: 400}
            );
        }

        const product = await Product.create({
            name, slug, price, stock, imageUrl, category, description
        });

        return NextResponse.json({ok: true, product}, {status: 201});
    } catch(err) {
        console.error("ADMIN_CREATE_PRODUCT_ERROR", err);
        return NextResponse.json(
            {error: "terjadi kesalahan di server"},
            {status: 500}
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({})
        .sort({createdAt: -1})
        .lean();

        return NextResponse.json({
            products: JSON.parse(JSON.stringify(products)),
        });
    } catch(err) {
        console.error("ADMIN_LIST_PRODUCT_ERROR", err);
        return NextResponse.json(
            {error: "terjadi kesalahan di server"},
            {status: 500}
        );
    }
}