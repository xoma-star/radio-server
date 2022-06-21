import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import {TrackService} from "../track/track.service";
import { UserService } from 'src/user/user.service';

@Module({
  providers: [PlaylistService, TrackService, UserService],
  controllers: [PlaylistController]
})
export class PlaylistModule {}
