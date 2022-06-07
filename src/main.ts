import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const start = async () => {
  try {
    const PORT = process.env.PORT || 5000
    const app = await NestFactory.create(AppModule)
    app.enableCors({
      methods: ['GET', 'POST']
    })
    await app.listen(PORT, () => console.log('started on '+PORT))
  } catch (e) {
    console.log(e)
  }
};

start()