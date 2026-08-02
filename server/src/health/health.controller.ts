import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RamenModelService } from '../schema/ramen-model.service';
import { EnvironmentConfig } from '../config/config.types';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService<EnvironmentConfig, true>,
    private readonly ramenService: RamenModelService,
  ) {}

  @Get()
  getServerStatus() {
    return {
      version: this.configService.get('server.version', { infer: true }),
      ramenVersion: this.ramenService.ramenVersion,
      healthy: true,
    };
  }
}
