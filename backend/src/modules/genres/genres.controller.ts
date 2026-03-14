import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GenresService } from './genres.service';

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @ApiOperation({ summary: 'Get all genres' })
  @ApiResponse({ status: 200, description: 'List of genres' })
  async findAll() {
    return this.genresService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get all genres with track counts' })
  @ApiResponse({ status: 200, description: 'List of genres with statistics' })
  async getAllWithStats() {
    return this.genresService.getAllWithStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get genre by ID' })
  @ApiParam({ name: 'id', description: 'Genre ID' })
  @ApiResponse({ status: 200, description: 'Genre data' })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  async findOne(@Param('id') id: string) {
    return this.genresService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get genre with statistics' })
  @ApiParam({ name: 'id', description: 'Genre ID' })
  @ApiResponse({ status: 200, description: 'Genre data with track count' })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  async getStats(@Param('id') id: string) {
    return this.genresService.getGenreWithStats(id);
  }
}