import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async myDocuments(userId: string) {
    const allUsersDocuments = await this.prismaService.document.findMany({
      where: {
        userId: userId,
      },
    });

    if (!allUsersDocuments) {
      throw new NotFoundException('User does not created any documents');
    }

    return allUsersDocuments;
  }

  async allMySharedDocuments(userId: string) {
    const allUserSharedDocuments =
      await this.prismaService.sharedDocument.findMany({
        where: {
          userId,
        },
      });

    if (!allUserSharedDocuments) {
      throw new NotFoundException('User does not have any shared documents');
    }

    return allUserSharedDocuments;
  }
}
