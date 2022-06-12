import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {AuthController} from "./auth.controller";
import {TokenService} from "../token/token.service";
import {JwtModule} from "@nestjs/jwt";
import {AtStrategy, RtStrategy} from "./strategies";

@Module({
  providers: [AuthService, TokenService, AtStrategy, RtStrategy],
  controllers: [AuthController],
  imports: [JwtModule.register({})]
})
export class AuthModule {}
