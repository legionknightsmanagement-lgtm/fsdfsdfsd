import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    console.log(`[KICK API] Fetching data for: ${slug}`);

    // Try the old working endpoints first (these still work for channel data)
    const channelEndpoints = [
      `https://kick.com/api/v2/channels/${slug}`,
      `https://kick.com/api/v1/channels/${slug}`
    ];

    let channelData: any = null;
    let lastError: any = null;

    // Fetch channel data
    for (const url of channelEndpoints) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://kick.com/',
            },
            next: { revalidate: 0 },
            cache: 'no-store'
          });

          if (response.ok) {
            channelData = await response.json();
            console.log(`[KICK API] Channel data fetched from ${url}`);
            break;
          }
        } catch (e: any) {
          lastError = e;
          if (attempt < 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      if (channelData) break;
    }

    // If we got channel data, process it
    if (channelData && channelData.user) {
      const isLive = channelData.livestream !== null && channelData.livestream !== undefined;

      // Extract playback URL - Kick uses HLS streaming
      let playbackUrl = null;
      if (isLive && channelData.livestream) {
        // Try to get the playback URL from various possible fields
        playbackUrl = channelData.livestream.playback_url ||
          channelData.playback_url ||
          channelData.livestream.source ||
          null;

        console.log(`[KICK API] ${slug} is LIVE - Playback URL: ${playbackUrl ? 'Found' : 'Not found'}`);
      }

      // Normalize the response
      const normalizedData = {
        ...channelData,
        user: {
          ...channelData.user,
          profile_pic: channelData.user?.profile_pic ||
            channelData.user?.profilepic ||
            channelData.user?.avatar ||
            `https://ui-avatars.com/api/?name=${slug}&background=53FC18&color=000&size=300`
        },
        livestream: channelData.livestream || null,
        playback_url: playbackUrl,
        // Add additional metadata
        is_live: isLive,
        viewer_count: isLive ? (channelData.livestream?.viewer_count || 0) : 0
      };

      return NextResponse.json(normalizedData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Fallback: Return offline data
    console.warn(`[KICK API] Failed to fetch ${slug}, returning offline fallback`);

    return NextResponse.json({
      slug: slug,
      user: {
        id: 0,
        username: slug,
        profile_pic: `https://ui-avatars.com/api/?name=${slug}&background=53FC18&color=000&size=300`,
        bio: ''
      },
      livestream: null,
      playback_url: null,
      is_live: false,
      viewer_count: 0,
      followers_count: 0
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error(`[KICK API] Critical error for ${slug}:`, error);

    return NextResponse.json({
      slug: slug,
      user: {
        id: 0,
        username: slug,
        profile_pic: `https://ui-avatars.com/api/?name=${slug}&background=53FC18&color=000&size=300`,
        bio: ''
      },
      livestream: null,
      playback_url: null,
      is_live: false,
      viewer_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
