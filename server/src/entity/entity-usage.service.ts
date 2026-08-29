import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EntityViewEntity } from './entity-view.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users.orm-entity';
import { PageOptionsDto } from '../dto/page-options.dto';

@Injectable()
export class EntityUsageService {
  constructor(
    @InjectRepository(EntityViewEntity)
    private entityViewRepository: Repository<EntityViewEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  public async recordView(actorId: string, entityId: string) {
    let entityView: EntityViewEntity | null = await this.entityViewRepository.findOneBy({
      actor: { id: actorId },
      entityId: entityId,
    });

    const user = await this.userRepository.findOneBy({ id: actorId });
    if (!user) {
      throw new Error('User does not exist');
    }
    entityView ??= this.entityViewRepository.create({ actor: { id: actorId }, entityId: entityId, count: 0 });

    entityView.count++;
    await this.entityViewRepository.save(entityView);
  }

  public async findMostViewedEntityIds(actorId: string, pageOptionsDto: PageOptionsDto) {
    const [views, itemCount] = await this.entityViewRepository.findAndCount({
      where: { actor: { id: actorId } },
      order: {
        count: 'DESC',
        lastViewedAt: 'DESC',
      },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.take,
    });

    return {
      entityIds: views.map((view) => view.entityId),
      itemCount,
    };
  }
}
