import {Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards} from "@nestjs/common";
import {Response, Request} from 'express'
import {AuthService} from "./auth.service";
import {AuthLoginDto, AuthSignUpDto} from "./dto/auth.dto";
import {AtGuard, RtGuard} from "./guards";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService) {}
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginLocal(@Body() dto: AuthLoginDto, @Res() res: Response){
        const {accessToken, refreshToken, id} = await this.authService.loginLocal(dto)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000, secure: true})
        res.send({accessToken, refreshToken, id})
    }
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signupLocal(@Body() dto: AuthSignUpDto, @Res() res: Response){
        const {accessToken, refreshToken, id} = await this.authService.signupLocal(dto)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000, secure: true})
        res.send({accessToken, refreshToken, id})
    }
    @UseGuards(AtGuard)
    @Get('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res() res: Response){
        const {refreshToken} = req.cookies
        await this.authService.logout(refreshToken)
        res.clearCookie('refreshToken')
        res.send()
    }
    @UseGuards(RtGuard)
    @Get('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res() res: Response){
        const {accessToken, refreshToken, id} = await this.authService.refresh(req?.cookies?.refreshToken)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000, secure: true})
        res.send({accessToken, refreshToken, id})
    }

}