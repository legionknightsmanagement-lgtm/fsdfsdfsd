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
        const logsRef = adminRtdb.ref('system_logs');
        const snapshot = await logsRef.limitToLast(50).get();
        const data = snapshot.val();

        // Convert object to array
        const logs = data ? Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) : [];

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // This could be used by the AI/System to push logs
    // For now, let's just make it available for system-level logging
    try {
        const { message, type = 'info' } = await req.json();
        const adminRtdb = getAdminRtdb();
        const logsRef = adminRtdb.ref('system_logs');

        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            message,
            type,
            status: 'PROCESSED'
        };

        await logsRef.push(newLog);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
