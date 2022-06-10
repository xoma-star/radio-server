import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {SignupUserDto} from "./dto/signup-user.dto";
import {addDoc, collection, getDocs} from "firebase/firestore";
import firestore from "../firestore";
import {createHmac} from 'node:crypto'

@Injectable()
export class UserService{
    async signup(dto: SignupUserDto): Promise<string>{
        try {
            if(dto.password.length < 1 || dto.name.length < 1 || dto.email.length < 1) throw {message: 'Поля не должны быть пустыми.'}
            const data = {
                ...dto,
                signUpDate: new Date().getTime(),
                password: createHmac('sha256', dto.password).digest('hex')
            }
            const check = await getDocs(collection(firestore, 'users'))
            check.forEach(v => {
                const a = v.data()
                if(a.name === data.name) throw {message: 'Имя уже занято другим пользователем'}
                if(a.email === data.email) throw {message: 'Почта уже используется другим пользователем'}
            })
            const docRef = await addDoc(collection(firestore, 'users'), data)
            return docRef.id
        }catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}