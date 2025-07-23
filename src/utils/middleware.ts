import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('__session')?.value

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Optional: validate token via backend or Firebase Admin SDK proxy API if needed

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/event/:path*'] // Protect these routes
}
