import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (development only)
  await prisma.playHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.playlistTrack.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.track.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.oAuthAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.period.deleteMany();

  console.log('✓ Cleaned existing data');

  // Create periods
  const periods = await Promise.all([
    prisma.period.create({
      data: {
        name: 'Medieval',
        startYear: 500,
        endYear: 1400,
        description: 'Music from the Middle Ages, characterized by Gregorian chants and early polyphony.',
      },
    }),
    prisma.period.create({
      data: {
        name: 'Renaissance',
        startYear: 1400,
        endYear: 1600,
        description: 'Period of cultural rebirth featuring rich polyphonic textures and vocal music.',
      },
    }),
    prisma.period.create({
      data: {
        name: 'Baroque',
        startYear: 1600,
        endYear: 1750,
        description: 'Era of ornate musical style, featuring composers like Bach, Vivaldi, and Handel.',
      },
    }),
    prisma.period.create({
      data: {
        name: 'Classical',
        startYear: 1750,
        endYear: 1820,
        description: 'Period of clarity and balance, with Mozart, Haydn, and early Beethoven.',
      },
    }),
    prisma.period.create({
      data: {
        name: 'Romantic',
        startYear: 1820,
        endYear: 1900,
        description: 'Expressive and emotional music from composers like Chopin, Brahms, and Tchaikovsky.',
      },
    }),
    prisma.period.create({
      data: {
        name: 'Modern',
        startYear: 1900,
        endYear: 2000,
        description: 'Experimental and diverse period including impressionism, atonality, and minimalism.',
      },
    }),
    prisma.period.create({
      data: {
        name: 'Contemporary',
        startYear: 2000,
        endYear: null,
        description: 'Current era of classical composition with diverse styles and influences.',
      },
    }),
  ]);

  console.log('✓ Created musical periods');

  // Create genres
  const genres = await Promise.all([
    prisma.genre.create({
      data: {
        name: 'Symphony',
        description: 'Large-scale orchestral work typically in four movements.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Concerto',
        description: 'Work for solo instrument(s) and orchestra.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Chamber Music',
        description: 'Music for small ensemble, typically one player per part.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Opera',
        description: 'Theatrical work combining music, singing, and drama.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Piano Solo',
        description: 'Music written for solo piano performance.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Orchestral',
        description: 'General orchestral works including suites and tone poems.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Choral',
        description: 'Music for vocal ensemble with or without instrumental accompaniment.',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Song',
        description: 'Art songs and vocal works for solo voice.',
      },
    }),
  ]);

  console.log('✓ Created genres');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@phrolodysymphonia.com',
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✓ Created admin user');

  // Create test users
  const userPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'beethoven@phrolodysymphonia.com',
        username: 'beethoven_lover',
        passwordHash: userPassword,
        firstName: 'Ludwig',
        lastName: 'Fan',
        role: UserRole.USER,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mozart@phrolodysymphonia.com',
        username: 'mozart_enthusiast',
        passwordHash: userPassword,
        firstName: 'Wolfgang',
        lastName: 'Admirer',
        role: UserRole.USER,
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'artist@phrolodysymphonia.com',
        username: 'classical_artist',
        passwordHash: userPassword,
        firstName: 'Johannes',
        lastName: 'Performer',
        role: UserRole.ARTIST,
        isVerified: true,
        isActive: true,
      },
    }),
  ]);

  console.log('✓ Created test users');

  // Create sample tracks
  const tracks = await Promise.all([
    prisma.track.create({
      data: {
        title: 'Symphony No. 5 in C minor, Op. 67 - I. Allegro con brio',
        composer: 'Ludwig van Beethoven',
        performer: 'Berlin Philharmonic',
        conductor: 'Herbert von Karajan',
        orchestra: 'Berlin Philharmonic Orchestra',
        opus: 'Op. 67',
        movement: 'I. Allegro con brio',
        key: 'C minor',
        duration: 460,
        year: 1808,
        description: 'The iconic opening movement of Beethoven\'s Fifth Symphony, famous for its distinctive four-note motif.',
        audioUrl: 'https://example.supabase.co/storage/v1/object/public/audio/beethoven-symphony-5-1.mp3',
        fileSize: 12500000,
        audioFormat: 'mp3',
        bitrate: 320,
        sampleRate: 44100,
        isPublic: true,
        uploadedById: admin.id,
        genreId: genres.find((g) => g.name === 'Symphony')?.id,
        periodId: periods.find((p) => p.name === 'Classical')?.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Piano Concerto No. 21 in C major, K. 467 - II. Andante',
        composer: 'Wolfgang Amadeus Mozart',
        performer: 'Maria João Pires',
        conductor: 'Claudio Abbado',
        orchestra: 'Chamber Orchestra of Europe',
        opus: 'K. 467',
        movement: 'II. Andante',
        key: 'F major',
        duration: 420,
        year: 1785,
        description: 'The beautiful and serene slow movement from Mozart\'s Piano Concerto No. 21.',
        audioUrl: 'https://example.supabase.co/storage/v1/object/public/audio/mozart-pc21-2.mp3',
        fileSize: 11200000,
        audioFormat: 'mp3',
        bitrate: 320,
        sampleRate: 44100,
        isPublic: true,
        uploadedById: admin.id,
        genreId: genres.find((g) => g.name === 'Concerto')?.id,
        periodId: periods.find((p) => p.name === 'Classical')?.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'The Four Seasons, Op. 8 - Spring I. Allegro',
        composer: 'Antonio Vivaldi',
        performer: 'Nigel Kennedy',
        orchestra: 'English Chamber Orchestra',
        opus: 'Op. 8',
        movement: 'Spring - I. Allegro',
        key: 'E major',
        duration: 195,
        year: 1725,
        description: 'The vibrant opening movement of Spring from Vivaldi\'s famous Four Seasons.',
        audioUrl: 'https://example.supabase.co/storage/v1/object/public/audio/vivaldi-spring-1.mp3',
        fileSize: 5200000,
        audioFormat: 'mp3',
        bitrate: 320,
        sampleRate: 44100,
        isPublic: true,
        uploadedById: admin.id,
        genreId: genres.find((g) => g.name === 'Concerto')?.id,
        periodId: periods.find((p) => p.name === 'Baroque')?.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Nocturne in E-flat major, Op. 9, No. 2',
        composer: 'Frédéric Chopin',
        performer: 'Arthur Rubinstein',
        opus: 'Op. 9, No. 2',
        key: 'E-flat major',
        duration: 240,
        year: 1832,
        description: 'One of Chopin\'s most beloved nocturnes, featuring lyrical melodies and delicate ornamentation.',
        audioUrl: 'https://example.supabase.co/storage/v1/object/public/audio/chopin-nocturne-op9-2.mp3',
        fileSize: 6400000,
        audioFormat: 'mp3',
        bitrate: 320,
        sampleRate: 44100,
        isPublic: true,
        uploadedById: users[2].id,
        genreId: genres.find((g) => g.name === 'Piano Solo')?.id,
        periodId: periods.find((p) => p.name === 'Romantic')?.id,
      },
    }),
  ]);

  console.log('✓ Created sample tracks');

  // Create playlists
  const playlist1 = await prisma.playlist.create({
    data: {
      name: 'Beethoven Essentials',
      description: 'A collection of Beethoven\'s most influential works.',
      isPublic: true,
      userId: users[0].id,
      tracks: {
        create: [
          {
            trackId: tracks[0].id,
            position: 0,
          },
        ],
      },
    },
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      name: 'Classical Piano Masterpieces',
      description: 'Beautiful piano works from the masters.',
      isPublic: true,
      userId: users[1].id,
      tracks: {
        create: [
          {
            trackId: tracks[1].id,
            position: 0,
          },
          {
            trackId: tracks[3].id,
            position: 1,
          },
        ],
      },
    },
  });

  console.log('✓ Created playlists');

  // Create favorites
  await prisma.favorite.createMany({
    data: [
      { userId: users[0].id, trackId: tracks[0].id },
      { userId: users[0].id, trackId: tracks[2].id },
      { userId: users[1].id, trackId: tracks[1].id },
      { userId: users[1].id, trackId: tracks[3].id },
    ],
  });

  console.log('✓ Created favorites');

  // Create play history
  await prisma.playHistory.createMany({
    data: [
      {
        userId: users[0].id,
        trackId: tracks[0].id,
        duration: 460,
        completed: true,
      },
      {
        userId: users[0].id,
        trackId: tracks[2].id,
        duration: 195,
        completed: true,
      },
      {
        userId: users[1].id,
        trackId: tracks[1].id,
        duration: 420,
        completed: true,
      },
      {
        userId: users[1].id,
        trackId: tracks[3].id,
        duration: 180,
        completed: false,
      },
    ],
  });

  console.log('✓ Created play history');

  console.log('\n🎵 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Periods: ${periods.length}`);
  console.log(`   - Genres: ${genres.length}`);
  console.log(`   - Users: ${users.length + 1} (including admin)`);
  console.log(`   - Tracks: ${tracks.length}`);
  console.log(`   - Playlists: 2`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@phrolodysymphonia.com');
  console.log('     Password: admin123');
  console.log('   User:');
  console.log('     Email: beethoven@phrolodysymphonia.com');
  console.log('     Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });