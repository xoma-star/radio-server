import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from "cookie-parser";

const start = async () => {
  try {
    const PORT = 5000
    const app = await NestFactory.create(AppModule)
    const whitelist = ['http://localhost:3000', 'https://serenity.xoma-star.space', 'http://localhost:5000', 'http://192.168.1.24:3000']
    app.use(cookieParser())
    app.enableCors({credentials: true, origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }})
    await app.listen(PORT, () => console.log('started on '+PORT))
  } catch (e) {console.log(e)}
};

start()