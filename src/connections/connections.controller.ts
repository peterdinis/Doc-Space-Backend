import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Get,
  Req,
  Query,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ConnectionStatus } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('Connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a connection request' })
  @ApiResponse({
    status: 201,
    description: 'Connection request sent successfully',
  })
  create(@Req() req, @Body() dto: CreateConnectionDto) {
    return this.connectionsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all your connections' })
  @ApiQuery({ name: 'status', enum: ConnectionStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of user connections' })
  findMine(
    @Req() req,
    @Query('status') status?: ConnectionStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.connectionsService.findUserConnections(
      req.user.id,
      status,
      Number(page),
      Number(limit),
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update the status of a connection (accept, reject, block)',
  })
  @ApiResponse({ status: 200, description: 'Connection status updated' })
  update(@Param('id') id: string, @Body() dto: UpdateConnectionDto) {
    return this.connectionsService.updateStatus(id, dto);
  }
}
