import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export async function POST() {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    session.destroy();

    try {
        await signOut(auth);
    } catch (e) {
        console.warn('Firebase signout warning:', e);
    }

    return NextResponse.json({ ok: true });
}
