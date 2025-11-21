import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";
import { Types } from "mongoose";
import { sl } from "zod/locales";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    await connectDB();
    const userId = new Types.ObjectId((session.user as any).id);

    const products = await Product.find({userId, isActive: true}).sort({createdAt: -1}).lean();
    return NextResponse.json({
        products: products.map((p: any) => ({
            _id: p._id.toString(),
            name: p.name,
            price: p.price,
            slug: p.slug,
            stock: p.stock ?? 0,
            imageUrl: p.imageUrl ?? "",
            catergory: p.category ?? "",
        })),
    });
}