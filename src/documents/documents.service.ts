import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateDocumentDto, userId: string) {
        if (!dto.title || dto.title.trim() === '') {
            throw new BadRequestException('Title is required');
        }

        return this.prisma.document.create({
            data: {
                ...dto,
                ownerId: userId,
            },
        });
    }

    async findAll(query: QueryDocumentDto, userId: string) {
        const { search, status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where = {
            ownerId: userId,
            ...(search && {
                title: {
                    contains: search,
                    mode: 'insensitive',
                },
            }),
            ...(status && { status }),
        };

        const [documents, total] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.document.count({ where }),
        ]);

        return {
            data: documents,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string, userId: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        if (document.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to view this document');
        }

        return document;
    }

    async update(id: string, dto: UpdateDocumentDto, userId: string) {
        const document = await this.findOne(id, userId);

        if (dto.title?.trim() === '') {
            throw new BadRequestException('Title cannot be empty');
        }

        return this.prisma.document.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);
        return this.prisma.document.delete({
            where: { id },
        });
    }

    async removeAll(userId: string) {
        const deleted = await this.prisma.document.deleteMany({
            where: {
                ownerId: userId,
            },
        });

        return {
            message: `${deleted.count} document(s) deleted`,
        };
    }
}
