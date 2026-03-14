import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TrackSortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  COMPOSER = 'composer',
  PLAY_COUNT = 'playCount',
  DURATION = 'duration',
  YEAR = 'year',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchTracksDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ example: 'beethoven', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'Ludwig van Beethoven', required: false })
  @IsOptional()
  @IsString()
  composer?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  genreId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsString()
  periodId?: string;

  @ApiProperty({ enum: TrackSortBy, example: TrackSortBy.CREATED_AT, required: false })
  @IsOptional()
  @IsEnum(TrackSortBy)
  sortBy?: TrackSortBy;

  @ApiProperty({ enum: SortOrder, example: SortOrder.DESC, required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}