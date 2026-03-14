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
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: 201, description: 'Playlist created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @GetUser('id') userId: string,
  ) {
    return this.playlistsService.create(createPlaylistDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all playlists (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of playlists' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('isPublic') isPublic?: string,
  ) {
    const isPublicBool = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.playlistsService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      isPublicBool,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user playlists' })
  @ApiResponse({ status: 200, description: 'List of user playlists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPlaylists(@GetUser('id') userId: string) {
    return this.playlistsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get playlist by ID' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiResponse({ status: 200, description: 'Playlist data' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async findOne(@Param('id') id: string) {
    return this.playlistsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update playlist' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiResponse({ status: 200, description: 'Playlist updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @GetUser('id') userId: string,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete playlist' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiResponse({ status: 204, description: 'Playlist deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    await this.playlistsService.remove(id, userId);
  }

  @Post(':id/tracks')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add track to playlist' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiResponse({ status: 201, description: 'Track added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or track already in playlist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Playlist or track not found' })
  async addTrack(
    @Param('id') playlistId: string,
    @Body() addTrackDto: AddTrackDto,
    @GetUser('id') userId: string,
  ) {
    return this.playlistsService.addTrack(playlistId, addTrackDto, userId);
  }

  @Delete(':id/tracks/:trackId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove track from playlist' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiParam({ name: 'trackId', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Playlist or track not found' })
  async removeTrack(
    @Param('id') playlistId: string,
    @Param('trackId') trackId: string,
    @GetUser('id') userId: string,
  ) {
    return this.playlistsService.removeTrack(playlistId, trackId, userId);
  }

  @Patch(':id/reorder')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reorder tracks in playlist' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiResponse({ status: 200, description: 'Tracks reordered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async reorderTracks(
    @Param('id') playlistId: string,
    @Body('trackOrder') trackOrder: { trackId: string; position: number }[],
    @GetUser('id') userId: string,
  ) {
    return this.playlistsService.reorderTracks(playlistId, trackOrder, userId);
  }
}