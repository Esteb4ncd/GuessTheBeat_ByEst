import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const searchQueries = [
      { query: 'DTMF bad bunny', exactMatch: 'dtmf' },
      { query: 'avicii', exactMatch: null },
      { query: 'the weeknd', exactMatch: null },
      { query: 'wait for your love ariana grande', exactMatch: 'wait for your love' },
    ];

    const allTracks = [];

    // Search for each specific track/artist
    for (const { query, exactMatch } of searchQueries) {
      try {
        const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=25`;
        const response = await fetch(searchUrl);

        if (response.ok) {
          const data = await response.json();

          if (data.data && Array.isArray(data.data)) {
            // Filter tracks with preview URLs
            const tracksWithPreview = data.data
              .filter(track => track.preview && track.preview.length > 0)
              .map(track => ({
                id: track.id.toString(),
                name: track.title,
                artists: [{ name: track.artist.name }],
                preview_url: track.preview,
              }));

            let selectedTrack = null;

            // For specific songs, try to find exact match first
            if (exactMatch) {
              selectedTrack = tracksWithPreview.find(t =>
                t.name.toLowerCase().includes(exactMatch.toLowerCase())
              );
            }

            // If no exact match found, use first track with preview
            if (!selectedTrack && tracksWithPreview.length > 0) {
              selectedTrack = tracksWithPreview[0];
            }

            if (selectedTrack) {
              allTracks.push(selectedTrack);
            }
          }
        }
      } catch (error) {
        console.error(`Error searching for ${query}:`, error);
      }
    }

    // Shuffle the tracks in random order
    const shuffledTracks = allTracks.sort(() => Math.random() - 0.5);

    return NextResponse.json({ tracks: shuffledTracks });
  } catch (error) {
    console.error('Error in background music API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch background tracks' },
      { status: 500 }
    );
  }
}
