import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({
    example: 'My Classical Favorites',
    description: 'Playlist name',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'A collection of my favorite classical pieces',
    description: 'Playlist description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    description: 'Playlist cover image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the playlist is publicly visible',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether other users can add tracks to the playlist',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean;
}