import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({
    example: 'Symphony No. 5 in C minor, Op. 67 - I. Allegro con brio',
    description: 'Track title',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Ludwig van Beethoven',
    description: 'Composer name',
  })
  @IsString()
  @MaxLength(100)
  composer: string;

  @ApiProperty({
    example: 'Berlin Philharmonic',
    description: 'Performer or ensemble',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  performer?: string;

  @ApiProperty({
    example: 'Herbert von Karajan',
    description: 'Conductor name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  conductor?: string;

  @ApiProperty({
    example: 'Berlin Philharmonic Orchestra',
    description: 'Orchestra name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  orchestra?: string;

  @ApiProperty({
    example: 'Op. 67',
    description: 'Opus number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  opus?: string;

  @ApiProperty({
    example: 'K. 467',
    description: 'Catalog number (e.g., Köchel, BWV, etc.)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  catalogNumber?: string;

  @ApiProperty({
    example: 'I. Allegro con brio',
    description: 'Movement name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  movement?: string;

  @ApiProperty({
    example: 'C minor',
    description: 'Musical key',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  key?: string;

  @ApiProperty({
    example: 460,
    description: 'Duration in seconds',
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: 1808,
    description: 'Year of composition',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1000)
  year?: number;

  @ApiProperty({
    example: 'The iconic opening movement of Beethoven\'s Fifth Symphony',
    description: 'Track description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.supabase.co/storage/v1/object/public/audio/file.mp3',
    description: 'Audio file URL in Supabase Storage',
  })
  @IsUrl()
  audioUrl: string;

  @ApiProperty({
    example: 'https://example.supabase.co/storage/v1/object/public/covers/cover.jpg',
    description: 'Cover art URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverArt?: string;

  @ApiProperty({
    example: '{"data": [0.1, 0.3, 0.5...]}',
    description: 'Waveform data in JSON format',
    required: false,
  })
  @IsOptional()
  @IsString()
  waveformData?: string;

  @ApiProperty({
    example: 12500000,
    description: 'File size in bytes',
  })
  @IsInt()
  @Min(1)
  fileSize: number;

  @ApiProperty({
    example: 'mp3',
    description: 'Audio format (mp3, flac, wav, aac, ogg)',
  })
  @IsString()
  audioFormat: string;

  @ApiProperty({
    example: 320,
    description: 'Audio bitrate in kbps',
    required: false,
  })
  @IsOptional()
  @IsInt()
  bitrate?: number;

  @ApiProperty({
    example: 44100,
    description: 'Sample rate in Hz',
    required: false,
  })
  @IsOptional()
  @IsInt()
  sampleRate?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the track is publicly accessible',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Genre ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  genreId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Period ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  periodId?: string;
}