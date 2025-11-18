import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = ( body.name || "" ).trim();
        const email = ( body.email || "").trim().toLowerCase();
        const password = body.password || "";
        
        if (!email || !password) {
            return NextResponse.json (
                {
                    error: "email dan password wajib diisi"
                },
                {
                    status: 400
                }
            );
        }

        if (password.leght < 6) {
            return NextResponse.json (
                {
                    error: "password minimal 6 karakter"
                },
                {
                    status: 400
                }
            );
        }

        await connectDB();
        const exists = await User.findOne({email});
        if (exists) {
            return NextResponse.json(
                {
                    error: "email sudah terdaftar"
                },
                {
                    status: 409
                }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await User.create({ name, email, passwordHash });

        return NextResponse.json({ ok: true }, {status: 201});
    } catch (err) {
        console.error("REGISTER ERROR", err);
        return NextResponse.json(
            { error: "Terjadi kesalahan di server "},
            { status: 500 }
        );
    }
}