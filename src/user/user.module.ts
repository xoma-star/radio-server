import { Module } from "@nestjs/common";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {PlaylistService} from "../playlist/playlist.service";
import {TrackService} from "../track/track.service";

@Module({
    controllers: [UserController],
    providers: [UserService, PlaylistService, TrackService],
    imports: [TrackService]
})
export class UserModule{}