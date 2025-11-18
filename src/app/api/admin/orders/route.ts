import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { error } from "console";

const ALLOWED_STATUS = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "complete",
    "canceled"
] as const;

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find({})
        .sort({createdAt: -1})
        .lean();

        return NextResponse.json(
            {orders: JSON.parse(JSON.stringify(orders))},
            {status: 200}
        );
    } catch(err) {
        console.error("ADMIN_LIST_ORDERS_ERROR", err);
        return NextResponse.json(
            {error: "Terjadi kesalahan di server"},
            {status: 500}
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const orderID = body.orderID as string;
        const status = body.status as string;

        if(!orderID || !status) {
            return NextResponse.json(
                {error: "orderId dan status wajib diisi"},
                {status: 400}
            );
        }

        if(!ALLOWED_STATUS.includes(status as any)) {
            return NextResponse.json(
                {error: "status tidak valid"},
                {status: 400}
            );
        }

        await connectDB();
        const order = await Order.findById(orderID);
        if(!order) {
            return NextResponse.json(
                {error: "Pesanan tidak ditemukan"},
                {status: 404}
            );
        }

        order.status = status;
        await order.save();

        return NextResponse.json({ok: true}, {status: 200})
    } catch (err) {
        console.error("ADMIN_UPDATE_ORDER_STATUS_ERROR", err);
        return NextResponse.json(
            {error: "Terjadi kesalahan di server"},
            {status: 500}
        );
    }
}