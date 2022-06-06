import { Module } from "@nestjs/common";
import { TrackController } from "./track.controller";
import { TrackService } from "./track.service";
import { FileService } from "../file/file.service";

@Module({
  controllers: [TrackController],
  providers: [TrackService, FileService]
})
export class TrackModule{}