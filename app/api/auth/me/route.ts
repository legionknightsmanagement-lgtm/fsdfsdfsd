import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
    const session = await getIronSession<any>(await cookies(), sessionOptions);

    if (session.user) {
        try {
            // Fetch fresh data from Firestore via ADMIN SDK
            const adminDb = getAdminDb();
            const userSnap = await adminDb.collection('users').doc(session.user.id).get();

            if (userSnap.exists) {
                const userData = userSnap.data()!;

                // Server-side Admin Check
                const isAdmin = userData.role === 'admin' || userData.username.toLowerCase() === 'reese';
                const isBanned = userData.banned && userData.banned.until > Date.now();

                return NextResponse.json({
                    ...session.user,
                    points: userData.points || 0,
                    color: userData.color,
                    badge: userData.badge,
                    profilePic: userData.profilePic,
                    twoFactorEnabled: userData.twoFactorEnabled,
                    verified: userData.verified,
                    isAdmin: isAdmin,
                    banned: isBanned,
                    banInfo: isBanned ? userData.banned : null
                });
            }
        } catch (e) {
            console.error('Error fetching user data via Admin SDK:', e);
            return NextResponse.json(session.user);
        }
    }

    return NextResponse.json({ isLoggedIn: false });
}
