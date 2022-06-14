import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {AtGuard} from "../auth/guards";
import {Request} from "express";
import {UserService} from "./user.service";
import {PlaylistService} from "../playlist/playlist.service";

@Controller('/users')
export class UserController{
    constructor(private userService: UserService, private playlistService: PlaylistService) {}
    @UseGuards(AtGuard)
    @Get('playlists')
    async getPlaylists(@Req() req: Request){
        const playlists = await this.userService.getPlaylists(req.user['id'])
        return this.playlistService.get(playlists)
    }
}