import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/product";
import Order from "@/models/Order";
import { error } from "console";

async function getUserId(req: NextRequest) {
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    if(!token || !token.sub) return null;
    return token.sub;
}

export async function GET(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    await connectDB();

    const orders = await Order.find({userId})
    .sort({createdAt: -1})
    .lean();

    return NextResponse.json(
        {orders: JSON.parse(JSON.stringify(orders))},
        {status: 200},
    );
}


export async function POST(req: NextRequest) {
    const userId = await getUserId(req);
    if(!userId) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const body = await req.json();
    const shipping = {
        fullname: (body.fullname || "").trim(),
        phone: (body.phone || "").trim(),
        line1: (body.line1 || "").trim(),
        city: (body.city || "").trim(),
        province: (body.province || "").trim(),
        postal: (body.postal || "").trim(),
    };

    if (
        !shipping.fullname ||
        !shipping.phone ||
        !shipping.line1 ||
        !shipping.city ||
        !shipping.province ||
        !shipping.postal
    ) {
        return NextResponse.json({error: "Data alamat belum lengkap"}, {status: 400});
    }

    await connectDB();
    const cart = await Cart.findOne({userId}).populate("items.productId");
    if(!cart || cart.items.lenght === 0) {
        return NextResponse.json({error: "Keranjang masih kosong"}, {status: 400});
    }

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of cart.items as any[]) {
        const product = item.productId;
        if(!product) continue;

        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: item.quantity,
        });

        product.stock = (product.stock || 0) - item.quantity;
        if(product.stock < 0) product.stock = 0;
        await product.save();
    }

    if(orderItems.length === 0) {
        return NextResponse.json({error: "Produk di keranjang tidak valid"}, {status: 400});
    }

    const shippingCost = 20000;
    const total = subtotal + shippingCost;

    const order = await Order.create({
        userId,
        items: orderItems,
        shippingAddress: shipping,
        subtotal,
        shippingCost,
        total,
        status: "pending",
        paymentMethod: "manual",
    });

    cart.items = [];
    await cart.save();

    return NextResponse.json({ok: true, orderId: order._id.toString()}, {status: 201});
}