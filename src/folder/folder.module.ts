import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { FolderService } from "./folder.service";
import { FolderController } from "./folder.controller";

@Module({
    imports: [PrismaModule],
    providers: [FolderService],
    controllers: [FolderController]
})

export class FolderModule {}