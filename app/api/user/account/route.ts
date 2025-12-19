import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { action } = await req.json();
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(session.user.id);

        switch (action) {
            case 'requestDeletion':
                await userRef.update({
                    deletionRequestedAt: Date.now(),
                    status: 'PENDING_DELETION'
                });
                // Log them out after requesting deletion? User said they have 30 days to sign back in.
                // Usually we keep the session or log out. Let's log out to be safe.
                session.destroy();
                return NextResponse.json({ success: true, message: 'Account marked for deletion. You have 30 days to reactivate it by logging back in.' });

            case 'disable':
                await userRef.update({
                    disabled: true,
                    disabledAt: Date.now()
                });
                session.destroy();
                return NextResponse.json({ success: true, message: 'Account disabled.' });

            case 'reactivate':
                await userRef.update({
                    deletionRequestedAt: null,
                    disabled: false,
                    status: 'active'
                });
                return NextResponse.json({ success: true, message: 'Account reactivated!' });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Account action error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
