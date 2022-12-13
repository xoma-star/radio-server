import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {CreateTrackDto} from "./dto/create-track.dto";
import TrackEntity from "./track.entity";
import * as uuid from "uuid";
import session from "../raven/ravendb";
import similarity from "../misc/search";

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
                uploadTime: new Date().getTime(),
                id: uuid.v4(),
                listens: 0
            }
            await session.store({...data, "@metadata": {"@collection": "tracks"}})
            await session.saveChanges()
            return data
        } catch (e) {throw e}
    }
    async search(query: string): Promise<TrackEntity[]>{
        try{
            if(query.trim().length < 1) throw new HttpException('Пустой запрос', HttpStatus.BAD_REQUEST)
            const tracks = await session.query<TrackEntity>({collection: 'tracks'}).all()
            return tracks.filter(x => {
                if(similarity(query, x.author) >= 0.5 || similarity(query, x.name) >= 0.5) return x
            })
        } catch (e) {throw e}
    }
    async addListen(id: string): Promise<void>{
        try{
            const track = await this.getOne(id)
            if(!track) return
            if(track.listens > -1) track.listens = track.listens + 1
            else track.listens = 1
            await session.saveChanges()
        }catch (e) {}
    }
    async getMostListened(): Promise<TrackEntity[]>{
        try{
            return await session.query<TrackEntity>({collection: 'tracks'})
                .orderByDescending('listens')
                .take(30)
                .all()
        }catch (e) {throw e}
    }
    async getLatest(): Promise<TrackEntity[]>{
        try {
            return await session.query<TrackEntity>({collection: 'tracks'})
                .orderByDescending('uploadTime')
                .take(30)
                .all()
        }catch (e) {throw e}
    }
    async getRandom(count: number): Promise<TrackEntity[]>{
        try{
            const all = await this.getAll()
            return all.sort(() => 0.5 - Math.random()).slice(0, count)
        }catch (e) {throw e}
    }
    async getAll(): Promise<TrackEntity[]>{
        try {
            return await session.query<TrackEntity>({collection: 'tracks'}).all()
        }catch (e) {throw e}
    }
    async getOne(id: string): Promise<TrackEntity>{
        try{
            const d = await session.query<TrackEntity>({collection: 'tracks'}).whereEquals('id', id).all()
            if(d.length < 1) return null
            return d[0]
        }catch (e) {throw e}
    }
    async getMultiple(tracks: string[]): Promise<TrackEntity[]>{
        try{
            if(tracks.length < 1) throw new HttpException('null', HttpStatus.NOT_FOUND)
            return await session.query<TrackEntity>({collection: 'tracks'})
                .whereIn('id', tracks)
                .all()
        }catch (e) {throw e}
    }
}