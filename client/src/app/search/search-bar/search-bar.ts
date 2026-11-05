import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Autocomplete,
  AutocompleteItemTemplate,
  AutocompletePrefixTemplate,
  Button,
} from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { EntityNames } from '../../../interfaces';
import { Icon } from '../../utils/icon';
import { SearchState } from '../search-state';

@Component({
  selector: 'app-search-bar',
  imports: [
    Autocomplete,
    AutocompleteItemTemplate,
    AutocompletePrefixTemplate,
    Button,
    ReactiveFormsModule,
    Icon,
    TranslocoDirective,
  ],
  templateUrl: './search-bar.html',
  host: { class: 'block min-w-0' },
})
export class SearchBar {
  protected readonly search = inject(SearchState);
  private readonly autocomplete = viewChild(Autocomplete);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private suggestionRequest = 0;
  public readonly workspace = input(false);
  public readonly filtersOpen = input(false);
  public readonly filtersRequested = output();
  public readonly searchRequested = output();
  public readonly entitySelected = output<EntityNames>();
  protected readonly options = signal<{ label: string; value: EntityNames }[]>(
    [],
  );

  public constructor() {
    const onKeydown = (event: KeyboardEvent) => {
      if (
        !this.workspace() ||
        event.key !== 'Enter' ||
        event.isComposing ||
        !(event.target instanceof HTMLInputElement) ||
        event.target.getAttribute('role') !== 'combobox'
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.submit();
    };
    this.host.nativeElement.addEventListener('keydown', onKeydown, {
      capture: true,
    });
    this.destroyRef.onDestroy(() => {
      this.suggestionRequest++;
      this.host.nativeElement.removeEventListener('keydown', onKeydown, {
        capture: true,
      });
    });
    effect(() => {
      this.search.queryRevision();
      const autocomplete = this.autocomplete();
      untracked(() => {
        const query = this.search.form.controls.label.value;
        autocomplete?.reset();
        autocomplete?.value.set(query);
        this.search.form.controls.label.setValue(query);
        this.options.set([]);
        this.suggestionRequest++;
      });
    });
  }

  protected submit(): void {
    this.autocomplete()?.hide();
    this.suggestionRequest++;
    this.searchRequested.emit();
  }

  protected openFilters(): void {
    this.autocomplete()?.hide();
    this.suggestionRequest++;
    this.filtersRequested.emit();
  }

  protected select(value: unknown): void {
    if (
      !value ||
      typeof value !== 'object' ||
      !('id' in value) ||
      !('label' in value) ||
      typeof value.id !== 'string' ||
      typeof value.label !== 'string'
    )
      return;
    const entity = { id: value.id, label: value.label };
    queueMicrotask(() => this.entitySelected.emit(entity));
  }

  protected async suggest(query: string): Promise<void> {
    const request = ++this.suggestionRequest;
    if (query.trim().length < 3) {
      this.options.set([]);
      return;
    }
    const values = await this.search.suggest(query);
    if (
      request !== this.suggestionRequest ||
      query !== this.search.form.controls.label.value
    )
      return;
    this.options.set(values.map((value) => ({ label: value.label, value })));
  }
}
