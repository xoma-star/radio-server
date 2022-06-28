import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AuthLoginDto, AuthSignUpDto} from "./dto/auth.dto";
import {createHmac} from "node:crypto";
import * as uuid from 'uuid';
import {TokenService} from "../token/token.service";
import {JwtService} from "@nestjs/jwt";
import {JWT_REFRESH_SECRET} from "../config";
import UserEntity from "../user/user.entity";
import session from "../raven/ravendb";

@Injectable()
export class AuthService {
    constructor(private tokenService: TokenService, private jwtService: JwtService) {}
    async loginLocal(dto: AuthLoginDto){
        try {
            if(dto?.name?.length < 1 || dto?.password?.length < 1) throw new HttpException('Не все поля заполнены', HttpStatus.BAD_REQUEST)
            const users = await session.query<UserEntity>({collection: 'users'})
                .whereEquals('name', dto.name)
                .all()
            if(users.length !== 1) throw new HttpException('Пользователь не найден', HttpStatus.UNAUTHORIZED)
            const user = users[0]
            if(user.password !== createHmac('sha256', dto.password).digest('hex')) throw new HttpException('Пользователь не найден', HttpStatus.UNAUTHORIZED)
            const {accessToken, refreshToken} = this.tokenService.createTokens(user.id)
            await this.tokenService.saveToken(user.id, refreshToken)
            return {accessToken, refreshToken, id: user.id}
        }catch (e) {throw e}
    }
    async signupLocal(dto: AuthSignUpDto){
        try {
            if (dto.password.length < 1 || dto.name.length < 1 || dto.email.length < 1) throw new HttpException('Не все поля заполнены', HttpStatus.BAD_REQUEST)
            const data = {
                ...dto,
                name: dto.name.trim(),
                signUpDate: new Date().getTime(),
                password: createHmac('sha256', dto.password).digest('hex'),
                playlists: [],
                id: uuid.v4(),
                "@metadata": {
                    "@collection": "users"
                }
            }
            if (data.name.length < 1) throw new HttpException('Не все поля заполнены', HttpStatus.BAD_REQUEST)
            const names = await session.query({collection: 'users'})
                .whereEquals('name', data.name)
                .any()
            if (names) throw new HttpException('Указанное имя пользователя уже занято', HttpStatus.FORBIDDEN)
            const emails = await session.query({collection: 'users'})
                .whereEquals('email', data.email)
                .any()
            if (emails) throw new HttpException('Указанная почта уже используется другим аккаунтом', HttpStatus.FORBIDDEN)
            const {accessToken, refreshToken} = this.tokenService.createTokens(data.id)
            await session.store(data, data.id)
            await session.saveChanges()
            return {accessToken, refreshToken, id: data.id}
        }catch (e) {throw e}
    }

    async loginVK(email: string, sign: string){
        try{
            const users = await session.query<UserEntity>({collection: 'users'})
                .whereEquals('email', email)
                .all()
            if(users.length === 0) {
                const data = await this.signupLocal({email: email, name: email, password: sign.slice(0, 6)})
                await this.tokenService.saveToken(data.id, data.refreshToken)
                return {...data, password: sign.slice(0, 6)}
            }
            else{
                const user = users[0]
                const {accessToken, refreshToken} = this.tokenService.createTokens(user.id)
                await this.tokenService.saveToken(user.id, refreshToken)
                return {accessToken, refreshToken, id: user.id, password: null}
            }
        }catch (e) {throw e}
    }

    async logout(token: string){
        await this.tokenService.deleteTokens(token)
    }

    async refresh(refreshToken: string){
        const {id} = this.jwtService.verify(refreshToken, {secret: JWT_REFRESH_SECRET})
        if(!id) throw new HttpException('Неизвестная ошибка', HttpStatus.UNAUTHORIZED)
        try{
            const {accessToken, refreshToken} = this.tokenService.createTokens(id)
            await this.tokenService.saveToken(id, refreshToken)
            return {accessToken, refreshToken, id}
        }catch (e) {throw e}
    }
}
