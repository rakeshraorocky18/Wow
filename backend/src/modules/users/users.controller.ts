import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.typeorm';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user profile' })
  async createProfile(@Req() req: any, @Body() createProfileDto: CreateProfileDto) {
    return this.usersService.createProfile(req.user.id, createProfileDto);
  }

  @Post('profile/photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req: any, file: any, cb: any) => {
          const fileExt = extname(file.originalname);
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload profile photo' })
  async uploadProfilePhoto(@Req() req: any, @UploadedFile() file: any) {
    const photoUrl = `/api/uploads/${file.filename}`;
    return this.usersService.addPhoto(req.user.id, photoUrl);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own profile' })
  async getOwnProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile by ID' })
  async getProfileById(@Param('id') id: string) {
    return this.usersService.getProfileById(id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search profiles' })
  async searchProfiles(
    @Query('gender') gender?: string,
    @Query('religion') religion?: string,
    @Query('city') city?: string,
    @Query('minAge') minAge?: number,
    @Query('maxAge') maxAge?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.searchProfiles(
      { gender, religion, city, minAge, maxAge },
      page,
      limit,
    );
  }
}
