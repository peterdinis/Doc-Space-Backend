import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './dto/folders.dto';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  async createFolder(createData: CreateFolderDto) {
  return this.prisma.folder.create({
    data: {
      name: createData.name,
      userId: createData.ownerId,
      documents: {
        connect: createData.documents.map((doc) => ({ id: doc.id })),
      },
    },
  });
}

  async getFolderById(id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        documents: true,
        user: true,
      },
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    return folder;
  }

  async updateFolder(id: string, data: UpdateFolderDto) {
    await this.getFolderById(id);

    return this.prisma.folder.update({
      where: { id },
      data,
    });
  }

  async deleteFolder(id: string) {
    await this.getFolderById(id);

    return this.prisma.folder.delete({
      where: { id },
    });
  }

  async findFolders(params: {
    ownerId: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10 } = params;

    const folders = await this.prisma.folder.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: folders,
      page,
      limit,
    };
  }
}
