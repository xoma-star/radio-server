import { Module } from '@nestjs/common';
import { TrackModule } from "./track/track.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from 'path'
import {FileModule} from "./file/file.module";
import {UserModule} from "./user/user.module";
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';

@Module({
    imports: [
        TrackModule,
        FileModule,
        UserModule,
        ServeStaticModule.forRoot({
            rootPath: path.resolve('/media/uploads/'),
            serveStaticOptions: {index: false, setHeaders: (res) => {
                res.set('Access-Control-Allow-Origin', '*');
            }}
        }),
        AuthModule,
        TokenModule
    ]
})
export class AppModule {}
