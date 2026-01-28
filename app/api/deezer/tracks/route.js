import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '100';
  const category = searchParams.get('category') || 'all';

  try {
    // Deezer API doesn't require authentication for basic searches
    // Define category-based search strategies
    const categoryQueries = {
      'all': [
        'artist:"Taylor Swift"',
        'artist:"The Weeknd"',
        'artist:"Ed Sheeran"',
        'artist:"Bruno Mars"',
        'artist:"Ariana Grande"',
        'artist:"Dua Lipa"',
        'artist:"Billie Eilish"',
        'artist:"Post Malone"',
        'artist:"Drake"',
        'artist:"Justin Bieber"',
        'artist:"The Beatles"',
        'artist:"Queen"',
        'artist:"Michael Jackson"',
        'artist:"Eminem"',
        'artist:"Rihanna"',
      ],
      '2010s': [
        'artist:"Taylor Swift"',
        'artist:"Katy Perry"',
        'artist:"Bruno Mars"',
        'artist:"Rihanna"',
        'artist:"Adele"',
        'artist:"One Direction"',
        'artist:"Maroon 5"',
        'artist:"Justin Bieber"',
        'artist:"Lady Gaga"',
        'artist:"Eminem"',
        'artist:"Drake"',
        'artist:"The Weeknd"',
        'artist:"Calvin Harris"',
        'artist:"Avicii"',
        'artist:"Daft Punk"',
      ],
      'pop': [
        'artist:"Taylor Swift"',
        'artist:"Ariana Grande"',
        'artist:"Dua Lipa"',
        'artist:"Ed Sheeran"',
        'artist:"Bruno Mars"',
        'artist:"Justin Bieber"',
        'artist:"Katy Perry"',
        'artist:"Lady Gaga"',
        'artist:"Selena Gomez"',
        'artist:"Shawn Mendes"',
        'artist:"Camila Cabello"',
        'artist:"Harry Styles"',
        'artist:"Billie Eilish"',
        'artist:"Olivia Rodrigo"',
      ],
      'r&b': [
        'artist:"The Weeknd"',
        'artist:"Rihanna"',
        'artist:"Beyoncé"',
        'artist:"Usher"',
        'artist:"Chris Brown"',
        'artist:"Alicia Keys"',
        'artist:"John Legend"',
        'artist:"Bruno Mars"',
        'artist:"Frank Ocean"',
        'artist:"SZA"',
        'artist:"Daniel Caesar"',
        'artist:"H.E.R."',
        'artist:"Summer Walker"',
      ],
      'rock': [
        'artist:"Queen"',
        'artist:"The Beatles"',
        'artist:"AC/DC"',
        'artist:"Led Zeppelin"',
        'artist:"The Rolling Stones"',
        'artist:"Nirvana"',
        'artist:"Guns N\' Roses"',
        'artist:"Metallica"',
        'artist:"Linkin Park"',
        'artist:"Foo Fighters"',
        'artist:"Red Hot Chili Peppers"',
        'artist:"Radiohead"',
        'artist:"The Killers"',
        'artist:"Arctic Monkeys"',
      ],
      'hip-hop': [
        'artist:"Eminem"',
        'artist:"Drake"',
        'artist:"Kendrick Lamar"',
        'artist:"Post Malone"',
        'artist:"Travis Scott"',
        'artist:"Kanye West"',
        'artist:"J. Cole"',
        'artist:"Lil Wayne"',
        'artist:"50 Cent"',
        'artist:"Jay-Z"',
        'artist:"The Notorious B.I.G."',
        'artist:"Tupac"',
        'artist:"Snoop Dogg"',
        'artist:"Dr. Dre"',
      ],
      'spanish': [
        'artist:"Bad Bunny"',
        'artist:"J Balvin"',
        'artist:"Shakira"',
        'artist:"Enrique Iglesias"',
        'artist:"Maluma"',
        'artist:"Rosalía"',
        'artist:"Ozuna"',
        'artist:"Daddy Yankee"',
        'artist:"Karol G"',
        'artist:"Anuel AA"',
        'artist:"Rauw Alejandro"',
        'artist:"Myke Towers"',
        'artist:"Feid"',
        'artist:"Sebastian Yatra"',
        'artist:"Luis Fonsi"',
      ],
    };

    const searchQueries = categoryQueries[category] || categoryQueries['all'];

    let allTracks = [];

    // Fetch tracks from multiple searches
    for (const query of searchQueries) {
      try {
        const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=25`;
        const tracksResponse = await fetch(searchUrl);

        if (!tracksResponse.ok) {
          console.error(`Deezer search failed for ${query}:`, tracksResponse.status);
          continue; // Skip this query and try the next one
        }

        const tracksData = await tracksResponse.json();
        
        if (tracksData.data && Array.isArray(tracksData.data)) {
          allTracks = allTracks.concat(tracksData.data);
        }
      } catch (searchError) {
        console.error(`Error searching Deezer for ${query}:`, searchError);
        continue; // Continue with next query
      }
    }

    // Filter tracks that have preview URLs and remove duplicates
    const tracksWithPreview = allTracks
      .filter((track) => track.preview && track.preview.length > 0)
      .filter((track, index, self) => 
        index === self.findIndex((t) => t.id === track.id)
      );

    // Transform Deezer format to match expected format
    const formattedTracks = tracksWithPreview.map((track) => ({
      id: track.id.toString(),
      name: track.title,
      artists: [{ name: track.artist.name }],
      preview_url: track.preview,
      album: {
        images: track.album ? [{ url: track.album.cover_big || track.album.cover_medium }] : [],
      },
    }));

    // Shuffle and limit results
    const shuffled = formattedTracks
      .sort(() => Math.random() - 0.5)
      .slice(0, parseInt(limit));

    if (shuffled.length < 10) {
      throw new Error(`Only found ${shuffled.length} tracks with preview URLs. Need at least 10. Please try again.`);
    }

    return NextResponse.json({ tracks: shuffled });
  } catch (error) {
    console.error('Error in Deezer tracks API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tracks from Deezer. Please try again.' },
      { status: 500 }
    );
  }
}
