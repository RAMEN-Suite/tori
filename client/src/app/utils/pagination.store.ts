import { PageDto } from '../models/dtos/page.dto';
import { signal } from '@angular/core';
import { PageMetaDto } from '../models/dtos/page-meta.dto';
import { PageOptions } from '../models/dtos/page-options.dto';
import { createEmptyPageMeta } from './createEmptyPageMeta';

export class PaginationStore<T, Q extends object> {
  public readonly data = signal<T[]>([]);
  public readonly meta = signal<PageMetaDto>(createEmptyPageMeta());
  public readonly loading = signal(false);

  private lastQuery: Q | null = null;

  public constructor(
    private readonly loader: (query: Q & PageOptions) => Promise<PageDto<T>>,
  ) {}

  public async search(query: Q, pageOptions: PageOptions = {}) {
    this.lastQuery = query;
    await this.load({
      ...query,
      page: pageOptions.page ?? 1,
      take: pageOptions.take ?? 10,
    });
  }

  public async nextPage(mode: 'replace' | 'append' = 'replace') {
    const meta = this.meta();
    if (!this.lastQuery || !meta.hasNextPage) return;

    await this.load(
      {
        ...this.lastQuery,
        page: meta.page + 1,
        take: meta.take,
      },
      mode,
    );
  }

  public reset(): void {
    this.lastQuery = null;
    this.data.set([]);
    this.meta.set(createEmptyPageMeta(this.meta().take));
    this.loading.set(false);
  }

  private async load(
    query: Q & PageOptions,
    mode: 'replace' | 'append' = 'replace',
  ) {
    this.loading.set(true);
    try {
      const page = await this.loader(query);
      this.data.set(
        mode === 'append' ? [...this.data(), ...page.data] : page.data,
      );
      this.meta.set(page.meta);
    } finally {
      this.loading.set(false);
    }
  }
}
