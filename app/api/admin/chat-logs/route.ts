import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin';

async function checkAdmin(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) return false;

    const adminDb = getAdminDb();
    const userSnap = await adminDb.collection('users').doc(session.user.id).get();
    if (!userSnap.exists) return false;

    const userData = userSnap.data()!;
    return userData.role === 'admin' || userData.username.toLowerCase() === 'reese';
}

export async function GET(req: NextRequest) {
    if (!await checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const roomId = url.searchParams.get('roomId') || 'global';
        const limit = parseInt(url.searchParams.get('limit') || '100');

        const adminRtdb = getAdminRtdb();
        const chatSnap = await adminRtdb.ref(`chat/${roomId}`).limitToLast(limit).once('value');
        const logs = chatSnap.val() || {};

        return NextResponse.json(Object.values(logs).reverse());
    } catch (error) {
        console.error('Error fetching chat logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
