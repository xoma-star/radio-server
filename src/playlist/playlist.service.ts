import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {addDoc, collection, doc, updateDoc, arrayUnion, getDoc, query, where, getDocs, arrayRemove} from "firebase/firestore";
import firestore from "../firestore";
import AddToPlaylistDto from "./dto/add-to-playlist.dto";
import PlaylistEntity from "./playlist.entity";
import {TrackService} from "../track/track.service";
import {UserService} from "../user/user.service";

@Injectable()
export class PlaylistService {
    constructor(
        private trackService: TrackService,
        private userService: UserService
    ) {}
    async create(name: string, isPublic: boolean, owner: string): Promise<PlaylistEntity>{
        try {
            if(!name.trim() || !owner) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const col = collection(firestore, 'playlists')
            const data = {
                name: name.trim().slice(0, 30),
                isPublic,
                owner,
                tracks: [],
                listens: 0,
            }
            const ref = await addDoc(col, data)
            if(!ref) throw new HttpException('Не удалось создать', HttpStatus.INTERNAL_SERVER_ERROR)
            await this.userService.addPlaylist(owner, ref.id)
            return {id: ref.id, ...data}
        }catch (e) {throw e}
    }
    async rename(playlistId: string, newName: string, userId: string){
        try {
            if(!playlistId || !userId || !newName.trim()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const playlistRef = doc(firestore, 'playlists', playlistId)
            const playlist = await getDoc(playlistRef)
            if(!playlist.exists()) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            if(playlist.data().owner !== userId) throw new HttpException('Только владелец может изменить название', HttpStatus.FORBIDDEN)
            await updateDoc(playlistRef, {name: newName.trim().slice(30)})
            return {id: playlistRef.id, ...playlist.data(), name: newName.trim().slice(30)}
        }catch (e) {throw e}
    }
    async delete(playlistId: string, userId: string){
        try{
            if(!playlistId || !userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            const playlistRef = doc(firestore, 'playlists', playlistId)
            const playlist = await getDoc(playlistRef)
            if(!playlist.exists()) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            await this.userService.removePlaylist(userId, playlistId)
            if(playlist.data().owner !== userId) throw new HttpException('Плейлист удален из вашей библиотеки', HttpStatus.OK)
            else await updateDoc(playlistRef, {willExpire: new Date().getTime() + 1000 * 60 * 60 * 24 * 7})
            return playlistId
        }catch (e) {throw e}
    }
    async get(playlists: string): Promise<PlaylistEntity>
    async get(playlists: string[]): Promise<PlaylistEntity[]>
    async get<T extends string | string[]>(playlists: T){
        try {
            const col = collection(firestore, 'playlists')
            if(Array.isArray(playlists)){
                const fetchArray = playlists.slice(0, 10)
                if(fetchArray.length <= 0) return []
                const q = query(col, where('__name__', 'in', fetchArray))
                const docs = await getDocs(q)

                return docs.docs.map(v => {return {id: v.id, ...v.data()} as PlaylistEntity})
            }
            else{
                const docRef = await getDoc(doc(col, playlists))
                return {id: docRef.id, ...docRef.data()} as PlaylistEntity
            }
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
            await updateDoc(doc(firestore, 'playlists', playlistId), {tracks: arrayUnion(trackId)})
            return {...playlistData, tracks: [...playlistData.tracks, trackId]}
        }catch (e) {throw e}
    }

    async removeTrack({playlistId, trackId}: AddToPlaylistDto, uid: string): Promise<PlaylistEntity>{
        try {
            if(!playlistId || !trackId || !uid) throw new HttpException('Неизвестная ошибка', HttpStatus.BAD_REQUEST)
            const playlistData = await this.get(playlistId)
            if(!playlistData) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            if(playlistData.owner !== uid) throw new HttpException('Нет прав для редактирования', HttpStatus.FORBIDDEN)
            if(playlistData.tracks.indexOf(trackId) < 0) throw new HttpException('Трека нет в плейлисте', HttpStatus.NOT_FOUND)
            await updateDoc(doc(firestore, 'playlists', playlistId), {tracks: arrayRemove(trackId)})
            return {...playlistData, tracks: [...playlistData.tracks].filter(x => x !== trackId)}
        }catch (e) {throw e}
    }
}
