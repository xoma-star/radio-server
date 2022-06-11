import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as path from 'path'
import * as fs from 'fs'
import * as uuid from 'uuid'

export enum FileType{
  AUDIO = 'audio',
  COVER = 'cover'
}

@Injectable()
export class FileService{
  createFile(type: FileType, file): string{
    try {
      const fileExtension = type === FileType.AUDIO ? file.originalname.split('.').pop() : 'jpg'
      const fileName = uuid.v4() + '.' + fileExtension
      const filePath = path.resolve('/media/uploads/', type)
      if(!fs.existsSync(filePath)) fs.mkdirSync(filePath, {recursive: true})
      if(type === FileType.COVER){
        const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches.length !== 3) throw {message: 'Not valid cover'}
        const buff = Buffer.from(matches[2], 'base64')
        fs.writeFileSync(path.resolve(filePath, fileName), buff)
      }
      else fs.writeFileSync(path.resolve(filePath, fileName), file.buffer)
      return type + '/' + fileName
    }catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}