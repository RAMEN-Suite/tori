import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Button, Spinner } from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { EntityNames } from '../../../interfaces';
import { EntityApiService } from '../../api/entity-api.service';
import { SearchState } from '../../search/search-state';
import { SearchBar } from '../../search/search-bar/search-bar';
import { SearchResultFilters } from '../../search/search-result-filters/search-result-filters';
import { AdvancedSearchPanel } from '../../search/advanced-search-panel/advanced-search-panel';
import { WorkspaceSidebar } from '../../search/workspace-sidebar/workspace-sidebar';
import { WorkspaceEntities } from '../../search/workspace-entities/workspace-entities';
import { EntityPreview } from '../../search/entity-preview/entity-preview';
import { WorkspaceView } from '../../search/workspace-view';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Navbar } from '../../navbar/navbar';
import { SearchEntityService } from '../../search-entity.service';
import { Icon } from '../../utils/icon';

@Component({
  selector: 'app-search-page',
  imports: [
    SearchBar,
    SearchResultFilters,
    AdvancedSearchPanel,
    WorkspaceSidebar,
    WorkspaceEntities,
    EntityPreview,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    Navbar,
    Icon,
    Button,
    Spinner,
    NgTemplateOutlet,
    TranslocoDirective,
  ],
  providers: [SearchEntityService, SearchState],
  templateUrl: './search-page.component.html',
  host: { class: 'block' },
})
export class SearchPage implements OnInit {
  protected readonly search = inject(SearchState);
  private readonly router = inject(Router);
  protected readonly filtersOpen = signal(false);
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
  protected readonly recent = rxResource({
    stream: () => this.api.getWorkspaceEntities('recently-updated'),
  });
  protected readonly frequent = rxResource({
    stream: () => this.api.getWorkspaceEntities('suggested'),
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
  public constructor() {
    this.search.submitted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onSearch());
    this.search.reset$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onReset());
  }

  public ngOnInit(): void {
    void this.search.initialize(true);
  }

  protected async submitSearch(): Promise<void> {
    if (this.search.form.valid) this.filtersOpen.set(false);
    await this.search.submit();
  }

  protected async resetSearch(): Promise<void> {
    this.filtersOpen.set(false);
    await this.search.reset();
  }

  protected openEntity(entity: EntityNames): void {
    void this.router.navigate(['/entity', entity.id]);
  }

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

  protected async nextPage(): Promise<void> {
    if (this.loading()) return;
    try {
      await this.searchService.nextPage('append');
    } catch {
      // The API service already reports the error.
    }
  }
}
