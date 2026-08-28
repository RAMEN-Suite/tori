export class EntityViewedEvent {
  static readonly eventName = 'entity.viewed';
  constructor(
    readonly entityId: string,
    readonly actorId: string,
  ) {}
}
