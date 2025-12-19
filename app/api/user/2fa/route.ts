import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ error: '2FA is currently disabled by system administrator.' }, { status: 403 });
}

export async function POST() {
    return NextResponse.json({ error: '2FA is currently disabled by system administrator.' }, { status: 403 });
}
