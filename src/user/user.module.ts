import { Module } from "@nestjs/common";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {PlaylistService} from "../playlist/playlist.service";

@Module({
    controllers: [UserController],
    providers: [UserService, PlaylistService]
})
export class UserModule{}