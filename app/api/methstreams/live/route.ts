import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const homepageResponse = await fetch('https://methstreams.ms', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 300 }
        });

        if (!homepageResponse.ok) throw new Error(`Failed to fetch homepage: ${homepageResponse.status}`);
        const homepageHtml = await homepageResponse.text();

        // Find league pages (e.g., /league/nbastreams)
        const leagueLinks = Array.from(new Set(homepageHtml.match(/\/league\/[^"]+/g) || []));

        // Minor optimization: only scrape common sports leagues
        const priorityLeagues = ['nba', 'nfl', 'soccer', 'ufc', 'nhl', 'mlb', 'boxing', 'cfb', 'cbb'];
        const leaguesToScrape = leagueLinks.filter(link =>
            priorityLeagues.some(p => link.toLowerCase().includes(p))
        ).slice(0, 8);

        const allGames: any[] = [];

        // --- PPV.to Integration ---
        try {
            const ppvResponse = await fetch('https://api.ppv.to/api/streams', {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                next: { revalidate: 300 }
            });
            if (ppvResponse.ok) {
                const ppvData = await ppvResponse.json();
                const currentTimestamp = ppvData.timestamp || Math.floor(Date.now() / 1000);

                if (ppvData.streams && Array.isArray(ppvData.streams)) {
                    ppvData.streams.forEach((category: any) => {
                        if (category.streams && Array.isArray(category.streams)) {
                            category.streams.forEach((stream: any) => {
                                const startsAt = parseInt(stream.starts_at);
                                const endsAt = parseInt(stream.ends_at);
                                const isAlwaysLive = !!stream.always_live;

                                // Status determination
                                let status = 'upcoming';
                                if (isAlwaysLive || (currentTimestamp >= startsAt && currentTimestamp <= endsAt)) {
                                    status = 'live';
                                } else if (currentTimestamp > endsAt) {
                                    status = 'ended';
                                }

                                if (status !== 'ended') {
                                    allGames.push({
                                        title: stream.name,
                                        link: stream.iframe || `https://ppv.to/live/${stream.uri_name}`,
                                        league: category.category.toUpperCase(),
                                        id: `ppv-${stream.uri_name}`,
                                        isDirect: !!stream.iframe,
                                        poster: stream.poster,
                                        status: status,
                                        startsAt: startsAt,
                                        viewers: stream.viewers
                                    });
                                }
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Failed to fetch PPV.to streams:', e);
        }

        // --- MethStreams Integration ---
        // Scrape each league page in parallel
        await Promise.all(leaguesToScrape.map(async (leaguePath) => {
            try {
                const leagueRes = await fetch(`https://methstreams.ms${leaguePath}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
                    next: { revalidate: 300 }
                });
                if (!leagueRes.ok) return;
                const leagueHtml = await leagueRes.text();

                // Robust regex for the card structure found: <a class="card" href="...">...<div class="card-title">...</div>
                const gameRegex = /<a class="card" href="(\/stream\/[^"]+)">[\s\S]*?<div class="card-title">([\s\S]*?)<\/div>/g;
                let match;
                while ((match = gameRegex.exec(leagueHtml)) !== null) {
                    const title = match[2].trim().replace(/<[^>]*>?/gm, '');
                    const link = `https://methstreams.ms${match[1]}`;
                    const leagueName = leaguePath.split('/').pop()?.replace('streams', '').toUpperCase() || 'LIVE';

                    if (!allGames.find(g => g.link === link)) {
                        allGames.push({
                            title,
                            link,
                            league: leagueName,
                            id: match[1].split('/').pop(),
                            status: 'live' // MethStreams cards on league pages are generally live
                        });
                    }
                }
            } catch (e) {
                console.warn(`Failed to scrape league ${leaguePath}`);
            }
        }));

        return NextResponse.json({ games: allGames });
    } catch (error: any) {
        console.error('MethStreams scraper error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
