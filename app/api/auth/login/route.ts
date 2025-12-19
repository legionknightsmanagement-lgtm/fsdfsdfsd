import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
// We still need client auth for sign-in logic OR verify password manually.
// Admin SDK doesn't have a "signIn" method because it's for servers.
// Instead, we use the client SDK for the initial login check.
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const lowercaseUsername = username.toLowerCase();
        const dummyEmail = `${lowercaseUsername}@ssb.internal`;

        // 1. Sign in with Client Firebase Auth (to verify password)
        let fbUser;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, dummyEmail, password);
            fbUser = userCredential.user;
        } catch (e: any) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        // 2. Fetch User Profile from Firestore via ADMIN SDK (Bypasses rules)
        const userSnap = await adminDb.collection('users').doc(fbUser.uid).get();

        if (!userSnap.exists) {
            return NextResponse.json({ error: 'User data not found' }, { status: 404 });
        }

        const userData = userSnap.data()!;

        // 2.5 Check for Ban, Disable, and Deletion
        if (userData.banned && userData.banned.until > Date.now()) {
            return NextResponse.json({
                error: `Your account is suspended until ${new Date(userData.banned.until).toLocaleString()}. Reason: ${userData.banned.reason || 'Violation of terms'}`
            }, { status: 403 });
        }

        if (userData.disabled) {
            return NextResponse.json({ error: 'This account has been disabled. Please contact support.' }, { status: 403 });
        }

        if (userData.deletionRequestedAt) {
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - userData.deletionRequestedAt < thirtyDays) {
                return NextResponse.json({
                    needsReactivation: true,
                    uid: fbUser.uid,
                    username: userData.username
                });
            } else {
                return NextResponse.json({ error: 'This account has been permanently deleted.' }, { status: 410 });
            }
        }



        // System Log
        try {
            const adminRtdb = getAdminRtdb();
            await adminRtdb.ref('system_logs').push({
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now(),
                message: `User ${userData.username} logged in.`,
                type: 'info',
                status: 'PROCESSED'
            });
        } catch (e) {
            console.error('Failed to log login event:', e);
        }

        // 3. Set Iron Session
        const session = await getIronSession<any>(await cookies(), sessionOptions);
        session.user = {
            id: fbUser.uid,
            username: userData.username,
            points: userData.points || 0,
            isLoggedIn: true,
            twoFactorEnabled: userData.twoFactorEnabled || false
        };
        await session.save();

        return NextResponse.json({
            ...session.user,
            color: userData.color,
            badge: userData.badge,
            verified: userData.verified,
            isAdmin: userData.role === 'admin' || userData.username.toLowerCase() === 'reese'
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
