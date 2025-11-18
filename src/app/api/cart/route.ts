import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/product";
import { error } from "console";

async function getUserId(req: NextRequest) {
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    if(!token || !token.sub) return null;
    return token.sub;
}

export async function GET(req: NextRequest) {
    const userId = await getUserId(req);
    if(!userId) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    await connectDB();
    const cart = await Cart.findOne({userId})
    .populate("items.productId")
    .lean() as any;

    if(!cart) {
        return NextResponse.json({items: []}, {status: 200})
    }

    const safeCart = {
        items: cart.items.map((item: any) => ({
            product: {
                _id: item.productId._id.toString(),
                name: item.productId.name,
                slug: item.productId.slug,
                price: item.productId.price,
                imageUrl: item.productId.imageUrl,
            },
            quantity: item.quantity,
        })),
    };

    return NextResponse.json(safeCart, {status: 200});
}

export async function POST(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const body = await req.json();
    const productId = body.productId as string;
    const qty = Number(body.quantity || 1);

    if(!productId || qty <= 0) {
        return NextResponse.json({error: "Data tidak valid"}, {status: 400});
    }

    await connectDB();
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        return NextResponse.json({error: "produk tidak ditemukan"}, {status: 404});
    }

    let cart = await Cart.findOne({userId});

    if(!cart) {
        cart = await Cart.create({
            userId,
            items: [{productId, quantity: qty}],
        });
    } else {
        const existing = cart.items.find(
            (it: any) => it.productId.toString() === productId
        );

        if(existing) {
            existing.quantity += qty;
        } else {
            cart.items.push({productId, quantity: qty});
        }
        await cart.save();
    }

    return NextResponse.json({ok: true}, {status: 200});
}

export async function PATCH(req: NextRequest) {
    const userId = await getUserId(req);
    if(!userId) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const body = await req.json();
    const productId = body.productId as string;
    const qty = Number(body.quantity);

    if(!productId || Number.isNaN(qty)) {
        return NextResponse.json({error: "Data tidak valid"}, {status: 400});
    }

    await connectDB();
    const cart = await Cart.findOne({userId});
    if(!cart) {
        return NextResponse.json({ok: true, items: []}, {status: 200});
    }

    const idx = cart.items.findIndex(
        (it: any) => it.productId.toString() === productId
    );
    if(idx === -1) {
        return NextResponse.json({ok: true}, {status: 200});
    }

    if(qty <= 0) {
        cart.items.splice(idx, 1);
    } else {
        cart.items[idx].quantity = qty;
    }

    await cart.save();
    return NextResponse.json({ok: true}, {status: 200});
}