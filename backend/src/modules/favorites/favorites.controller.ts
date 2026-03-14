import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@GetUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Post(':trackId')
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(@GetUser('id') userId: string, @Param('trackId') trackId: string) {
    return this.favoritesService.addFavorite(userId, trackId);
  }

  @Delete(':trackId')
  @HttpCode(HttpStatus.OK)
  async removeFavorite(@GetUser('id') userId: string, @Param('trackId') trackId: string) {
    return this.favoritesService.removeFavorite(userId, trackId);
  }

  @Get(':trackId/status')
  async isFavorite(@GetUser('id') userId: string, @Param('trackId') trackId: string) {
    const isFavorite = await this.favoritesService.isFavorite(userId, trackId);
    return { isFavorite, trackId };
  }
}