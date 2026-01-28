'use client';

import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Game from './components/Game';

export default function Home() {
  const [showGame, setShowGame] = useState(false);

  if (!showGame) {
    return <LandingPage onPlay={() => setShowGame(true)} />;
  }

  return <Game />;
}
