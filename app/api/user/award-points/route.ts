import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);

    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { amount } = await req.json();

        if (typeof amount !== 'number') {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const userDocRef = adminDb.collection('users').doc(session.user.id);
        const userSnap = await userDocRef.get();
        if (userSnap.exists) {
            const userData = userSnap.data()!;
            if (userData.banned && userData.banned.until > Date.now()) {
                return NextResponse.json({ error: 'Banned users cannot earn points' }, { status: 403 });
            }
        }

        // Update Firestore via Admin SDK (Bypasses rules)
        await userDocRef.update({
            points: admin.firestore.FieldValue.increment(amount)
        });

        // Fetch fresh balance
        const updatedSnap = await userDocRef.get();
        const newPoints = updatedSnap.data()?.points || 0;

        // Update Session for UI consistency
        session.user.points = newPoints;
        await session.save();

        return NextResponse.json({ points: newPoints });
    } catch (error) {
        console.error('Error awarding points via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
