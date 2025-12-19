import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const gameUrl = searchParams.get('url');

    if (!gameUrl || !gameUrl.startsWith('https://methstreams.ms/stream/')) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const response = await fetch(gameUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch game page: ${response.status}`);
        }

        const html = await response.text();

        // Looking for the "allStreams" JSON in the page source
        const streamsMatch = html.match(/const allStreams\s*=\s*(\[[\s\S]*?\]);/);

        if (streamsMatch) {
            try {
                const allStreams = JSON.parse(streamsMatch[1]);
                // Clean up the value URLs (sometimes they have multiple parameters)
                const cleanedStreams = allStreams.map((s: any) => ({
                    label: s.label || 'Link',
                    value: s.value
                }));
                return NextResponse.json({ streams: cleanedStreams });
            } catch (e) {
                console.error('Failed to parse allStreams JSON');
            }
        }

        // Fallback: look for any iframe with player.php or embed
        const iframeMatch = html.match(/<iframe[^>]*src="([^"]*(?:player\.php|embed|pooembed|tech|vpro|drain)[^"]*)"/i);
        if (iframeMatch) {
            return NextResponse.json({ streams: [{ label: 'Default Link', value: iframeMatch[1] }] });
        }

        return NextResponse.json({ error: 'Player source not found on page' }, { status: 404 });
    } catch (error: any) {
        console.error('MethStreams player scraper error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
