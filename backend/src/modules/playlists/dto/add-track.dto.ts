import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class AddTrackDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Track ID to add to the playlist',
  })
  @IsString()
  trackId: string;

  @ApiProperty({
    example: 0,
    description: 'Position in the playlist (optional, defaults to end)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}