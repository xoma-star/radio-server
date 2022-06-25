import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import UserEntity from "./user.entity";
import session from "../raven/ravendb";


@Injectable()
export class UserService{
    async getData(id: string): Promise<UserEntity>{
        try {
            if(!id) throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND)
            return await session.load<UserEntity>(id)
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
            const doc = await this.getData(id)
            if(doc.playlists.indexOf(playlist) >= 0) throw new HttpException('Плейлист уже есть в библиотеке', HttpStatus.FORBIDDEN)
            doc.playlists = [...doc.playlists, playlist]
            await session.saveChanges()
            return doc.playlists
        }catch (e) {throw e}
    }

    async removePlaylist(id: string, playlist: string){
        try {
            if(!playlist || !id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const data = await this.getData(id)
            if(data.playlists.indexOf(playlist) < 0) throw new HttpException('Плейлиста нет в библиотеке', HttpStatus.FORBIDDEN)
            data.playlists.splice(data.playlists.indexOf(playlist), 1)
            await session.saveChanges()
        }catch (e) {throw e}
    }
}