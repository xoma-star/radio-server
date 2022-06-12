import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {JWT_REFRESH_SECRET} from "../../config";
import {Request} from "express";
import {Injectable} from "@nestjs/common";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                const data = req?.cookies['refreshToken']
                console.log(data)
                if(!data) return null
                return data
            }]),
            secretOrKey: JWT_REFRESH_SECRET,
            passReqToCallback: true
        })
    }

    validate(req: Request, payload: any){
        const refresh = req.cookies['refreshToken']
        console.log(payload)
        return {...payload, refreshToken: refresh}
    }
}