// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'USER' | 'ARTIST' | 'ADMIN' | 'MODERATOR';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Track types
export interface Track {
  id: string;
  title: string;
  composer: string;
  performer?: string;
  conductor?: string;
  orchestra?: string;
  opus?: string;
  catalogNumber?: string;
  movement?: string;
  key?: string;
  duration: number;
  year?: number;
  description?: string;
  audioUrl: string;
  coverArt?: string;
  waveformData?: string;
  fileSize: number;
  audioFormat: string;
  bitrate?: number;
  sampleRate?: number;
  isPublic: boolean;
  playCount: number;
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  genre?: Genre;
  period?: Period;
}

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  tracks?: PlaylistTrack[];
}

export interface PlaylistTrack {
  id: string;
  position: number;
  addedAt: string;
  track: Track;
}

export interface CreatePlaylistData {
  name: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
}

// Genre types
export interface Genre {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  trackCount?: number;
}

// Period types
export interface Period {
  id: string;
  name: string;
  startYear?: number;
  endYear?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  trackCount?: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search types
export interface SearchFilters {
  search?: string;
  composer?: string;
  genreId?: string;
  periodId?: string;
  sortBy?: 'createdAt' | 'title' | 'composer' | 'playCount' | 'duration' | 'year';
  sortOrder?: 'asc' | 'desc';
}

// User statistics types
export interface UserStats {
  totalPlaylists: number;
  totalFavorites: number;
  totalPlayHistory: number;
  recentActivity: {
    id: string;
    playedAt: string;
    duration: number;
    completed: boolean;
    track: {
      id: string;
      title: string;
      composer: string;
      coverArt?: string;
    };
  }[];
}

// API Error types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}