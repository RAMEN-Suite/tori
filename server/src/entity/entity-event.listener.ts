import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EntityUsageService } from './entity-usage.service';
import { EntityViewedEvent } from './events/entity-viewed.event';

@Injectable()
export class EntityEventListener {
  constructor(private readonly usageService: EntityUsageService) {}

  @OnEvent(EntityViewedEvent.eventName, { async: true })
  async handleEntityViewed(event: EntityViewedEvent) {
    await this.usageService.recordView(event.actorId, event.entityId);
  }
}
