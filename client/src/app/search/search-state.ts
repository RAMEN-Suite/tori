import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, FormRecord, Validators } from '@angular/forms';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CollectionName, EntitySearchQuery } from '../../interfaces';
import { CollectionService } from '../api/collection.service';
import { ConfigService } from '../config-module/config.service';
import { SearchEntityService } from '../search-entity.service';
import { QueryParamsService } from '../utils/query-params.service';

export interface CollectionSearchFilter {
  type: string;
  options: CollectionName[];
  control: FormControl<CollectionName | null>;
}

/** Provided by each search container; dialogs never share the workspace's form. */
@Injectable()
export class SearchState {
  private readonly config = inject(ConfigService).getConfig();
  private readonly collections = inject(CollectionService);
  private readonly search = inject(SearchEntityService);
  private readonly queryParams = inject(QueryParamsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly submitted = new Subject<void>();
  private readonly resetSubject = new Subject<void>();
  private syncUrl = false;
  private initialized = false;
  private readonly alive = signal(true);
  private collectionRevision = 0;

  public readonly submitted$ = this.submitted.asObservable();
  public readonly reset$ = this.resetSubject.asObservable();
  public readonly types = computed(() => this.config().entityTypes);
  public readonly collectionFilters = signal<CollectionSearchFilter[]>([]);
  public readonly attempted = signal(false);
  // External query edits invalidate the autocomplete's private editing buffer.
  public readonly queryRevision = signal(0);
  public readonly searching = this.search.getEntitiesLoading();
  public readonly form = new FormGroup({
    label: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    types: new FormControl<string[]>([], { nonNullable: true }),
    collectionFilter: new FormRecord<FormControl<CollectionName | null>>({}),
  });

  public constructor() {
    this.destroyRef.onDestroy(() => {
      this.alive.set(false);
      this.collectionRevision++;
      this.submitted.complete();
      this.resetSubject.complete();
    });
  }

  public async initialize(syncUrl = false): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    this.syncUrl = syncUrl;
    const params = syncUrl
      ? await this.queryParams.readDecodedQueryParams()
      : {};
    if (!this.alive()) return;
    const config = this.config();
    const chain = config.selectedCollectionChain.filter((type) =>
      config.filterableCollections.includes(type),
    );
    this.collectionFilters.set(
      chain.map((type) => {
        const control = new FormControl<CollectionName | null>({
          value: null,
          disabled: true,
        });
        this.form.controls.collectionFilter.addControl(type, control);
        return { type, options: [], control };
      }),
    );

    if (
      typeof params['label'] === 'string' ||
      typeof params['label'] === 'number'
    ) {
      this.setQuery(String(params['label']));
    }
    this.setTypes(params['types']);
    const persisted = params['collectionFilter'];
    let parentId: string | undefined;
    for (const filter of this.collectionFilters()) {
      await this.loadCollectionOptions(
        filter.type,
        parentId,
        this.collectionRevision,
      );
      if (!this.alive()) return;
      const saved =
        persisted && typeof persisted === 'object' && filter.type in persisted
          ? (persisted as Record<string, unknown>)[filter.type]
          : undefined;
      const id =
        saved && typeof saved === 'object' && 'id' in saved
          ? saved.id
          : undefined;
      const option = this.collectionFilters()
        .find((item) => item.type === filter.type)
        ?.options.find((item) => item.id === id);
      if (!option) break;
      filter.control.setValue(option, { emitEvent: false });
      parentId = option.id;
    }
    for (const [index, filter] of this.collectionFilters().entries()) {
      filter.control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          void this.cascadeCollections(index, value);
        });
    }
    if (syncUrl && this.form.controls.label.value) await this.submit();
  }

  public setQuery(query: string): void {
    this.form.controls.label.setValue(query);
    this.attempted.set(false);
    this.queryRevision.update((revision) => revision + 1);
  }

  public setTypes(value: unknown): void {
    this.form.controls.types.setValue(
      Array.isArray(value)
        ? value.filter(
            (type): type is string =>
              typeof type === 'string' && this.types().includes(type),
          )
        : [],
    );
  }

  public hasFilters(): boolean {
    return (
      this.form.controls.types.value.length > 0 ||
      this.collectionFilters().some((filter) => Boolean(filter.control.value))
    );
  }

  public query(): EntitySearchQuery {
    const collectionFilter: Record<string, string[]> = {};
    for (const filter of this.collectionFilters()) {
      if (filter.control.enabled && filter.control.value)
        collectionFilter[filter.type] = [filter.control.value.id];
    }
    return {
      label: this.form.controls.label.value,
      types: [...this.form.controls.types.value],
      ...(Object.keys(collectionFilter).length ? { collectionFilter } : {}),
    };
  }

  public async suggest(query: string) {
    const { types, collectionFilter } = this.query();
    return this.search.getSuggestions(query, { types, collectionFilter });
  }

  public async submit(): Promise<void> {
    if (this.searching() || !this.alive()) return;
    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const query = this.query();
    const params = this.queryParams.transformQueryParams(this.form.value);
    try {
      await this.search.searchEntities(query);
    } catch {
      return; // The API layer already reports search errors.
    }
    if (!this.alive()) return;
    this.submitted.next();
    if (this.syncUrl) await this.queryParams.setQueryParams(params);
  }

  public async clearFilters(): Promise<void> {
    if (this.searching()) return;
    this.setTypes([]);
    this.clearCollections(0);
    await this.loadFirstCollection();
    await this.submit();
  }

  public async reset(): Promise<void> {
    if (this.searching()) return;
    this.setQuery('');
    this.setTypes([]);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.clearCollections(0);
    this.search.resetEntityList();
    this.resetSubject.next();
    if (this.syncUrl) await this.queryParams.setQueryParams({});
    await this.loadFirstCollection();
  }

  private clearCollections(start: number): void {
    this.collectionRevision++;
    this.collectionFilters.update((filters) =>
      filters.map((filter, index) => {
        if (index < start) return filter;
        filter.control.reset(null, { emitEvent: false });
        filter.control.disable({ emitEvent: false });
        return { ...filter, options: [] };
      }),
    );
  }

  private async cascadeCollections(
    index: number,
    value: CollectionName | null,
  ): Promise<void> {
    this.clearCollections(index + 1);
    const next = this.collectionFilters().at(index + 1);
    if (next && value)
      await this.loadCollectionOptions(
        next.type,
        value.id,
        this.collectionRevision,
      );
  }

  private async loadFirstCollection(): Promise<void> {
    const first = this.collectionFilters().at(0);
    if (first)
      await this.loadCollectionOptions(
        first.type,
        undefined,
        this.collectionRevision,
      );
  }

  private async loadCollectionOptions(
    type: string,
    parentId: string | undefined,
    revision: number,
  ): Promise<void> {
    try {
      const options = await firstValueFrom(
        this.collections.getFilterableByType(type, parentId),
      );
      if (!this.alive() || revision !== this.collectionRevision) return;
      this.collectionFilters.update((filters) =>
        filters.map((filter) => {
          if (filter.type !== type) return filter;
          if (options.length) filter.control.enable({ emitEvent: false });
          return { ...filter, options };
        }),
      );
    } catch {
      // The collection API reports errors; keep this filter disabled and retryable.
    }
  }
}
