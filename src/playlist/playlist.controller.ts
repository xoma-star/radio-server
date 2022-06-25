import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {AtGuard} from "../auth/guards";
import {CreatePlaylistDto} from "./dto/create-playlist.dto";
import {PlaylistService} from "./playlist.service";
import {Request} from "express";
import AddToPlaylistDto from "./dto/add-to-playlist.dto";
import {RenamePlaylistDto} from "./dto/rename-playlist.dto";

@Controller('playlist')
export class PlaylistController {
    constructor(private playlistService: PlaylistService) {}

    @UseGuards(AtGuard)
    @Post('create')
    create(@Body() dto: CreatePlaylistDto, @Req() req: Request){
        return this.playlistService.create(dto.name, dto.isPublic, req.user['id'])
    }
    @UseGuards(AtGuard)
    @Post('rename')
    rename(@Body() dto: RenamePlaylistDto, @Req() req: Request){
        return this.playlistService.rename(dto.playlistId, dto.newName, dto.isPublic, req.user['id'])
    }
    @UseGuards(AtGuard)
    @Post('delete')
    delete(@Body() dto: {playlistId: string}, @Req() req: Request){
        return this.playlistService.delete(dto.playlistId, req.user['id'])
    }
    @UseGuards(AtGuard)
    @Post('add')
    add(@Body() dto: AddToPlaylistDto, @Req() req: Request){
        return this.playlistService.addToPlaylist(dto, req.user['id'])
    }
    @UseGuards(AtGuard)
    @Post('removeTrack')
    removeTrack(@Body() dto: AddToPlaylistDto, @Req() req: Request){
        return this.playlistService.removeTrack(dto, req.user['id'])
    }
    @Get('curated')
    getCurated(){
        return this.playlistService.get([
            '664180b9-689a-40b8-ac95-2d9c22fa30ec'
        ])
    }
    @Get(':id')
    getOne(@Param('id') id: string){
        return this.playlistService.get(id)
    }
}
