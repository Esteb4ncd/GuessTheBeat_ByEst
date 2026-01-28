'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Game.module.css';

export default function Game() {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const TOTAL_QUESTIONS = 10;

  const categories = [
    { value: 'all', label: '🎵 All Music' },
    { value: '2010s', label: '📅 2010s Hits' },
    { value: 'pop', label: '🎤 Pop' },
    { value: 'r&b', label: '🎹 R&B' },
    { value: 'rock', label: '🎸 Rock' },
    { value: 'hip-hop', label: '🎧 Hip-Hop' },
    { value: 'spanish', label: '🇪🇸 Spanish/Latin' },
  ];

  useEffect(() => {
    if (gameStarted && tracks.length > 0 && currentTrackIndex < TOTAL_QUESTIONS) {
      generateOptions();
    }
  }, [currentTrackIndex, tracks, gameStarted]);

  const startGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/deezer/tracks?limit=100&category=${selectedCategory}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracks from Deezer');
      }
      
      if (!data.tracks || data.tracks.length < TOTAL_QUESTIONS) {
        throw new Error(data.error || `Not enough tracks with previews found (found ${data.tracks?.length || 0}, need ${TOTAL_QUESTIONS})`);
      }
      
      setTracks(data.tracks);
      setGameStarted(true);
      setCurrentTrackIndex(0);
      setScore(0);
      setGameOver(false);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateOptions = () => {
    if (tracks.length === 0) return;

    const currentTrack = tracks[currentTrackIndex];
    const wrongTracks = tracks
      .filter((_, index) => index !== currentTrackIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [
      { ...currentTrack, isCorrect: true },
      ...wrongTracks.map((track) => ({ ...track, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const playPreview = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);

      // Stop after 5 seconds
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }, 5000);
    }
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer !== null) return; // Prevent changing answer

    setSelectedAnswer(option);
    setShowResult(true);

    if (option.isCorrect) {
      setScore(score + 1);
    }

    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentTrackIndex < TOTAL_QUESTIONS - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentTrackIndex(0);
    setScore(0);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowResult(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const currentTrack = tracks[currentTrackIndex];

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.startScreen}>
          <h1 className={styles.title}>🎵 Guess The Beat by EST 🎵</h1>
          <p className={styles.description}>
            Listen to the first 5 seconds of a song and guess which one it is!
          </p>
          
          <div className={styles.categorySelection}>
            <h3 className={styles.categoryTitle}>Choose a Category:</h3>
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <button
                  key={category.value}
                  className={`${styles.categoryButton} ${
                    selectedCategory === category.value ? styles.categorySelected : ''
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>Error: {error}</div>}
          <button
            className={styles.startButton}
            onClick={startGame}
            disabled={loading}
          >
            {loading ? 'Loading tracks...' : 'Start Game'}
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className={styles.container}>
        <div className={styles.gameOverScreen}>
          <h1 className={styles.title}>Game Over!</h1>
          <p className={styles.finalScore}>
            Your Score: {score} / {TOTAL_QUESTIONS}
          </p>
          <p className={styles.percentage}>
            {Math.round((score / TOTAL_QUESTIONS) * 100)}% Correct
          </p>
          <button className={styles.startButton} onClick={resetGame}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <div className={styles.score}>Score: {score} / {TOTAL_QUESTIONS}</div>
        <div className={styles.questionNumber}>
          Question {currentTrackIndex + 1} / {TOTAL_QUESTIONS}
        </div>
      </div>

      <div className={styles.gameContent}>
        {currentTrack && (
          <>
            <audio
              ref={audioRef}
              src={currentTrack.preview_url}
              onEnded={() => setIsPlaying(false)}
            />
            
            <div className={styles.audioControls}>
              <button
                className={styles.playButton}
                onClick={playPreview}
                disabled={isPlaying}
              >
                {isPlaying ? '⏸️ Playing...' : '▶️ Play Preview (5 seconds)'}
              </button>
            </div>

            <div className={styles.options}>
              {options.map((option, index) => {
                const isSelected = selectedAnswer?.id === option.id;
                const isCorrect = option.isCorrect;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={option.id}
                    className={`${styles.option} ${
                      showCorrect ? styles.correct : ''
                    } ${showWrong ? styles.wrong : ''} ${
                      isSelected ? styles.selected : ''
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                  >
                    <div className={styles.optionContent}>
                      <div className={styles.optionText}>
                        <strong>{option.name}</strong>
                        <span className={styles.artist}>{option.artists[0]?.name}</span>
                      </div>
                      {showCorrect && <span className={styles.checkmark}>✓</span>}
                      {showWrong && <span className={styles.cross}>✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
