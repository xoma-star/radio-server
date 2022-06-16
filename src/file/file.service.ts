import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as path from 'path'
import * as fs from 'fs'
import * as uuid from 'uuid'
import * as obama from "child_process";
import * as util from "util"
const exec = util.promisify(obama.exec)

export enum FileType{
  AUDIO = 'audio',
  COVER = 'cover'
}

@Injectable()
export class FileService{
  async createFile(type: FileType, file): Promise<string>{
    try {
      const fileExtension = type === FileType.AUDIO ? file.originalname.split('.').pop() : 'jpg'
      const fileName = uuid.v4()
      const fileNameFull = fileName + '.' + fileExtension
      const filePath = path.resolve('/media/uploads/', type)
      if(!fs.existsSync(filePath)) fs.mkdirSync(filePath, {recursive: true})
      if(type === FileType.COVER){
        const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches.length !== 3) throw {message: 'Not valid cover'}
        const buff = Buffer.from(matches[2], 'base64')
        fs.writeFileSync(path.resolve(filePath, fileNameFull), buff)
      }
      else {
        if(fileExtension !== 'm4a') throw {message: 'Файл поврежден или имеент неподдерживаемое расширение'}
        fs.writeFileSync(path.resolve(filePath, fileNameFull), file.buffer)
        const {stderr} = await exec(`ffmpeg -i "${path.resolve(filePath, fileNameFull)}" -c:a libmp3lame -q:a 4 "${path.resolve(filePath, `${fileName}.mp3`)}"`)
        if(stderr.indexOf('error') >= 0) throw {message: stderr}
        await exec(`rm ${path.resolve(filePath, fileNameFull)}`)
        return type + '/' + fileName + '.mp3'
      }
      return type + '/' + fileNameFull
    }catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}