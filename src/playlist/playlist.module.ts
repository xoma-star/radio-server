import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import {TrackService} from "../track/track.service";

@Module({
  providers: [PlaylistService, TrackService],
  controllers: [PlaylistController]
})
export class PlaylistModule {}
