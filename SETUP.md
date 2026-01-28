# Setup Guide - Deezer API (No Credentials Needed!)

## ✅ No Setup Required!

The Deezer API doesn't require authentication for basic track searches, so you can start playing immediately!

## Quick Start

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   - Go to http://localhost:3000
   - Click "Start Game"
   - Start playing! 🎵

## That's It!

No API keys, no credentials, no configuration files needed. The game uses the public Deezer API which is free and open.

## How It Works

The game fetches tracks from the [Deezer API](https://developers.deezer.com/api) using their public search endpoint:
- Endpoint: `https://api.deezer.com/search`
- No authentication required
- Returns tracks with 30-second preview URLs

## Troubleshooting

### "Failed to fetch tracks"
- Check your internet connection
- Make sure you're running `npm run dev` (not just opening the HTML file)
- Try refreshing the page

### "Not enough tracks with previews found"
- This is rare, but if it happens, just click "Start Game" again
- The API will fetch more tracks on each request

### Audio not playing
- Check your browser's audio permissions
- Make sure your volume is up
- Try a different browser if issues persist

### CORS errors
- Make sure you're accessing the app through `http://localhost:3000`
- Don't open the HTML files directly in the browser
- The Next.js dev server handles CORS automatically

## API Information

- **API**: Deezer API
- **Documentation**: https://developers.deezer.com/api
- **Rate Limits**: Very generous for basic searches
- **Authentication**: Not required for search endpoints

Enjoy the game! 🎵
