import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService) {}

  create(requesterId: string, dto: CreateConnectionDto) {
    return this.prisma.connection.create({
      data: {
        requesterId,
        receiverId: dto.receiverId,
      },
    });
  }

  findUserConnections(userId: string) {
    return this.prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        requester: true,
        receiver: true,
      }
    });
  }

  async updateStatus(id: string, dto: UpdateConnectionDto) {
    return this.prisma.connection.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
