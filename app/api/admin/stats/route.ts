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
        const adminRtdb = getAdminRtdb();
        const statsRef = adminRtdb.ref('user_stats');
        const snapshot = await statsRef.get();
        const stats = snapshot.val() || {};

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
