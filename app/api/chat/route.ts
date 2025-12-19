import { NextResponse } from 'next/server';

const RTDB_URL = "https://ssbnerrdndaodata-default-rtdb.firebaseio.com/";

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: number;
    color: string;
    badge?: string;
    isSystem?: boolean;
    isHype?: boolean;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || 'global';

    try {
        const res = await fetch(`${RTDB_URL}/chat/${roomId}.json`);
        const data = await res.json();

        if (!data) return NextResponse.json([]);

        // RTDB returns an object, we need an array
        const messages = Object.values(data) as ChatMessage[];
        return NextResponse.json(messages.sort((a, b) => a.timestamp - b.timestamp));
    } catch (e) {
        console.error("RTDB Fetch Error:", e);
        return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { roomId = 'global', message } = body;

        if (!message) return NextResponse.json({ error: 'No message provided' }, { status: 400 });

        // Push to RTDB
        const res = await fetch(`${RTDB_URL}/chat/${roomId}.json`, {
            method: 'POST',
            body: JSON.stringify(message)
        });

        if (!res.ok) throw new Error("RTDB Save Failed");

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("RTDB Save Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
