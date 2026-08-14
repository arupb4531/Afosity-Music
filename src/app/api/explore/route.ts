import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const customApiKey = request.headers.get('x-youtube-api-key');
    const API_KEY = customApiKey || process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Missing YOUTUBE_API_KEY in .env.local or headers' },
        { status: 500 }
      );
    }

    // Fetch Top 5 Trending Songs (videoCategoryId 10 is Music)
    const trendingUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=5&key=${API_KEY}`;
    
    // Fetch Top 5 Music Playlists
    const playlistsUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=top+music+hits+2024&maxResults=5&key=${API_KEY}`;

    const [trendingRes, playlistsRes] = await Promise.all([
      fetch(trendingUrl),
      fetch(playlistsUrl)
    ]);

    const trendingData = await trendingRes.json();
    const playlistsData = await playlistsRes.json();

    if (trendingData.error || playlistsData.error) {
      throw new Error(trendingData.error?.message || playlistsData.error?.message);
    }

    const trending = trendingData.items.map((item: any) => ({
      id: typeof item.id === 'string' ? item.id : item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      art: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));

    const playlists = playlistsData.items.map((item: any) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      art: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));

    return NextResponse.json({ trending, playlists });
  } catch (error: any) {
    console.error('Error fetching explore data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch explore data' }, { status: 500 });
  }
}
