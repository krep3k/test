import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Types } from "mongoose";

export async function GET() {
    const session = await getServerSession(authOptions);

    if(!session || !session.user || !(session.user as any).id) {
        return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    await connectDB();
    const sellerId = new Types.ObjectId((session.user as any).id);
    const pipeline = [
        {
            $match: {status: {$in: ["paid", "completed"]}}
        },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product"
            },
        },
        { $unwind: "$product" },
        { $match: { "product.userId": sellerId } },
        {
            $group: {
                _id: "$product._id",
                name: { $first: "$product.name" },
                totalSold: { $sum: "$items.quantity" },
                totalRevenue: { $sum: { $multiply: ["$items.quantity", "$product.price"] } },
            },
        },
        { $sort: { totalSold: -1 } },
    ];

    const raw = await (Order as any).aggregate(pipeline);
    let totalRevenue = 0;
    let totalProductsSold = 0;
    const stats = raw.map((row: any) => {
        const sold = row.totalSold || 0;
        const rev = row.totalRevenue || 0;
        totalProductsSold += sold;
        totalRevenue += rev;
        return {
            productId: row._id.toString(),
            name: row.name,
            totalSold: sold,
            totalRevenue: rev,
        };
    });
    return NextResponse.json({stats, totalRevenue, totalProductsSold});
}