import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();

        const lowercaseUsername = username.toLowerCase();
        const usernameDocRef = adminDb.collection('usernames').doc(lowercaseUsername);

        // 1. Check uniqueness using Admin SDK (Bypasses rules)
        const usernameSnap = await usernameDocRef.get();
        if (usernameSnap.exists) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        // 2. Create Firebase Auth user via Admin SDK
        const dummyEmail = `${lowercaseUsername}@ssb.internal`;
        const fbUser = await adminAuth.createUser({
            email: dummyEmail,
            password: password,
            displayName: username
        });

        // 3. Save User Data to Firestore via Admin SDK
        const userData = {
            uid: fbUser.uid,
            username: username,
            lowercaseUsername: lowercaseUsername,
            points: 0,
            createdAt: Date.now(),
            verified: false,
            role: lowercaseUsername === 'reese' ? 'admin' : 'user'
        };

        await usernameDocRef.set({ uid: fbUser.uid });
        await adminDb.collection('users').doc(fbUser.uid).set(userData);

        // 4. Set Iron Session
        const session = await getIronSession<any>(await cookies(), sessionOptions);
        session.user = {
            id: fbUser.uid,
            username: username,
            points: 0,
            isLoggedIn: true,
        };
        await session.save();

        return NextResponse.json(session.user);
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
