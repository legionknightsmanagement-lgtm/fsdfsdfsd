import { NextResponse } from 'next/server';

const RTDB_URL = "https://ssbnerrdndaodata-default-rtdb.firebaseio.com/";

export async function GET() {
    try {
        // Fetch current prediction from RTDB
        const res = await fetch(`${RTDB_URL}/active_prediction.json`);
        let data = await res.json();

        // If no active prediction or expired, the first user to hit this will trigger a new one
        // Note: In a true large scale app, a CRON job or separate server would handle this.
        // For now, if it's null, we return empty and the client (Admin or first User) can't really "generate" it securely.
        // I'll return the data if it exists.

        return NextResponse.json(data || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: 500 });
    }
}

// Admin or System can POST a new prediction
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const res = await fetch(`${RTDB_URL}/active_prediction.json`, {
            method: 'PUT', // Overwrite entire active prediction
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Failed to update RTDB");

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
