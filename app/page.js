'use client';

import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Game from './components/Game';

export default function Home() {
  const [showGame, setShowGame] = useState(false);
  const [category, setCategory] = useState('all');
  const [landingInitialStep, setLandingInitialStep] = useState('landing');

  if (!showGame) {
    return (
      <LandingPage
        initialStep={landingInitialStep}
        onPlay={(selectedCategory) => {
          setCategory(selectedCategory || 'all');
          setLandingInitialStep('categories');
          setShowGame(true);
        }}
      />
    );
  }

  return (
    <Game
      initialCategory={category}
      autoStart
      onBack={() => {
        setShowGame(false);
        setLandingInitialStep('categories');
      }}
    />
  );
}
