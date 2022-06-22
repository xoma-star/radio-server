import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {arrayRemove, arrayUnion, doc, getDoc, updateDoc} from "firebase/firestore";
import firestore from "../firestore";
import UserEntity from "./user.entity";


@Injectable()
export class UserService{
    async getData(id: string): Promise<UserEntity>{
        try {
            if(!id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const userRef = doc(firestore, 'users', id)
            const res = await getDoc(userRef)
            if(!res.exists()) throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND)
            return {id: res.id, ...res.data()} as UserEntity
        }catch (e) {throw e}
    }

    async getPlaylists(id: string){
        try{
            return (await this.getData(id)).playlists
        }catch (e) {throw e}
    }

    async addPlaylist(id: string, playlist: string){
        try{
            if(!playlist || !id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const userRef = doc(firestore, 'users', id)
            const data = await this.getData(id)
            if(data.playlists.indexOf(playlist) >= 0) throw new HttpException('Плейлист уже в библиотеке', HttpStatus.FORBIDDEN)
            await updateDoc(userRef, {playlists: arrayUnion(playlist)})
            return [...data.playlists, playlist]
        }catch (e) {throw e}
    }

    async removePlaylist(id: string, playlist: string){
        try {
            if(!playlist || !id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const userRef = doc(firestore, 'users', id)
            const data = await this.getData(id)
            if(data.playlists.indexOf(playlist) < 0) throw new HttpException('Плейлиста нет в библиотеке', HttpStatus.FORBIDDEN)
            await updateDoc(userRef, {playlists: arrayRemove(playlist)})
        }catch (e) {throw e}
    }
}