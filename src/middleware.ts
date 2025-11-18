import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { url } from "inspector";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

    const needLogin = 
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("cart") || 
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/api/orders");

    if(needLogin && !token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (!token || (token as any).role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }
    return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*", "/cart/:path*", "/api/cart/:path*", "/checkout/:path*", "/orders/:path*", "/api/orders/:path*"]};