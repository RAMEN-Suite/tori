import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { GUEST_DEFAULT_USER } from '../constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/users.orm-entity';

@Injectable()
export class UserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.createGuestDefaultUser();
  }

  private async createGuestDefaultUser() {
    const user = this.userRepository.create({
      id: GUEST_DEFAULT_USER.ID,
    });
    await this.userRepository.save(user);
    this.logger.log(`Successfully created DEFAULT USER ${GUEST_DEFAULT_USER.ID}`);
  }
}
