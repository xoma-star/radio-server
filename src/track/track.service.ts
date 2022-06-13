import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {getDoc, doc, addDoc, collection, getDocs, query} from 'firebase/firestore'
import firestore from "../firestore";
import {CreateTrackDto} from "./dto/create-track.dto";

@Injectable()
export class TrackService{
  async create(dto: CreateTrackDto, audio: string, cover: string, uid: string): Promise<object>{
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
  async getAll(){
    try {
      const d = await getDocs(query(collection(firestore, 'tracks')))
      return d.docs.map(v => {return {...v.data(), id: v.id}})
    }catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getOne(id: string): Promise<object>{
    try{
      const docRef = await getDoc(doc(firestore, 'tracks', id))
      if(!docRef.exists()) throw {message: 'Track not found'}
      return {...docRef.data(), id: docRef.id}
    }catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND)
    }
  }
}