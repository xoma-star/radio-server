import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {doc, getDoc} from "firebase/firestore";
import firestore from "../firestore";


@Injectable()
export class UserService{
    async getPlaylists(id: string){
        try{
            const userRef = doc(firestore, 'users', id)
            const res = await getDoc(userRef)
            if(!res.exists()) throw {message: 'Пользователь не найден'}
            return res.data().playlists
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}