import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'audio-files');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not configured. Storage features will be disabled.');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase Storage initialized');
    }
  }

  /**
   * Upload audio file to Supabase Storage
   */
  async uploadAudio(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; path: string }> {
    this.validateAudioFile(file);

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error('Error uploading file to Supabase:', error);
        throw new InternalServerErrorException('Failed to upload file');
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      this.logger.log(`File uploaded successfully: ${fileName}`);

      return {
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Upload cover art to Supabase Storage
   */
  async uploadCoverArt(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; path: string }> {
    this.validateImageFile(file);

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `covers/${userId}/${uuidv4()}.${fileExtension}`;

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error('Error uploading cover art to Supabase:', error);
        throw new InternalServerErrorException('Failed to upload cover art');
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      this.logger.log(`Cover art uploaded successfully: ${fileName}`);

      return {
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error) {
      this.logger.error('Error uploading cover art:', error);
      throw new InternalServerErrorException('Failed to upload cover art');
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        this.logger.error('Error deleting file from Supabase:', error);
        throw new InternalServerErrorException('Failed to delete file');
      }

      this.logger.log(`File deleted successfully: ${path}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        this.logger.error('Error creating signed URL:', error);
        throw new InternalServerErrorException('Failed to create download URL');
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.error('Error getting download URL:', error);
      throw new InternalServerErrorException('Failed to get download URL');
    }
  }

  /**
   * Validate audio file
   */
  private validateAudioFile(file: Express.Multer.File): void {
    const maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 52428800); // 50MB default
    const allowedFormats = this.configService
      .get<string>('ALLOWED_AUDIO_FORMATS', 'mp3,flac,wav,aac,ogg')
      .split(',');

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check file format
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`,
      );
    }

    // Check MIME type
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/flac',
      'audio/wav',
      'audio/x-wav',
      'audio/aac',
      'audio/ogg',
      'audio/vorbis',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid audio file type');
    }
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: Express.Multer.File): void {
    const maxFileSize = 5242880; // 5MB for images

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > maxFileSize) {
      throw new BadRequestException('Image size exceeds maximum allowed size of 5MB');
    }

    // Check MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image file type. Allowed: JPEG, PNG, WebP');
    }
  }
}