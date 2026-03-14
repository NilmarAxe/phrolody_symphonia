import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { SearchTracksDto } from './dto/search-tracks.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new track' })
  @ApiResponse({ status: 201, description: 'Track created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createTrackDto: CreateTrackDto,
    @GetUser('id') userId: string,
  ) {
    return this.tracksService.create(createTrackDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracks (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'composer', required: false, type: String })
  @ApiQuery({ name: 'genreId', required: false, type: String })
  @ApiQuery({ name: 'periodId', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of tracks' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query() filters: SearchTracksDto,
  ) {
    return this.tracksService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      filters,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tracks' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of popular tracks' })
  async getPopular(@Query('limit') limit: string = '10') {
    return this.tracksService.getPopular(parseInt(limit, 10));
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent tracks' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of recent tracks' })
  async getRecent(@Query('limit') limit: string = '10') {
    return this.tracksService.getRecent(parseInt(limit, 10));
  }

  @Get('recommendations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get recommended tracks for current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of recommended tracks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecommendations(
    @GetUser('id') userId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.tracksService.getRecommendations(userId, parseInt(limit, 10));
  }

  @Get('composer/:composer')
  @ApiOperation({ summary: 'Get tracks by composer' })
  @ApiParam({ name: 'composer', description: 'Composer name' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'List of tracks by composer' })
  async getByComposer(
    @Param('composer') composer: string,
    @Query('limit') limit: string = '20',
  ) {
    return this.tracksService.getByComposer(composer, parseInt(limit, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get track by ID' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track data' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async findOne(@Param('id') id: string) {
    return this.tracksService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTrackDto: UpdateTrackDto,
    @GetUser('id') userId: string,
  ) {
    return this.tracksService.update(id, updateTrackDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 204, description: 'Track deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    await this.tracksService.remove(id, userId);
  }

  @Post(':id/play')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record track play' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 204, description: 'Play recorded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async recordPlay(
    @Param('id') trackId: string,
    @GetUser('id') userId: string,
    @Body('duration') duration: number,
    @Body('completed') completed: boolean = false,
  ) {
    await this.tracksService.recordPlay(trackId, userId, duration, completed);
  }
}