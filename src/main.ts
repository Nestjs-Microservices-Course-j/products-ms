import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('Main')
  
  //*configuracion para microservicio
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      //transport: Transport.TCP, //*Configuracion para comunicacion TCP
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
        //port: envs.port, //*Configuracion para comunicacion TCP
      }
    }
  );

  app.useGlobalPipes(  
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }) 
  );

  await app.listen();
  logger.log(`ProductsMicroservice running on port: ${ envs.port }`);
  
}
bootstrap();
