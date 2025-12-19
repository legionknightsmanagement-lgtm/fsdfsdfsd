import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

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
        const adminDb = getAdminDb();
        const usersSnap = await adminDb.collection('users').get();
        const users = usersSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                uid: doc.id, // Ensure uid is present for frontend
                ...data
            };
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!await checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const session = await getIronSession<any>(await cookies(), sessionOptions);
        const { action, targetUid, data } = await req.json();
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(targetUid);

        switch (action) {
            case 'ban':
                await userRef.update({
                    banned: {
                        until: data.until,
                        reason: data.reason || 'No reason provided',
                        bannedAt: Date.now(),
                        bannedBy: session.user.username
                    }
                });
                break;
            case 'unban':
                await userRef.update({ banned: null });
                break;
            case 'verify':
                await userRef.update({ verified: data.verified, badge: data.badge });
                break;
            case 'toggleAdmin':
                // Only Reese can toggle admin
                if (session.user.username.toLowerCase() !== 'reese') {
                    return NextResponse.json({ error: 'Only the Owner can toggle Admin roles' }, { status: 403 });
                }
                await userRef.update({ role: data.role });
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error performing admin action:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
