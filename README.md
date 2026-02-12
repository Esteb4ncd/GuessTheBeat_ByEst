https://guess-the-beat-by-est.vercel.app/

# 🎵 Guess The Beat by EST

A fun music guessing game built with Next.js and the Deezer API. Listen to 5-second previews of songs and test your music knowledge!

## Features

- 🎶 Play 5-second previews of popular songs
- 🎯 Multiple choice questions
- 📊 Track your score across 10 questions
- 🎨 Beautiful, modern UI with smooth animations
- 📱 Responsive design for all devices
- 🔓 **No API credentials needed!** - Deezer API is free and open

## Setup Instructions

### No Credentials Required! 🎉

The Deezer API doesn't require authentication for basic searches, so you can start playing immediately!

### Install Dependencies and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

## How to Play

1. Click "Start Game" to begin
2. Click "Play Preview" to hear the first 5 seconds of a song
3. Select the correct answer from the 4 multiple choice options
4. See your score after each question
5. Complete 10 questions to see your final score!

## Technical Details

- **Framework**: Next.js 16
- **API**: [Deezer API](https://developers.deezer.com/api) (No authentication required)
- **Features**:
  - Server-side API routes for fetching tracks
  - Client-side audio playback with 5-second limit
  - Randomized question generation
  - Score tracking and game state management

## Notes

- The game uses Deezer's preview URLs, which are 30-second audio clips
- We limit playback to 5 seconds for the game challenge
- Not all tracks have preview URLs available, so the app filters for tracks that do
- The game fetches tracks from popular artists to keep it interesting

## Troubleshooting

- **"Failed to fetch tracks"**: Check your internet connection and try again
- **"Not enough tracks with previews found"**: Try again - the API will fetch more tracks
- **Audio not playing**: Check your browser's audio permissions and make sure preview URLs are available
- **CORS errors**: If you see CORS errors, make sure you're running the app through Next.js dev server (not opening the HTML file directly)

Enjoy the game! 🎵
