import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const lang = searchParams.get('lang');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  try {
    const opts = lang ? { lang } : undefined;
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, opts);
    // YoutubeTranscript returns an array of { text, duration, offset }
    return NextResponse.json(transcript);
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transcript' }, { status: 500 });
  }
}
