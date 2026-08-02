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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),

    Neo4jModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentConfig, true>) => {
        return config.getOrThrow('database', { infer: true });
      },
    }),
    GuidelinesModule,
    EntityModule,
    CollectionModule,
    SchemaModule,
    GraphModule,
    AnnotationModule,
    CamiModule,
    ProjectConfigModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
