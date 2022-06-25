import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {JWT_ACCESS_SECRET, JWT_REFRESH_SECRET} from "../config";
import session from "../raven/ravendb";
import TokenEntity from "./token.entity";

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService) {}

    createTokens(id: string){
        const accessToken = this.jwtService.sign({id}, {secret: JWT_ACCESS_SECRET, expiresIn: '30m'})
        const refreshToken = this.jwtService.sign({id}, {secret: JWT_REFRESH_SECRET, expiresIn: '14d'})

        return {
            accessToken,
            refreshToken
        }
    }

    async deleteTokens(token: string){
        try {
            if(!token) throw new HttpException('Невалидный токен. Войдите в аккаунт заново', HttpStatus.FORBIDDEN)
            const tokenDB = await session.query<TokenEntity>({collection: 'tokens'})
                .whereEquals('refreshToken', token)
                .first()
            if(tokenDB) await session.delete(tokenDB)
            await session.saveChanges()
        }catch (e) {throw e}
    }

    async verifyRefreshToken(token: string){
        if(!token) throw new HttpException('Ошибка авторизации', HttpStatus.FORBIDDEN)
        try{
            const d = await session.query({collection: 'tokens'})
                .whereEquals('refreshToken', token)
                .all()
            if(d.length !== 1) throw new HttpException('Ошибка авторизации', HttpStatus.FORBIDDEN)
            return d.length > 0
        }catch (e) {throw e}
    }

    async saveToken(id: string, token: string){
        try {
            if(!token || !id) throw new HttpException('Невалидный токен', HttpStatus.FORBIDDEN)
            const tokenDB = await session.query<TokenEntity>({collection: 'tokens'})
                .whereEquals('user', id)
                .all()
            if(tokenDB.length !== 1){
                await session.store({user: id, refreshToken: token, "@metadata": {"@collection": 'tokens'}}, null)
                await session.saveChanges()
            }
            else{
                tokenDB[0].refreshToken = token
                await session.saveChanges()
            }
        }catch (e) {throw e}
    }
}
