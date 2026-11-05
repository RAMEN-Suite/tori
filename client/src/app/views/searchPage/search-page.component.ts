import { Component, computed, inject, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button, Spinner } from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { EntityNames, OldEntity } from '../../../interfaces';
import { EntityApiService } from '../../api/entity-api.service';
import { AttributeList } from '../../annotations-list/attribute-list/attribute-list';
import { NodeTypes } from '../../annotations-list/node-types/node-types';
import { FilterPane } from '../../filter-pane/filter-pane';
import { Navbar } from '../../navbar/navbar';
import { SearchEntityService } from '../../search-entity.service';
import { Icon } from '../../utils/icon';
import { visibleProperties } from '../../utils/utils';

type WorkspaceView = 'overview' | 'recent' | 'frequent' | 'results';

@Component({
  selector: 'app-search-page',
  imports: [
    FilterPane,
    Navbar,
    Icon,
    Button,
    Spinner,
    AttributeList,
    NodeTypes,
    RouterLink,
    NgTemplateOutlet,
    TranslocoDirective,
  ],
  providers: [SearchEntityService],
  templateUrl: './search-page.component.html',
  host: { class: 'block' },
})
export class SearchPage {
  private readonly api = inject(EntityApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchEntityService);

  protected readonly hasSearched = signal(
    this.route.snapshot.queryParamMap.has('label'),
  );
  protected readonly view = signal<WorkspaceView>(
    this.hasSearched() ? 'results' : 'overview',
  );
  protected readonly sidebarCollapsed = signal(false);
  protected readonly selected = signal<EntityNames | undefined>(undefined);
  protected readonly views = [
    { id: 'overview', icon: 'house' },
    { id: 'recent', icon: 'clock' },
    { id: 'frequent', icon: 'trending' },
  ] as const;

  protected readonly recent = rxResource({
    stream: () => this.api.getWorkspaceEntities('recently-updated'),
  });
  protected readonly frequent = rxResource({
    stream: () => this.api.getWorkspaceEntities('suggested'),
  });
  protected readonly preview = resource({
    params: () => this.selected()?.id,
    loader: ({ params }) => this.api.getById(params),
  });

  protected readonly entities = this.searchService.getEntities();
  protected readonly loading = this.searchService.getEntitiesLoading();
  protected readonly meta = this.searchService.getPageMeta();
  protected readonly sections = computed(() => {
    const sections = [
      { id: 'recent', icon: 'clock', feed: this.recent, limit: 4 },
      { id: 'frequent', icon: 'trending', feed: this.frequent, limit: 6 },
    ] as const;
    const current = this.view();
    return current === 'overview'
      ? sections
      : sections.filter((section) => section.id === current);
  });
  protected readonly visibleProperties = visibleProperties;

  protected showView(view: WorkspaceView): void {
    this.view.set(view);
    this.selected.set(undefined);
  }

  protected onSearch(): void {
    this.hasSearched.set(true);
    this.showView('results');
  }

  protected onReset(): void {
    this.hasSearched.set(false);
    this.showView('overview');
  }

  protected selectEntity(entity: EntityNames): void {
    this.selected.set({ id: entity.id, label: entity.label });
  }

  protected entityType(entity: OldEntity): string {
    return (
      entity.types.find((type) => type !== 'Entity') ??
      entity.types.at(0) ??
      entity.nodeLabel
    );
  }

  protected async nextPage(): Promise<void> {
    if (this.loading()) return;
    try {
      await this.searchService.nextPage('append');
    } catch {
      // The API service already reports the error.
    }
  }
}
