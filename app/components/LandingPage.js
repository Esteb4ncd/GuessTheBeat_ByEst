'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './LandingPage.module.css';

export default function LandingPage({ onPlay }) {
  const [backgroundTracks, setBackgroundTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const audioRef = useRef(null);
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const gradientRef = useRef(null);
  const musicIntervalsRef = useRef({ fadeTimeout: null, volumeChangeInterval: null, fadeOutInterval: null });

  // Fetch background music tracks
  useEffect(() => {
    const fetchBackgroundTracks = async () => {
      try {
        const response = await fetch('/api/deezer/background');
        const data = await response.json();
        
        if (response.ok && data.tracks && data.tracks.length > 0) {
          setBackgroundTracks(data.tracks);
        } else {
          console.warn('No background tracks found', data.error);
        }
      } catch (error) {
        console.error('Error fetching background tracks:', error);
      }
    };

    fetchBackgroundTracks();
  }, []);

  // GSAP animations on mount
  useEffect(() => {
    const title = titleRef.current;
    const button = buttonRef.current;
    
    if (!title || !button) return;

    let titleAnimation = null;
    let buttonAnimation = null;
    let pulseAnimation = null;

    // Set initial states
    gsap.set(title, { opacity: 0, y: -50 });
    gsap.set(button, { opacity: 0, y: 50, scale: 1 });

    // Animate title
    titleAnimation = gsap.to(title, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    });

    // Animate button in
    buttonAnimation = gsap.to(button, {
      y: 0,
      opacity: 1,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out',
      onComplete: () => {
        // Start pulse animation after button is visible
        if (buttonRef.current) {
          pulseAnimation = gsap.to(buttonRef.current, {
            scale: 1.05,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          });
        }
      },
    });

    return () => {
      if (titleAnimation) titleAnimation.kill();
      if (buttonAnimation) buttonAnimation.kill();
      if (pulseAnimation) pulseAnimation.kill();
    };
  }, []);

  // Animate gradient colors
  useEffect(() => {
    if (!gradientRef.current) return;

    const gradient = gradientRef.current;
    const colors = [
      { start: '#667eea', end: '#764ba2' },
      { start: '#f093fb', end: '#f5576c' },
      { start: '#4facfe', end: '#00f2fe' },
      { start: '#43e97b', end: '#38f9d7' },
      { start: '#fa709a', end: '#fee140' },
      { start: '#30cfd0', end: '#330867' },
      { start: '#a8edea', end: '#fed6e3' },
      { start: '#ff9a9e', end: '#fecfef' },
    ];

    let colorIndex = 0;
    let animation = null;

    const animateGradient = () => {
      if (!gradient) return;
      
      const currentColor = colors[colorIndex];
      
      animation = gsap.to(gradient, {
        background: `linear-gradient(135deg, ${currentColor.start} 0%, ${currentColor.end} 100%)`,
        duration: 3,
        ease: 'power1.inOut',
        onComplete: () => {
          if (gradient) {
            colorIndex = (colorIndex + 1) % colors.length;
            animateGradient();
          }
        },
      });
    };

    animateGradient();

    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, []);

  // Handle background music with smooth volume transitions
  useEffect(() => {
    if (backgroundTracks.length === 0 || !audioRef.current || !musicEnabled) return;

    const audio = audioRef.current;
    const intervals = musicIntervalsRef.current;
    let isMounted = true;

    const playNextTrack = (trackIndex) => {
      if (!isMounted || backgroundTracks.length === 0 || !musicEnabled) return;

      const track = backgroundTracks[trackIndex];
      if (!track || !track.preview_url) {
        // Skip to next track if no preview
        const nextIndex = (trackIndex + 1) % backgroundTracks.length;
        setTimeout(() => {
          if (isMounted) setCurrentTrackIndex(nextIndex);
        }, 100);
        return;
      }

      // Clean up any existing intervals
      if (intervals.volumeChangeInterval) {
        clearInterval(intervals.volumeChangeInterval);
        intervals.volumeChangeInterval = null;
      }
      if (intervals.fadeOutInterval) {
        clearInterval(intervals.fadeOutInterval);
        intervals.fadeOutInterval = null;
      }
      if (intervals.fadeTimeout) {
        clearTimeout(intervals.fadeTimeout);
        intervals.fadeTimeout = null;
      }

      audio.src = track.preview_url;
      audio.volume = 0;
      
      audio.play().catch((error) => {
        // Only log if it's not an autoplay error (browser security feature)
        if (error.name !== 'NotAllowedError') {
          console.error('Error playing background music:', error);
        }
        if (isMounted) {
          // Try next track on error
          const nextIndex = (trackIndex + 1) % backgroundTracks.length;
          setTimeout(() => {
            if (isMounted) setCurrentTrackIndex(nextIndex);
          }, 1000);
        }
      });

      // Fade in
      const fadeInDuration = 2000; // 2 seconds
      const fadeInSteps = 20;
      const fadeInStep = 0.3 / fadeInSteps; // Max volume 0.3
      let currentVolume = 0;

      intervals.volumeChangeInterval = setInterval(() => {
        if (!isMounted || !audio) {
          clearInterval(intervals.volumeChangeInterval);
          intervals.volumeChangeInterval = null;
          return;
        }
        if (currentVolume < 0.3) {
          currentVolume = Math.min(currentVolume + fadeInStep, 0.3);
          audio.volume = currentVolume;
        } else {
          clearInterval(intervals.volumeChangeInterval);
          intervals.volumeChangeInterval = null;
        }
      }, fadeInDuration / fadeInSteps);

      // Fade out before track ends
      const trackDuration = 30000; // 30 seconds preview
      const fadeOutStart = trackDuration - 2000; // Start fading 2 seconds before end

      intervals.fadeTimeout = setTimeout(() => {
        if (!isMounted) return;
        
        const fadeOutDuration = 2000;
        const fadeOutSteps = 20;
        const fadeOutStep = 0.3 / fadeOutSteps;
        let fadeVolume = 0.3;

        intervals.fadeOutInterval = setInterval(() => {
          if (!isMounted || !audio) {
            clearInterval(intervals.fadeOutInterval);
            intervals.fadeOutInterval = null;
            return;
          }
          if (fadeVolume > 0) {
            fadeVolume = Math.max(fadeVolume - fadeOutStep, 0);
            audio.volume = fadeVolume;
          } else {
            clearInterval(intervals.fadeOutInterval);
            intervals.fadeOutInterval = null;
            // Move to next track
            if (isMounted) {
              const nextIndex = (trackIndex + 1) % backgroundTracks.length;
              setCurrentTrackIndex(nextIndex);
            }
          }
        }, fadeOutDuration / fadeOutSteps);
      }, fadeOutStart);
    };

    const handleEnded = () => {
      if (isMounted && backgroundTracks.length > 0) {
        const nextIndex = (currentTrackIndex + 1) % backgroundTracks.length;
        setCurrentTrackIndex(nextIndex);
      }
    };

    const handleError = () => {
      if (isMounted && backgroundTracks.length > 0) {
        const nextIndex = (currentTrackIndex + 1) % backgroundTracks.length;
        setCurrentTrackIndex(nextIndex);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    // Only start playing if music is enabled (after user interaction)
    if (musicEnabled) {
      playNextTrack(currentTrackIndex);
    }

    return () => {
      isMounted = false;
      if (intervals.fadeTimeout) {
        clearTimeout(intervals.fadeTimeout);
        intervals.fadeTimeout = null;
      }
      if (intervals.volumeChangeInterval) {
        clearInterval(intervals.volumeChangeInterval);
        intervals.volumeChangeInterval = null;
      }
      if (intervals.fadeOutInterval) {
        clearInterval(intervals.fadeOutInterval);
        intervals.fadeOutInterval = null;
      }
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [backgroundTracks, currentTrackIndex, musicEnabled]);

  const handlePlayClick = () => {
    const audio = audioRef.current;
    const intervals = musicIntervalsRef.current;
    const title = titleRef.current;
    const button = buttonRef.current;

    // Clean up any existing intervals
    if (intervals.fadeTimeout) {
      clearTimeout(intervals.fadeTimeout);
      intervals.fadeTimeout = null;
    }
    if (intervals.volumeChangeInterval) {
      clearInterval(intervals.volumeChangeInterval);
      intervals.volumeChangeInterval = null;
    }
    if (intervals.fadeOutInterval) {
      clearInterval(intervals.fadeOutInterval);
      intervals.fadeOutInterval = null;
    }

    // Fade out background music gradually
    const fadeOutMusic = (callback) => {
      if (!audio || audio.paused || audio.ended) {
        // If no audio or already paused, proceed with transition
        callback();
        return;
      }

      const fadeOutDuration = 1500; // 1.5 seconds fade out
      const fadeOutSteps = 30;
      const startVolume = audio.volume || 0.3;
      const fadeOutStep = startVolume / fadeOutSteps;
      let currentVolume = startVolume;

      intervals.fadeOutInterval = setInterval(() => {
        if (currentVolume > 0 && audio && !audio.paused) {
          currentVolume = Math.max(currentVolume - fadeOutStep, 0);
          audio.volume = currentVolume;
        } else {
          clearInterval(intervals.fadeOutInterval);
          intervals.fadeOutInterval = null;
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
          callback();
        }
      }, fadeOutDuration / fadeOutSteps);
    };

    const transitionToGame = () => {
      // Animate out UI elements
      if (title && button) {
        gsap.to([title, button], {
          opacity: 0,
          y: -50,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            onPlay();
          },
        });
      } else {
        onPlay();
      }
    };

    // Start fade out
    fadeOutMusic(transitionToGame);
  };

  // Enable music on first user interaction
  const handleUserInteraction = () => {
    if (!musicEnabled) {
      setMusicEnabled(true);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={styles.landingContainer}
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      onMouseMove={handleUserInteraction}
    >
      <div ref={gradientRef} className={styles.gradientBackground} />
      <audio ref={audioRef} preload="auto" />
      
      <div className={styles.content}>
        <h1 ref={titleRef} className={styles.title}>
          Guess The Beat by EST
        </h1>
        <button
          ref={buttonRef}
          className={styles.playButton}
          onClick={(e) => {
            handleUserInteraction();
            handlePlayClick();
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
