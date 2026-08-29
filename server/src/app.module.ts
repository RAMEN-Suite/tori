import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { EntityModule } from './entity/entity.module';
import { CollectionModule } from './collection/collection.module';
import { SchemaModule } from './schema/schema.module';
import { GraphModule } from './graph/graph.module';
import { HealthController } from './health/health.controller';
import { AnnotationModule } from './annotation/annotation.module';
import { CamiModule } from './cami/cami.module';
import { ProjectConfigModule } from './project-config/project-config.module';
import { configuration } from './config/configuration';
import { EnvironmentConfig } from './config/config.types';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityViewEntity } from './entity/entity-view.orm-entity';
import { UserEntity } from './entity/users.orm-entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<EnvironmentConfig, true>) => ({
        ...(await config.getOrThrow('userDatabase', { infer: true })),
        entities: [EntityViewEntity, UserEntity],
      }),
    }),
    Neo4jModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentConfig, true>) => {
        return config.getOrThrow('database', { infer: true });
      },
    }),
    EventEmitterModule.forRoot(),
    GuidelinesModule,
    EntityModule,
    CollectionModule,
    SchemaModule,
    GraphModule,
    AnnotationModule,
    CamiModule,
    ProjectConfigModule,
    UserModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
