import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import AddToPlaylistDto from "./dto/add-to-playlist.dto";
import PlaylistEntity from "./playlist.entity";
import {TrackService} from "../track/track.service";
import {UserService} from "../user/user.service";
import * as uuid from "uuid";
import session from "../raven/ravendb";

@Injectable()
export class PlaylistService {
    constructor(
        private trackService: TrackService,
        private userService: UserService
    ) {}
    async create(name: string, isPublic: boolean, owner: string): Promise<PlaylistEntity>{
        try {
            const data = {
                name: name.trim().slice(0, 30),
                isPublic,
                owner,
                tracks: [],
                listens: 0,
                id: uuid.v4()
            }
            if(data.name.length <= 0 || !owner) throw new HttpException('Поля не могут быть пустыми', HttpStatus.BAD_REQUEST)
            await session.store({...data, "@metadata": {"@collection": "playlists"}})
            await session.saveChanges()
            await this.userService.addPlaylist(owner, data.id)
            return data
        }catch (e) {throw e}
    }
    async getRandom(count: number): Promise<PlaylistEntity[]>{
        const p = await session.query<PlaylistEntity>({collection: 'playlists'})
            .whereEquals('isPublic', true)
            .all()
        return p.sort(() => Math.random() - 0.5).slice(0, count)
    }
    async rename(playlistId: string, newName: string, isPublic: boolean, userId: string){
        try {
            if(!playlistId || !userId || !newName.trim()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const playlist = await this.get(playlistId)
            if(!playlist) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            if(playlist.owner !== userId) throw new HttpException('Нет прав для редактирования', HttpStatus.FORBIDDEN)
            playlist.name = newName.trim().slice(0, 30)
            playlist.isPublic = isPublic
            await session.saveChanges()
            return playlist
        }catch (e) {throw e}
    }
    async delete(playlistId: string, userId: string){
        try{
            if(!playlistId || !userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const playlist = await this.get(playlistId)
            if(!playlist) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            await this.userService.removePlaylist(userId, playlistId)
            if(playlist.owner !== userId) throw new HttpException('Плейлист удален из вашей библиотеки', HttpStatus.OK)
            else {
                playlist.willExpire = new Date().getTime() + 1000 * 60 * 60 * 24 * 7
                await session.saveChanges()
            }
            return playlistId
        }catch (e) {throw e}
    }
    async get(playlists: string): Promise<PlaylistEntity>
    async get(playlists: string[]): Promise<PlaylistEntity[]>
    async get<T extends string | string[]>(playlists: T){
        try {
            if(Array.isArray(playlists)){
                return await session.query<PlaylistEntity>({collection: 'playlists'})
                    .whereIn('id', playlists)
                    .all()
            }
            else return await session.load<PlaylistEntity>(playlists)
        }catch (e) {throw e}
    }

    async addToPlaylist({playlistId, trackId}: AddToPlaylistDto, uid: string): Promise<PlaylistEntity>{
        try{
            if(!playlistId || !trackId || !uid) throw new HttpException('Неизвестная ошибка', HttpStatus.BAD_REQUEST)
            const playlistData = await this.get(playlistId)
            if(!playlistData) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            if(playlistData.owner !== uid) throw new HttpException('Нет прав для редактирования', HttpStatus.FORBIDDEN)
            if(playlistData.tracks.indexOf(trackId) >= 0) throw new HttpException('Трек уже есть в плейлисте', HttpStatus.FORBIDDEN)
            const data = await this.trackService.getOne(trackId)
            if(!data) throw new HttpException('Неизвестная ошибка', HttpStatus.FORBIDDEN)
            playlistData.tracks.push(trackId)
            await session.saveChanges()
            return playlistData
        }catch (e) {throw e}
    }

    async removeTrack({playlistId, trackId}: AddToPlaylistDto, uid: string): Promise<PlaylistEntity>{
        try {
            if(!playlistId || !trackId || !uid) throw new HttpException('Неизвестная ошибка', HttpStatus.BAD_REQUEST)
            const playlistData = await this.get(playlistId)
            if(!playlistData) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            if(playlistData.owner !== uid) throw new HttpException('Нет прав для редактирования', HttpStatus.FORBIDDEN)
            if(playlistData.tracks.indexOf(trackId) < 0) throw new HttpException('Трека нет в плейлисте', HttpStatus.NOT_FOUND)
            playlistData.tracks.splice(playlistData.tracks.indexOf(trackId), 1)
            await session.saveChanges()
            return playlistData
        }catch (e) {throw e}
    }
}
