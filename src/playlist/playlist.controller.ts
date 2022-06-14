import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {AtGuard} from "../auth/guards";
import {CreatePlaylistDto} from "./dto/create-playlist.dto";
import {PlaylistService} from "./playlist.service";
import {Request} from "express";
import AddToPlaylistDto from "./dto/add-to-playlist.dto";

@Controller('playlist')
export class PlaylistController {
    constructor(private playlistService: PlaylistService) {}

    @UseGuards(AtGuard)
    @Post('create')
    create(@Body() dto: CreatePlaylistDto, @Req() req: Request){
        return this.playlistService.create(dto.name, dto.isPublic, req.user['id'])
    }
    @UseGuards(AtGuard)
    @Post('add')
    add(@Body() dto: AddToPlaylistDto, @Req() req: Request){
        return this.playlistService.addToPlaylist(dto, req.user['id'])
    }
}
