import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token } = await req.json();
  const res = NextResponse.json({ ok: true });
  res.cookies.set('token', token, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}
