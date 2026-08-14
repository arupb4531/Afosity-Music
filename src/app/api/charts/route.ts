import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Missing YOUTUBE_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    let url = '';
    
    if (q) {
      // If user searched for something, use the Search endpoint
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=50&q=${encodeURIComponent(q)}&key=${API_KEY}`;
    } else {
      // Default to official hit songs
      url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=50&key=${API_KEY}`;
    }
    
    let tracks: any[] = [];
    let nextPageToken = '';
    
    // Fetch up to 3 pages to get 150 tracks for maximum background variety
    for (let i = 0; i < 3; i++) {
      const pageUrl = nextPageToken ? `${url}&pageToken=${nextPageToken}` : url;
      const response = await fetch(pageUrl);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const pageTracks = data.items.map((item: any) => ({
        id: typeof item.id === 'string' ? item.id : (item.id.videoId || item.id.playlistId || item.id.channelId || `unknown-${Math.random()}`),
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        // Use highest resolution thumbnail available
        art: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      }));

      tracks = [...tracks, ...pageTracks];
      nextPageToken = data.nextPageToken;
      
      if (!nextPageToken) break; // End early if no more results
    }

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch music' }, { status: 500 });
  }
}
