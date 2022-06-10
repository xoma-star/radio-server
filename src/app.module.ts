import { Module } from '@nestjs/common';
import { TrackModule } from "./track/track.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from 'path'
import {FileModule} from "./file/file.module";
import {UserModule} from "./user/user.module";

@Module({
    imports: [
        TrackModule,
        FileModule,
        UserModule,
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, 'static'),
            serveStaticOptions: {index: false}
        })
    ]
})
export class AppModule {}
