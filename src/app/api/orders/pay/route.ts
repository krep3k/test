import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if(!session || !session.user || !(session.user as any).id) {
            return NextResponse.json(
                {error: "Harap login terlebih dahulu"},
                {status: 401}
            );
        }
        const {orderId} = await req.json();
        if(!orderId) {
            return NextResponse.json(
                {error: "orderId diperlukan"},
                {status: 400}
            );
        }

        await connectDB();
        const order = await Order.findOne(
            {
                _id: orderId,
                user: (session.user as any).id,
            }
        );

        if(!order) {
            return NextResponse.json({error: "Pesanan tidak ditemukan"}, {status: 404});
        }
        if(order.status === "paid" || order.status === "completed") {
            return NextResponse.json({ok: true, status: order.status});
        }
        order.status = "paid";
        await order.save();
        return NextResponse.json({ok: true, status: order.status});
    } catch(err) {
        console.error("PAY_ORDER_ERROR:", err);
        return NextResponse.json({error: "Terjadi kesalahan pada server"}, {status: 500});
    }
}