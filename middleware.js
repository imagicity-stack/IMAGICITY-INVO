import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/' ||
    pathname === '/legacy' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL('/', request.url));
}
