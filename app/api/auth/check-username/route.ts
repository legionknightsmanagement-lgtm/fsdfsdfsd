import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    try {
        const lowercaseUsername = username.toLowerCase();
        const adminDb = getAdminDb();
        const docRef = adminDb.collection('usernames').doc(lowercaseUsername);
        const docSnap = await docRef.get();

        return NextResponse.json({
            available: !docSnap.exists,
            message: docSnap.exists ? 'Username already taken' : 'Username available'
        });
    } catch (error) {
        console.error('Check username error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
