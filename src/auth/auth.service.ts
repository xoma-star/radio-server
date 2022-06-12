import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AuthLoginDto, AuthSignUpDto} from "./dto/auth.dto";
import {createHmac} from "node:crypto";
import {addDoc, collection, getDocs, limit, query, where} from "firebase/firestore";
import firestore from "../firestore";
import {TokenService} from "../token/token.service";
import {JwtService} from "@nestjs/jwt";
import {JWT_REFRESH_SECRET} from "../config";

@Injectable()
export class AuthService {
    constructor(private tokenService: TokenService, private jwtService: JwtService) {
    }
    async loginLocal(dto: AuthLoginDto){
        try {
            if(dto?.name?.length < 1 || dto?.password?.length < 1) throw {message: 'Пользователь не найден'}
            const q = query(collection(firestore, 'users'), where('name', '==', dto.name), limit(1))
            const doc = await getDocs(q)
            if(doc.docs.length < 1) throw {message: 'Не удалось найти пользователя'}
            const pass = createHmac('sha256', dto.password).digest('hex')
            const userRef = doc.docs[0]
            const user = userRef.data()
            if(user.password !== pass) throw {message: 'Не удалось найти пользователя'}
            const {accessToken, refreshToken} = this.tokenService.createTokens(userRef.id)
            await this.tokenService.addTokenToFirestore(userRef.id, refreshToken)
            return {accessToken, refreshToken, id: userRef.id}
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async signupLocal(dto: AuthSignUpDto){
        try {
            if(dto.password.length < 1 || dto.name.length < 1 || dto.email.length < 1) throw {message: 'Поля не должны быть пустыми.'}
            const data = {
                ...dto,
                signUpDate: new Date().getTime(),
                password: createHmac('sha256', dto.password).digest('hex')
            }
            const ref = collection(firestore, 'users')
            const checkName = await getDocs(query(ref, where('name', '==', data.name), limit(1)))
            if(checkName.docs.length > 0) throw {message: 'Указанное имя пользователя уже занято'}
            const checkEmail = await getDocs(query(ref, where('email', '==', data.email), limit(1)))
            if(checkEmail.docs.length > 0) throw {message: 'Указанная почта уже используется другим аккаунтом'}
            const docRef = await addDoc(collection(firestore, 'users'), data)
            const {accessToken, refreshToken} = this.tokenService.createTokens(docRef.id)
            await this.tokenService.addTokenToFirestore(docRef.id, refreshToken)
            return {accessToken, refreshToken, id: docRef.id}
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async logout(token: string){
        await this.tokenService.deleteTokens(token)
    }

    async refresh(refreshToken: string){
        const {id} = this.jwtService.verify(refreshToken, {secret: JWT_REFRESH_SECRET})
        if(!id) throw new HttpException('Неизвестная ошибка', HttpStatus.UNAUTHORIZED)
        try{
            const {accessToken, refreshToken} = this.tokenService.createTokens(id)
            await this.tokenService.addTokenToFirestore(id, refreshToken)
            return {accessToken, refreshToken, id}
        }catch (e) {
            throw new HttpException('Неизвестная ошибка', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
