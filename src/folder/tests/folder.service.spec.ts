import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { faker } from "@faker-js/faker";
import { FolderService } from "../folder.service";

describe("FolderService", () => {
  let service: FolderService;
  let prisma: PrismaService;

  const fakeFolder = {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    ownerId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    documents: [],
    owner: { id: faker.string.uuid(), email: faker.internet.email() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolderService,
        {
          provide: PrismaService,
          useValue: {
            folder: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FolderService>(FolderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("createFolder", () => {
    it("should create and return a folder", async () => {
      (prisma.folder.create as jest.Mock).mockResolvedValue(fakeFolder);

      const result = await service.createFolder({
        name: fakeFolder.name,
        ownerId: fakeFolder.ownerId,
      });

      expect(prisma.folder.create).toHaveBeenCalledWith({
        data: {
          name: fakeFolder.name,
          ownerId: fakeFolder.ownerId,
        },
      });
      expect(result).toEqual(fakeFolder);
    });
  });

  describe("getFolderById", () => {
    it("should return folder if found", async () => {
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(fakeFolder);

      const result = await service.getFolderById(fakeFolder.id);

      expect(prisma.folder.findUnique).toHaveBeenCalledWith({
        where: { id: fakeFolder.id },
        include: { documents: true, owner: true },
      });
      expect(result).toEqual(fakeFolder);
    });

    it("should throw NotFoundException if folder not found", async () => {
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getFolderById(fakeFolder.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateFolder", () => {
    it("should update and return the folder", async () => {
      const updateData = { name: "Updated Folder Name" };
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(fakeFolder);
      (prisma.folder.update as jest.Mock).mockResolvedValue({
        ...fakeFolder,
        ...updateData,
      });

      const result = await service.updateFolder(fakeFolder.id, updateData);

      expect(prisma.folder.update).toHaveBeenCalledWith({
        where: { id: fakeFolder.id },
        data: updateData,
      });
      expect(result.name).toBe(updateData.name);
    });

    it("should throw if folder not found", async () => {
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateFolder(fakeFolder.id, { name: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteFolder", () => {
    it("should delete and return the folder", async () => {
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(fakeFolder);
      (prisma.folder.delete as jest.Mock).mockResolvedValue(fakeFolder);

      const result = await service.deleteFolder(fakeFolder.id);

      expect(prisma.folder.delete).toHaveBeenCalledWith({
        where: { id: fakeFolder.id },
      });
      expect(result).toEqual(fakeFolder);
    });

    it("should throw if folder not found", async () => {
      (prisma.folder.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteFolder(fakeFolder.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findFolders", () => {
    it("should return paginated folders", async () => {
      const folders = Array(3).fill(fakeFolder);
      (prisma.folder.findMany as jest.Mock).mockResolvedValue(folders);
      (prisma.folder.count as jest.Mock).mockResolvedValue(3);

      const result = await service.findFolders({
        ownerId: fakeFolder.ownerId,
        search: "test",
        page: 1,
        limit: 10,
      });

      expect(prisma.folder.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: fakeFolder.ownerId,
          name: { contains: "test", mode: "insensitive" },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      expect(prisma.folder.count).toHaveBeenCalled();

      expect(result.data).toEqual(folders);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });
  });
});
