import { Test, TestingModule } from "@nestjs/testing";
import { FolderController } from "../folder.controller";
import { FolderService } from "../folder.service";
import { NotFoundException} from "@nestjs/common";
import { faker } from "@faker-js/faker";

describe("FolderController", () => {
  let controller: FolderController;
  let service: FolderService;

  const fakeFolder = {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    ownerId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    documents: [],
    owner: { id: faker.string.uuid(), email: faker.internet.email() },
  };

  const mockFolderService = {
    createFolder: jest.fn(),
    getFolderById: jest.fn(),
    updateFolder: jest.fn(),
    deleteFolder: jest.fn(),
    findFolders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolderController],
      providers: [{ provide: FolderService, useValue: mockFolderService }],
    }).compile();

    controller = module.get<FolderController>(FolderController);
    service = module.get<FolderService>(FolderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFolder", () => {
    it("should call service.createFolder and return result", async () => {
      mockFolderService.createFolder.mockResolvedValue(fakeFolder);

      const result = await controller.createFolder({
        name: fakeFolder.name,
        ownerId: fakeFolder.ownerId,
      });

      expect(mockFolderService.createFolder).toHaveBeenCalledWith({
        name: fakeFolder.name,
        ownerId: fakeFolder.ownerId,
      });
      expect(result).toEqual(fakeFolder);
    });
  });

  describe("getFolders", () => {
    it("should call service.findFolders with correct params and return result", async () => {
      const paginatedResult = {
        data: [fakeFolder],
        totalCount: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockFolderService.findFolders.mockResolvedValue(paginatedResult);

      const result = await controller.getFolders(fakeFolder.ownerId, "search", 1, 10);

      expect(mockFolderService.findFolders).toHaveBeenCalledWith({
        ownerId: fakeFolder.ownerId,
        search: "search",
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(paginatedResult);
    });
  });

  describe("getFolderById", () => {
    it("should return folder when found", async () => {
      mockFolderService.getFolderById.mockResolvedValue(fakeFolder);

      const result = await controller.getFolderById(fakeFolder.id);

      expect(mockFolderService.getFolderById).toHaveBeenCalledWith(fakeFolder.id);
      expect(result).toEqual(fakeFolder);
    });

    it("should throw NotFoundException when folder not found", async () => {
      mockFolderService.getFolderById.mockRejectedValue(new NotFoundException());

      await expect(controller.getFolderById(fakeFolder.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateFolder", () => {
    it("should call service.updateFolder and return updated folder", async () => {
      const updateDto = { name: "Updated name" };
      const updatedFolder = { ...fakeFolder, ...updateDto };

      mockFolderService.updateFolder.mockResolvedValue(updatedFolder);

      const result = await controller.updateFolder(fakeFolder.id, updateDto);

      expect(mockFolderService.updateFolder).toHaveBeenCalledWith(fakeFolder.id, updateDto);
      expect(result).toEqual(updatedFolder);
    });
  });

  describe("deleteFolder", () => {
    it("should call service.deleteFolder and return deleted folder", async () => {
      mockFolderService.deleteFolder.mockResolvedValue(fakeFolder);

      const result = await controller.deleteFolder(fakeFolder.id);

      expect(mockFolderService.deleteFolder).toHaveBeenCalledWith(fakeFolder.id);
      expect(result).toEqual(fakeFolder);
    });
  });
});
