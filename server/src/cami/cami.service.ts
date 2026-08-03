import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '../config/config.types';

@Injectable()
export class CamiService {
  private readonly logger = new Logger(CamiService.name);

  constructor(private readonly config: ConfigService<EnvironmentConfig, true>) {}

  public getCollectionUrl(collectionId: string) {
    return this.getCamiHost() + 'collections/' + collectionId;
  }

  public getContentUrl(contentId: string) {
    return this.getCamiHost() + 'contents/' + contentId;
  }

  public camiAvailable() {
    try {
      return this.getCamiHost() !== undefined;
    } catch {
      return false;
    }
  }

  private getCamiHost(): string {
    const camiHost = this.config.get('cami.host', { infer: true });
    if (!camiHost) {
      throw new InternalServerErrorException('There is no host for the cami application configured. Contact your administrator.');
    }
    try {
      const camiUrl = new URL(camiHost);
      if (camiUrl.protocol === 'http:' || camiUrl.protocol === 'https:') {
        return camiUrl.toString();
      }
      throw new Error();
    } catch {
      this.logger.error('The given environment variable "AWEN_CAMI_HOST” is no valid url.');
      throw new InternalServerErrorException(
        'There is no valid host for the cami application configured. Contact your administrator.',
      );
    }
  }
}
