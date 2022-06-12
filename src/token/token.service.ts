import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {JWT_ACCESS_SECRET, JWT_REFRESH_SECRET} from "../config";
import {addDoc, collection, getDocs, limit, query, updateDoc, where, deleteDoc} from "firebase/firestore";
import firestore from "../firestore";

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
        if(!token) throw new HttpException('Неизвестная ошибка', HttpStatus.FORBIDDEN)
        const c = collection(firestore, 'tokens')
        const q = query(c, where('refreshToken', '==', token), limit(1))
        const ref = await getDocs(q)
        if(ref.docs.length > 0) await deleteDoc(ref.docs[0].ref)
        else throw new HttpException('Неизвестная ошибка', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    async verifyRefreshToken(token: string){
        if(!token) throw new HttpException('Неизвестная ошибка', HttpStatus.FORBIDDEN)
        const c = collection(firestore, 'tokens')
        const q = query(c, where('refreshToken', '==', token), limit(1))
        const ref = await getDocs(q)
        return ref.docs.length > 0

    }

    async addTokenToFirestore(id: string, token: string){
        if(!token || !id) throw new HttpException('Неизвестная ошибка', HttpStatus.FORBIDDEN)
        const c = collection(firestore, 'tokens')
        const q = query(c, where('id', '==', id), limit(1))
        const ref = await getDocs(q)
        const data = {refreshToken: token, id}
        if(ref.docs.length > 0) {
            await updateDoc(ref.docs[0].ref, {refreshToken: token})
            return ref.docs[0]
        }
        else{
            return await addDoc(c, data)
        }

    }
}
