import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";
import { error } from "console";

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({isActive: true})
        .sort({createdAt: -1})
        .limit(12)
        .lean();

        return NextResponse.json({
            products: JSON.parse(JSON.stringify(products)),
        });
    } catch(err) {
        console.error("PUBLIC_LIST_PRODUCT_ERROR", err);
        return NextResponse.json(
            {error: "terjadi kesalahan di server"},
            {status: 500}
        );
    }
}