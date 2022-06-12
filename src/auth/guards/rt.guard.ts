import {AuthGuard} from "@nestjs/passport";
import {ExecutionContext, Injectable} from "@nestjs/common";
import {Request} from "express";
import {TokenService} from "../../token/token.service";

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh'){
    constructor(private tokenService: TokenService) {
        super()
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest()
        if(!request?.cookies?.refreshToken) return false
        return  await this.tokenService.verifyRefreshToken(request?.cookies?.refreshToken)
    }
}