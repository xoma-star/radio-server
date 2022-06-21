import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {getDoc, doc, addDoc, collection, getDocs, query, limit, orderBy} from 'firebase/firestore'
import firestore from "../firestore";
import {CreateTrackDto} from "./dto/create-track.dto";
import TrackEntity from "./track.entity";

@Injectable()
export class TrackService{
    async create(dto: CreateTrackDto, audio: string, cover: string, uid: string): Promise<TrackEntity>{
        try{
            const data = {
                name: dto.name,
                author: dto.author,
                path: audio,
                cover: cover,
                uploadedBy: uid,
                uploadTime: new Date().getTime()
            }
            const docRef = await addDoc(collection(firestore, 'tracks'), data)
            return {...data, id: docRef.id}
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async getLatest(): Promise<TrackEntity[]>{
        try {
            const d = await getDocs(query(collection(firestore, 'tracks'), limit(30), orderBy('uploadTime', 'desc')))
            return d.docs.map(v => {return {...v.data(), id: v.id} as TrackEntity})
        }catch (e) {throw e}
    }
    async getAll(): Promise<TrackEntity[]>{
        try {
            const d = await getDocs(query(collection(firestore, 'tracks')))
            return d.docs.map(v => {return {...v.data(), id: v.id} as TrackEntity})
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async getOne(id: string): Promise<TrackEntity>{
        try{
            const docRef = await getDoc(doc(firestore, 'tracks', id))
            if(!docRef.exists()) throw new HttpException('Не найдено', HttpStatus.NOT_FOUND)
            return {...docRef.data(), id: docRef.id} as TrackEntity
        }catch (e) {throw e}
    }
    async getMultiple(tracks: string[]): Promise<TrackEntity[]>{
        try{
            if(tracks.length < 1) throw new HttpException('null', HttpStatus.NOT_FOUND)
            const all = await this.getAll()
            return all.filter(x => tracks.indexOf(x.id) >= 0)
        }catch (e) {throw e}
    }
}