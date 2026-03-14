import { create } from 'zustand';
import { Howl } from 'howler';
import { tracksService } from '@/services/tracks.service';
import type { Track } from '@/types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isMuted: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isShuffled: boolean;
  howl: Howl | null;

  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isMuted: false,
  repeatMode: 'off',
  isShuffled: false,
  howl: null,

  playTrack: (track) => {
    const { howl: currentHowl } = get();

    if (currentHowl) {
      currentHowl.stop();
      currentHowl.unload();
    }

    set({ isLoading: true, currentTrack: track });

    const newHowl = new Howl({
      src: [track.audioUrl],
      html5: true,
      volume: get().volume,
      onload: () => {
        set({ isLoading: false, duration: newHowl.duration() });
      },
      onplay: () => {
        set({ isPlaying: true });
        const updateProgress = () => {
          if (get().isPlaying) {
            set({ currentTime: newHowl.seek() as number });
            requestAnimationFrame(updateProgress);
          }
        };
        requestAnimationFrame(updateProgress);
      },
      onpause: () => {
        set({ isPlaying: false });
      },
      onend: () => {
        const { repeatMode, nextTrack } = get();
        tracksService.recordPlay(track.id, track.duration, true).catch(console.error);
        if (repeatMode === 'one') {
          newHowl.seek(0);
          newHowl.play();
        } else {
          nextTrack();
        }
      },
      onloaderror: (_id: number, error: unknown) => {
        console.error('Howler load error:', error);
        set({ isLoading: false, isPlaying: false });
      },
      onplayerror: (_id: number, error: unknown) => {
        console.error('Howler play error:', error);
        set({ isLoading: false, isPlaying: false });
      },
    });

    newHowl.play();
    set({ howl: newHowl });
  },

  pauseTrack: () => {
    const { howl } = get();
    if (howl) howl.pause();
  },

  resumeTrack: () => {
    const { howl } = get();
    if (howl) howl.play();
  },

  stopTrack: () => {
    const { howl, currentTrack } = get();
    if (howl) {
      const currentTime = howl.seek() as number;
      howl.stop();
      howl.unload();
      if (currentTrack && currentTime > 0) {
        tracksService.recordPlay(currentTrack.id, Math.floor(currentTime), false).catch(console.error);
      }
    }
    set({ howl: null, isPlaying: false, currentTime: 0, currentTrack: null });
  },

  nextTrack: () => {
    const { queue, currentTrack, repeatMode, isShuffled } = get();
    if (queue.length === 0) { get().stopTrack(); return; }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = currentIndex + 1;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') { nextIndex = 0; }
      else { get().stopTrack(); return; }
    }
    get().playTrack(queue[nextIndex]);
  },

  previousTrack: () => {
    const { queue, currentTrack, currentTime } = get();
    if (currentTime > 3) { get().seekTo(0); return; }
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const previousIndex = currentIndex - 1;
    if (previousIndex < 0) { get().seekTo(0); return; }
    get().playTrack(queue[previousIndex]);
  },

  seekTo: (time) => {
    const { howl } = get();
    if (howl) { howl.seek(time); set({ currentTime: time }); }
  },

  setVolume: (volume) => {
    const { howl } = get();
    set({ volume });
    if (howl) howl.volume(volume);
  },

  toggleMute: () => {
    const { howl, isMuted } = get();
    set({ isMuted: !isMuted });
    if (howl) howl.mute(!isMuted);
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  addToQueue: (track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  removeFromQueue: (trackId) => {
    set((state) => ({ queue: state.queue.filter((t) => t.id !== trackId) }));
  },

  clearQueue: () => { set({ queue: [] }); },

  setQueue: (tracks) => { set({ queue: tracks }); },
}));