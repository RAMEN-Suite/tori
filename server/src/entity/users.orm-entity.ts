import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { EntityViewEntity } from './entity-view.orm-entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ default: false })
  isGuest!: boolean;

  @OneToMany(() => EntityViewEntity, (entityView) => entityView.actor)
  entity_views!: EntityViewEntity[];
}
