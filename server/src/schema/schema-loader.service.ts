import { Injectable, Logger } from '@nestjs/common';
import { GModel } from './interfaces/g-model.interface';
import * as fs from 'node:fs';
import { ModelRegistry } from './model.registry';
import { compileSchema, JsonSchema, SchemaNode } from 'json-schema-library';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '../config/config.types';

type SchemaSourceName = 'default' | 'ramen' | 'project';

@Injectable()
export class SchemaLoaderService {
  private logger = new Logger(SchemaLoaderService.name);

  private ramenModel!: GModel;
  private profileModel!: GModel;
  private registry!: ModelRegistry;

  constructor(private readonly configService: ConfigService<EnvironmentConfig, true>) {}

  async loadSchemas() {
    const gCoreSchemaJSON: JsonSchema = await this.loadJsonFromSource<JsonSchema>('default');
    const gCoreSchema: SchemaNode = compileSchema(gCoreSchemaJSON);
    this.logger.log('Loading schemas...');

    const ramen: GModel = this.validateJSON(await this.loadJsonFromSource('ramen'), gCoreSchema);
    this.logger.log(`Loaded ramen schema "${ramen.version}" successfully`);

    const profile: GModel = this.validateJSON(await this.loadJsonFromSource('project'), gCoreSchema);
    this.logger.log(`Loaded project schema "${profile.name} ${profile.version}" successfully`);

    this.ramenModel = ramen;
    this.profileModel = profile;

    this.registry = new ModelRegistry(ramen, profile);
  }

  getRegistry(): ModelRegistry {
    return this.registry;
  }

  private validateJSON(json: unknown, schema: SchemaNode): GModel {
    const result = schema.validate(json);

    if (!result.valid) {
      for (const err of result.errors) {
        this.logger.error(`Schema error: ${err.message}`, err.data);
      }
      throw new Error('Invalid schema');
    }

    return json as GModel;
  }

  private async loadJsonFromSource<T>(envName: SchemaSourceName): Promise<T> {
    const source = this.configService.getOrThrow(`gcore.${envName}`, { infer: true });

    if (this.isHttpUrl(source)) {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${envName} from ${source}: ${response.status}`);
      }
      return (await response.json()) as T;
    }

    const content = await fs.promises.readFile(source, 'utf8');
    return JSON.parse(content) as T;
  }

  private isHttpUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
