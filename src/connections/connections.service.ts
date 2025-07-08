import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { ConnectionStatus } from 'generated/prisma';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(requesterId: string, dto: CreateConnectionDto) {
    return this.prisma.connection.create({
      data: {
        requesterId,
        receiverId: dto.receiverId,
      },
    });
  }

  async findUserConnections(
    userId: string,
    status?: ConnectionStatus,
    page = 1,
    limit = 10,
  ) {
    const where = {
      OR: [{ requesterId: userId }, { receiverId: userId }],
      ...(status ? { status } : {}),
    };

    const [connections, total] = await Promise.all([
      this.prisma.connection.findMany({
        where,
        include: {
          requester: true,
          receiver: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.connection.count({ where }),
    ]);

    return {
      data: connections,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, dto: UpdateConnectionDto) {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    return this.prisma.connection.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }
}
