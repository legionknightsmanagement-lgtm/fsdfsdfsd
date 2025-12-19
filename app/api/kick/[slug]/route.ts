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
    console.log(`[KICK] Fetching: ${slug}`);

    // Kick's actual working endpoint
    const url = `https://kick.com/api/v2/channels/${slug}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`[KICK] HTTP ${response.status} for ${slug}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`[KICK] Raw data keys:`, Object.keys(data));
    console.log(`[KICK] User keys:`, data.user ? Object.keys(data.user) : 'NO USER');
    console.log(`[KICK] Livestream:`, data.livestream ? 'EXISTS' : 'NULL');

    // Validate we got data
    if (!data || !data.user) {
      throw new Error('Invalid response structure');
    }

    // Extract profile picture - Kick uses 'profile_picture' not 'profile_pic'
    const profilePicture = data.user.profile_picture ||
      data.user.profilepic ||
      data.user.profile_pic ||
      `https://ui-avatars.com/api/?name=${slug}&background=53FC18&color=000&size=300`;

    console.log(`[KICK] Profile picture:`, profilePicture);

    // Check if live
    const isLive = data.livestream !== null && data.livestream !== undefined;

    // Extract playback URL if live
    let playbackUrl = null;
    if (isLive && data.livestream) {
      playbackUrl = data.livestream.playback_url || null;
      console.log(`[KICK] ${slug} LIVE - Playback:`, playbackUrl ? 'FOUND' : 'NOT FOUND');
    }

    // Build normalized response
    const normalizedData = {
      slug: slug,
      user: {
        id: data.user.id || 0,
        username: data.user.username || slug,
        profile_pic: profilePicture, // Use consistent naming
        bio: data.user.bio || '',
        followers_count: data.followers_count || 0,
      },
      livestream: data.livestream,
      playback_url: playbackUrl,
      is_live: isLive,
      viewer_count: isLive ? (data.livestream?.viewer_count || 0) : 0,
      followers_count: data.followers_count || 0,
      subscriber_badges: data.subscriber_badges || [],
    };

    console.log(`[KICK] ✓ ${slug}: Live=${isLive}, Viewers=${normalizedData.viewer_count}, Profile=${!!profilePicture}`);

    return NextResponse.json(normalizedData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error(`[KICK] ✗ Error for ${slug}:`, error);

    // Return offline fallback
    return NextResponse.json({
      slug: slug,
      user: {
        id: 0,
        username: slug,
        profile_pic: `https://ui-avatars.com/api/?name=${slug}&background=53FC18&color=000&size=300`,
        bio: '',
        followers_count: 0,
      },
      livestream: null,
      playback_url: null,
      is_live: false,
      viewer_count: 0,
      followers_count: 0,
      subscriber_badges: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
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
