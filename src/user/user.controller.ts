import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user info' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/documents/me/:userId')
  @ApiOperation({ summary: 'Get logged user documents' })
  @ApiResponse({ status: 200, description: 'Returns user created documents' })
  getMyDocuments(@Param('userId') userId: string) {
    return this.userService.myDocuments(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/shared-documents/me/:userId')
  @ApiOperation({ summary: 'Get logged user shared documents' })
  @ApiResponse({ status: 200, description: 'Returns user shared documents' })
  getMySharedDocuments(@Param('userId') userId: string) {
    return this.userService.allMySharedDocuments(userId);
  }
}
