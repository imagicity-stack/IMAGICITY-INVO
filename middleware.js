import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request) {
  try {
    const { pathname } = request.nextUrl;
    const isPublicFile = PUBLIC_FILE.test(pathname);
    const isBypassedPath =
      pathname === '/' ||
      pathname === '/legacy' ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/public') ||
      pathname === '/favicon.ico';

    if (isPublicFile || isBypassedPath) {
      return NextResponse.next();
    }

    return NextResponse.rewrite(new URL('/', request.url));
  } catch (error) {
    console.error('Middleware failed; allowing request to continue:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
