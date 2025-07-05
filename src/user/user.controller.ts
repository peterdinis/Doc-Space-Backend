import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user info' })
  getProfile(@Request() req) {
    return req.user
  }
}