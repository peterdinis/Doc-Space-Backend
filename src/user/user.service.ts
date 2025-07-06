import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async myDocuments(userId: string) {
    const allUsersDocuments = await this.prismaService.document.findMany({
      where: {
        ownerId: userId,
      },
    });

    if (!allUsersDocuments) {
      throw new NotFoundException('User does not created any documents');
    }

    return allUsersDocuments;
  }
}
