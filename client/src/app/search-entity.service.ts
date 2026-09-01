import { inject, Injectable, Signal } from '@angular/core';
import { EntityApiService } from './api/entity-api.service';
import {
  OldEntity,
  EntityAutocompleteQuery,
  EntitySearchQuery,
} from '../interfaces';
import { PaginationStore } from './utils/pagination.store';
import { PageMetaDto } from './models/dtos/page-meta.dto';

@Injectable({
  providedIn: 'root',
})
export class SearchEntityService {
  private readonly entityApi = inject(EntityApiService);

  private readonly pagination = new PaginationStore<
    OldEntity,
    EntitySearchQuery
  >((query) => this.entityApi.searchEntities(query));

  public async getSuggestions(search: string, query: EntityAutocompleteQuery) {
    return await this.entityApi.getAutocomplete(search, query);
  }

  public getPageMeta(): Signal<PageMetaDto> {
    return this.pagination.meta.asReadonly();
  }

  public getEntitiesLoading(): Signal<boolean> {
    return this.pagination.loading.asReadonly();
  }

  public getEntities(): Signal<OldEntity[]> {
    return this.pagination.data.asReadonly();
  }

  public resetEntityList() {
    this.pagination.reset();
    return this;
  }

  public async searchEntities(query: EntitySearchQuery) {
    await this.pagination.search(query);
    return this;
  }

  public async nextPage(mode: 'replace' | 'append' = 'replace') {
    await this.pagination.nextPage(mode);
    return this;
  }
}
