import { Module } from "@nestjs/common";
import PrismaModule from "src/prisma/prisma.module";
import { ConnectionsController } from "./connections.controller";
import { ConnectionService } from "./connections.service";

@Module({
    imports: [PrismaModule],
    controllers: [ConnectionsController],
    providers: [ConnectionService]
})

export class ConnectionsModule {}