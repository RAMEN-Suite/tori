import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './users.orm-entity';

@Entity('entity_views')
@Index(['actor.id', 'entityId'], { unique: true })
export class EntityViewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.entity_views)
  actor!: UserEntity;

  @Column()
  entityId!: string;

  @Column({ default: 0 })
  count!: number;

  @UpdateDateColumn()
  lastViewedAt!: Date;
}
