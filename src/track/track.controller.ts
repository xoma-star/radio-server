import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import {TrackService} from "./track.service";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {CreateTrackDto} from "./dto/create-track.dto";
import {FileService, FileType} from "../file/file.service";
import {AtGuard} from "../auth/guards";
import {Request} from 'express'

@Controller('tracks')
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
  @Get('getMultiple')
  getMultiple(@Query('tracks') tracks: string){
    return this.trackService.getMultiple(tracks.split(','))
  }
  @Get(':id')
  getOne(@Param('id') id: string){
    return this.trackService.getOne(id)
  }
  @UseGuards(AtGuard)
  @Post('add')
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'audio', maxCount: 1}
  ]))
  create(@UploadedFiles() files, @Body() dto: CreateTrackDto, @Req() req: Request){
    const {audio} = files
    const audioPath = this.fileService.createFile(FileType.AUDIO, audio[0])
    const coverPath = this.fileService.createFile(FileType.COVER, dto.cover64)
    return this.trackService.create(dto, audioPath, coverPath, req.user['id'])
  }
}