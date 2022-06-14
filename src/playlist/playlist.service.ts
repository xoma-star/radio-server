import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {addDoc, collection, doc, updateDoc, arrayUnion, getDoc, query, where, getDocs} from "firebase/firestore";
import firestore from "../firestore";
import AddToPlaylistDto from "./dto/add-to-playlist.dto";
import PlaylistEntity from "./playlist.entity";

@Injectable()
export class PlaylistService {
    async create(name: string, isPublic: boolean, owner: string){
        try {
            const col = collection(firestore, 'playlists')
            const ref = await addDoc(col, {
                name,
                isPublic,
                owner,
                tracks: [],
                listens: 0,
            })
            if(!ref) throw {message: 'Неизвестная ошибка'}
            const userRef = doc(firestore, 'users', owner)
            await updateDoc(userRef, {playlists: arrayUnion(ref.id)})
            return {id: ref.id}
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async get(playlists: string): Promise<PlaylistEntity>
    async get(playlists: string[]): Promise<PlaylistEntity[]>
    async get<T extends string | string[]>(playlists: T){
        try {
            const col = collection(firestore, 'playlists')
            if(Array.isArray(playlists)){
                const fetchArray = playlists.slice(0, 10)
                const q = query(col, where('__name__', 'in', fetchArray))
                const docs = await getDocs(q)

                return docs.docs.map(v => {return {id: v.id, ...v.data()} as PlaylistEntity})
            }
            else{
                const docRef = await getDoc(doc(col, playlists))
                return {id: docRef.id, ...docRef.data()} as PlaylistEntity
            }
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async addToPlaylist({playlistId, trackId}: AddToPlaylistDto, uid: string){
        try{
            if(!playlistId || !trackId || !uid) throw new HttpException('Неизвестная ошибка', HttpStatus.BAD_REQUEST)
            const playlistData = await this.get(playlistId)
            if(!playlistData) throw new HttpException('Плейлист не найден', HttpStatus.NOT_FOUND)
            if(playlistData.owner !== uid) throw new HttpException('Нет прав для редактирования', HttpStatus.FORBIDDEN)
            await updateDoc(doc(firestore, 'playlists', playlistId), {tracks: arrayUnion(trackId)})
            return {...playlistData, tracks: [...playlistData.tracks, trackId]}
        }catch (e) {throw e}
    }
}
