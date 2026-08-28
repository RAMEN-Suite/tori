import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityViewedEvent } from './events/entity-viewed.event';

@Injectable()
export class EntityEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public entityViewed(entityId: string, actorId: string) {
    this.eventEmitter.emit(EntityViewedEvent.eventName, new EntityViewedEvent(entityId, actorId));
  }
}
