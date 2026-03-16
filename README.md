# Phrolody Symphonia

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-C41E3A?style=for-the-badge)](https://phrolodysymphonia-web.vercel.app)
[![Backend](https://img.shields.io/badge/API-Documentation-46E3B7?style=for-the-badge)](https://phrolody-symphonia.onrender.com/api/docs)
[![GitHub](https://img.shields.io/badge/Author-NilmarAxe-181717?style=for-the-badge&logo=github)](https://github.com/NilmarAxe)

A full-stack classical music streaming platform built with modern web technologies. Phrolody Symphonia delivers a sophisticated listening experience inspired by contemporary streaming services, designed specifically for classical music enthusiasts.

</div>

---

## Overview

Phrolody Symphonia is a production-ready web application that allows users to stream, organize, and discover classical music. It features a Spotify-inspired interface with a persistent sidebar, real-time activity feeds powered by WebSocket, and a complete content management system for uploading and managing tracks.

The platform is built as a monorepo containing a Next.js 14 frontend and a NestJS backend, connected to a PostgreSQL database with Redis caching and Supabase for cloud audio storage.

---

## Live Demo

| Service | URL |
|---|---|
| Web Application | https://phrolodysymphonia-web.vercel.app |
| API Documentation | https://phrolody-symphonia.onrender.com/api/docs |
| Health Check | https://phrolody-symphonia.onrender.com/api/v1/health |

---

## Features

### For Users
- Stream classical music with a full-featured audio player (play, pause, seek, volume, shuffle, repeat)
- Browse and search tracks by composer, genre, musical period, and title
- Create and manage personal playlists with cover images
- Favorite tracks and access them from a dedicated library
- View listening history and recently played tracks
- Personalized track recommendations based on listening behavior
- Google OAuth login support
- Real-time feed showing what other users are currently listening to

### For Administrators
- Upload audio files directly to Supabase cloud storage
- Create and edit track metadata (composer, performer, conductor, orchestra, opus, key, movement, year)
- Manage all tracks from an admin panel with edit and delete capabilities
- Full RESTful API with Swagger documentation

---

## Tech Stack

### Frontend

| Technology | Version | Description |
|---|---|---|
| Next.js | 14.x | React framework with App Router and SSR |
| TypeScript | 5.x | Static type checking |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Framer Motion | — | Animation library |
| Zustand | — | Lightweight state management |
| TanStack Query | — | Async data fetching and caching |
| Socket.io Client | 4.x | WebSocket client for real-time features |
| Howler.js | — | Cross-browser audio playback |
| React Hook Form | — | Form management |
| React Hot Toast | — | Notification system |

### Backend

| Technology | Version | Description |
|---|---|---|
| NestJS | 10.x | Scalable Node.js framework |
| TypeScript | 5.x | Static type checking |
| PostgreSQL | 15.x | Primary relational database |
| Prisma | 5.x | Type-safe ORM and migrations |
| Redis | 7.x | Caching and session management |
| Socket.io | 4.x | WebSocket server |
| Passport.js | — | Authentication middleware |
| JWT | — | Stateless token-based auth |
| Swagger / OpenAPI | — | API documentation |
| Multer | — | File upload middleware |
| Helmet | — | HTTP security headers |
| class-validator | — | DTO validation |

### Infrastructure & Services

| Service | Purpose |
|---|---|
| Vercel | Frontend deployment with CI/CD |
| Render | Backend hosting |
| Supabase | Cloud storage for audio and image files |
| Docker | Local development environment |

---

## Architecture

The application follows a standard client-server architecture:

- The **frontend** (Next.js) communicates with the **backend** (NestJS) via a RESTful API over HTTPS.
- **WebSocket** (Socket.io) maintains a persistent connection for real-time features such as live activity feeds and online user counts.
- **Audio files** are stored in Supabase Storage and streamed directly to the client via public URLs.
- **PostgreSQL** stores all application data including users, tracks, playlists, favorites, and play history.
- **Redis** caches frequently requested data such as track details and search results to reduce database load.
- **JWT** tokens handle authentication, stored in `localStorage` with automatic refresh logic.

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- Docker Desktop
- Git

### Clone the Repository

```bash
git clone https://github.com/NilmarAxe/phrolody_symphonia.git
cd phrolody_symphonia
```

### Configure Environment Variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://phrolody_user:phrolody_password@localhost:5432/phrolody_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_key
SUPABASE_BUCKET_NAME=audio-files
CORS_ORIGIN=http://localhost:3000
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Start the Database

```bash
docker-compose up postgres redis -d
```

### Setup the Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| Swagger Docs | http://localhost:4000/api/docs |

---

## Default Credentials

The database seed creates the following test accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@phrolodysymphonia.com | admin123 |
| User | beethoven@phrolodysymphonia.com | password123 |

---

## API Reference

The full API documentation is available via Swagger UI. All endpoints follow RESTful conventions and return JSON responses.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET | `/api/v1/auth/me` | Get current user profile |

### Tracks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/tracks` | List tracks with pagination and filters |
| GET | `/api/v1/tracks/popular` | Get most played tracks |
| GET | `/api/v1/tracks/recent` | Get recently added tracks |
| GET | `/api/v1/tracks/recommendations` | Get personalized recommendations |
| GET | `/api/v1/tracks/:id` | Get track by ID |
| POST | `/api/v1/tracks` | Create a new track (auth required) |
| PATCH | `/api/v1/tracks/:id` | Update a track (owner only) |
| DELETE | `/api/v1/tracks/:id` | Delete a track (owner only) |

### Playlists
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/playlists/me` | Get current user's playlists |
| POST | `/api/v1/playlists` | Create a playlist |
| PATCH | `/api/v1/playlists/:id` | Update a playlist |
| DELETE | `/api/v1/playlists/:id` | Delete a playlist |
| POST | `/api/v1/playlists/:id/tracks` | Add track to playlist |
| DELETE | `/api/v1/playlists/:id/tracks/:trackId` | Remove track from playlist |

### Favorites
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/favorites` | Get user's favorites |
| POST | `/api/v1/favorites/:trackId` | Add to favorites |
| DELETE | `/api/v1/favorites/:trackId` | Remove from favorites |
| GET | `/api/v1/favorites/:trackId/status` | Check if track is favorited |

### Storage
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/storage/upload/audio` | Upload audio file to Supabase |
| POST | `/api/v1/storage/upload/cover` | Upload cover image to Supabase |

---

## WebSocket Events

The WebSocket server runs on the `/ws` namespace and requires a valid JWT token for connection.

| Event | Direction | Description |
|---|---|---|
| `now_playing` | Client → Server | Notify server of currently playing track |
| `stop_playing` | Client → Server | Notify server that playback stopped |
| `online_users` | Server → Client | Broadcast list of online users with their current tracks |
| `online_count` | Server → Client | Broadcast total number of connected users |

---

## Deployment

### Frontend — Vercel

1. Connect your GitHub repository to Vercel
2. Set **Root Directory** to `frontend`
3. Configure all `NEXT_PUBLIC_*` environment variables
4. Deploy automatically on every push to `main`

### Backend — Render

1. Connect your GitHub repository to Render
2. Set **Root Directory** to `backend`
3. Set **Build Command** to `npm install && npx prisma generate && npm run build`
4. Set **Start Command** to `npx prisma migrate deploy && node dist/main`
5. Configure all environment variables including `DATABASE_URL`, `REDIS_*`, `JWT_*`, and `SUPABASE_*`
6. Set `CORS_ORIGIN` to your Vercel frontend URL

---

## Roadmap

The following features are planned for future releases:

- Google OAuth with production credentials
- WebSocket notifications for social interactions (favorites, playlist updates)
- Advanced search with full-text and multi-filter support
- Machine learning recommendations using collaborative filtering
- Public user profiles and social following
- Offline mode with service workers
- Mobile application (React Native)

---

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## Author

**Nilmar Machado**

- GitHub: [@NilmarAxe](https://github.com/NilmarAxe)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
