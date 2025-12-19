import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
    const { username } = params;

    try {
        const adminDb = getAdminDb();
        const usersRef = adminDb.collection('users');

        // Find user by username (case-insensitive search would be better, but let's assume exact or lowercase match is stored)
        const query = await usersRef.where('username', '==', username).limit(1).get();

        if (query.empty) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userDoc = query.docs[0];
        const userData = userDoc.data();

        // Return only public data
        return NextResponse.json({
            id: userDoc.id,
            username: userData.username,
            profilePic: userData.profilePic,
            color: userData.color,
            badge: userData.badge,
            verified: userData.verified,
            createdAt: userData.createdAt || Date.now(),
            bio: userData.bio || `Welcome to ${userData.username}'s channel!`,
            followers: userData.followersCount || 0
        });

    } catch (error: any) {
        console.error('Error fetching public profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
