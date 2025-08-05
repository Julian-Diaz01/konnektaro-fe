import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/utils/firebase';
console.log('Firebase Auth:', auth);
// Define public paths that don't require authentication
const PUBLIC_PATHS = [
    '/login', 
    '/_next', 
    '/favicon.ico',
]

// Define admin-only paths
/*const ADMIN_PATHS = [
    '/admin',
    '/create-event',
    '/edit-event',
]*/

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    
    // Allow public paths
    if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
        return NextResponse.next()
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
}
