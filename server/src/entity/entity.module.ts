import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';
import { EntityController } from './entity.controller';
import { CollectionService } from '../collection/collection.service';
import { SchemaModule } from '../schema/schema.module';
import { GraphModule } from '../graph/graph.module';
import { AnnotationModule } from '../annotation/annotation.module';
import { EntityEventListener } from './entity-event.listener';
import { EntityUsageService } from './entity-usage.service';
import { EntityEventsService } from './entity-events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users.orm-entity';
import { EntityViewEntity } from './entity-view.orm-entity';

@Module({
  imports: [SchemaModule, GraphModule, AnnotationModule, TypeOrmModule.forFeature([UserEntity, EntityViewEntity])],
  controllers: [EntityController],
  providers: [EntityService, CollectionService, EntityEventListener, EntityUsageService, EntityEventsService],
  exports: [EntityService],
})
export class EntityModule {}
