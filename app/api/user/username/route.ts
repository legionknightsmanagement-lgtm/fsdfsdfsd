import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { newUsername } = await req.json();
        if (!newUsername || newUsername.length < 3) {
            return NextResponse.json({ error: 'Username too short' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();
        const userRef = adminDb.collection('users').doc(session.user.id);
        const userSnap = await userRef.get();

        if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const userData = userSnap.data()!;
        const now = Date.now();
        const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

        // 1. Check Cooldown
        if (userData.lastUsernameChange && (now - userData.lastUsernameChange < TWO_WEEKS)) {
            const remaining = TWO_WEEKS - (now - userData.lastUsernameChange);
            const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
            return NextResponse.json({ error: `You can change your username again in ${days} days.` }, { status: 403 });
        }

        // 2. Check Uniqueness
        const lowercaseNew = newUsername.toLowerCase();
        const usernameDoc = await adminDb.collection('usernames').doc(lowercaseNew).get();
        if (usernameDoc.exists) {
            // Check if it's the same user (unlikely if they are changing, but good safety)
            if (usernameDoc.data()?.uid !== session.user.id) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
            }
        }

        const oldUsername = userData.username;
        const lowercaseOld = oldUsername.toLowerCase();

        // 3. Update Firestore & Auth
        const batch = adminDb.batch();

        // Remove old username reservation
        batch.delete(adminDb.collection('usernames').doc(lowercaseOld));

        // Add new username reservation
        batch.set(adminDb.collection('usernames').doc(lowercaseNew), {
            uid: session.user.id,
            availableAt: now + TWO_WEEKS // The old username logic requested by user: "once a username is changed it goes back into being available in 2 weeks"
        });

        batch.update(userRef, {
            username: newUsername,
            lowercaseUsername: lowercaseNew,
            lastUsernameChange: now,
            usernameHistory: [...(userData.usernameHistory || []), { old: oldUsername, changedAt: now }]
        });

        await batch.commit();
        await adminAuth.updateUser(session.user.id, { displayName: newUsername });

        // 4. Update Session
        session.user.username = newUsername;
        await session.save();

        return NextResponse.json({ success: true, username: newUsername });

    } catch (error: any) {
        console.error('Username change error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
