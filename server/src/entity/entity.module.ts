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

@Module({
  imports: [SchemaModule, GraphModule, AnnotationModule],
  controllers: [EntityController],
  providers: [EntityService, CollectionService, EntityEventListener, EntityUsageService, EntityEventsService],
})
export class EntityModule {}
