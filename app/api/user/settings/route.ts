import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    const session = await getIronSession<any>(await cookies(), sessionOptions);
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { color, badge, profilePic } = await req.json();
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(session.user.id);

        const updates: any = {};
        if (color) updates.color = color;
        if (badge) updates.badge = badge;
        if (profilePic) updates.profilePic = profilePic;

        await userRef.update(updates);

        // Update session
        if (color) session.user.color = color;
        if (badge) session.user.badge = badge;
        if (profilePic) session.user.profilePic = profilePic;
        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
