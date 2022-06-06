import {Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors} from "@nestjs/common";
import {TrackService} from "./track.service";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {CreateTrackDto} from "./dto/create-track.dto";
import {FileService, FileType} from "../file/file.service";

@Controller('/tracks')
export class TrackController{
  constructor(
      private trackService: TrackService,
      private fileService: FileService
  ) {
  }
  @Get()
  getAll(){
    return this.trackService.getAll()
  }
  @Get(':id')
  getOne(@Param('id') id: string){
    return this.trackService.getOne(id)
  }
  @Post('/add')
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'audio', maxCount: 1}
  ]))
  create(@UploadedFiles() files, @Body() dto: CreateTrackDto){
    const {audio} = files
    const audioPath = this.fileService.createFile(FileType.AUDIO, audio[0])
    const coverPath = this.fileService.createFile(FileType.COVER, dto.cover64)
    return this.trackService.create(dto, audioPath, coverPath)
  }
}