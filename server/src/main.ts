import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Neo4jExceptionFilter } from './neo4j/neo4j-exception-filter';
import { RAMENExceptionFilter } from './schema/ramen-exception-filter';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from './config/config.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<EnvironmentConfig, true>>(ConfigService);
  const { port, name } = configService.getOrThrow('server', {
    infer: true,
  });

  app.useGlobalFilters(new Neo4jExceptionFilter(), new RAMENExceptionFilter());

  app.enableCors({
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', '*'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder().setTitle(name).build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(console.error);
