'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Music,
  List,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { cn } from '@/utils/cn';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isMuted,
    repeatMode,
    isShuffled,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  const [showQueue, setShowQueue] = useState(false);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    seekTo(duration * percent);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 backdrop-blur-xl">
        {/* Progress Bar */}
        <div
          className="h-1 bg-neutral-800 cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-primary relative transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              {/* Cover Art */}
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800">
                {currentTrack.coverArt ? (
                  <Image
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                    <Music className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>

              {/* Track Details */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-secondary-200 truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-neutral-500 truncate">
                  {currentTrack.composer}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                {/* Shuffle */}
                <button
                  onClick={toggleShuffle}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    isShuffled
                      ? 'text-primary-500 hover:text-primary-400'
                      : 'text-neutral-500 hover:text-secondary-200'
                  )}
                  aria-label="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                  onClick={previousTrack}
                  className="player-control"
                  aria-label="Previous"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={isPlaying ? pauseTrack : resumeTrack}
                  className="player-control-primary"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={nextTrack}
                  className="player-control"
                  aria-label="Next"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Repeat */}
                <button
                  onClick={toggleRepeat}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    repeatMode !== 'off'
                      ? 'text-primary-500 hover:text-primary-400'
                      : 'text-neutral-500 hover:text-secondary-200'
                  )}
                  aria-label="Repeat"
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Time Display */}
              <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume & Queue */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {/* Queue Button */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  showQueue
                    ? 'text-primary-500 hover:text-primary-400'
                    : 'text-neutral-500 hover:text-secondary-200'
                )}
                aria-label="Queue"
              >
                <List className="w-5 h-5" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-neutral-500 hover:text-secondary-200 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind player */}
      <div className="h-20" />
    </>
  );
}