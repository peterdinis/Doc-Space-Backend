import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './dto/folders.dto';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) { }

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
    search?: string;
  }) {
    const { ownerId, page = 1, limit = 10, search } = params;

    const where = {
      userId: ownerId,
      ...(search
        ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
        : {}),
    };

    const [folders, total] = await this.prisma.$transaction([
      this.prisma.folder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.folder.count({ where }),
    ]);

    return {
      data: folders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
