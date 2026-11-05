import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { OptionsPipe, compareSelectionValues } from '../utils/options.pipe';
import { Icon } from '../utils/icon';
import {
  Autocomplete,
  AutocompleteItemTemplate,
  AutocompletePrefixTemplate,
  Button,
  Input,
  MultiSelect,
  Select,
} from '@sushi-kit/angular';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { SearchEntityService } from '../search-entity.service';
import {
  CollectionName,
  EntityAutocompleteQuery,
  EntityNames,
  EntitySearchQuery,
} from '../../interfaces';
import { CollectionService } from '../api/collection.service';
import { distinctUntilChanged, firstValueFrom, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TypeFilter } from './type-filter/type-filter';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QueryParamsService } from '../utils/query-params.service';
import { ConfigService } from '../config-module/config.service';
import { TranslocoDirective } from '@jsverse/transloco';

interface CFOption {
  type: string;
  values: CollectionName[];
}

@Component({
  selector: 'app-filter-pane',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    CdkTrapFocus,
    OptionsPipe,
    Icon,
    ReactiveFormsModule,
    Autocomplete,
    AutocompleteItemTemplate,
    AutocompletePrefixTemplate,
    NgTemplateOutlet,
    Button,
    Input,
    MultiSelect,
    FormsModule,
    Select,
    TypeFilter,
    RouterLink,
    TranslocoDirective,
  ],
  templateUrl: './filter-pane.html',
})
export class FilterPane {
  protected readonly compareSelectionValues = compareSelectionValues;

  private destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly autocomplete = viewChild(Autocomplete);

  private readonly searchService = inject(SearchEntityService);
  private readonly collectionService = inject(CollectionService);
  private readonly configService = inject(ConfigService);
  private queryParamService = inject(QueryParamsService);

  public openLinkInNewTab = input<boolean>(false);
  public enableLinkToEntity = input<boolean>(true);
  public setQueryParams = input<boolean>(false);

  public readonly workspace = input(false);
  public readonly searchSubmitted = output();
  public readonly searchReset = output();
  public readonly resultFilters =
    viewChild<TemplateRef<unknown>>('resultFilters');
  protected readonly searchAttempted = signal(false);
  protected readonly filtersOpen = signal(false);

  protected remoteConfig = this.configService.getRemoteConfig();
  protected config = this.configService.getConfig();

  /** gesamte Kette aus Guidelines (vom spezifischsten → generischsten) */
  private collectionChain: string[] = [];
  /** nur filterbare Typen, in UI-Reihenfolge (generisch → spezifisch) */
  private activeChain: string[] = [];

  protected form = new FormGroup<{
    label: FormControl<string>;
    collectionFilter: FormGroup<
      Record<string, FormControl<CollectionName | null>>
    >;
    types: FormControl<string[]>;
  }>({
    label: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    collectionFilter: new FormGroup<
      Record<string, FormControl<CollectionName | null>>
    >({}),
    types: new FormControl<string[]>([], { nonNullable: true }),
  });

  protected collectionFilterOptions = signal<CFOption[]>([]);
  protected readonly searching = this.searchService.getEntitiesLoading();
  protected suggestions = signal<EntityNames[]>([]);
  protected readonly suggestionOptions = computed(() =>
    this.suggestions().map((entity) => ({
      label: entity.label,
      value: entity,
      id: entity.id,
    })),
  );
  protected showEmptyMessage = signal<boolean>(false);

  public constructor() {
    // Capture Enter before the combobox selects its active suggestion.
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
      void this.onSubmit();
    };
    this.host.nativeElement.addEventListener('keydown', onKeydown, {
      capture: true,
    });
    this.destroyRef.onDestroy(() => {
      this.host.nativeElement.removeEventListener('keydown', onKeydown, {
        capture: true,
      });
    });

    effect(() => {
      const opts = this.collectionFilterOptions();
      opts.forEach((opt) => {
        if (opt.values.length > 0) {
          this.form.controls.collectionFilter
            .get(opt.type)
            ?.enable({ emitEvent: false });
        }
      });
    });
    effect(() => {
      void this.initializeCollectionFilters();
    });
  }

  private async initializeCollectionFilters(): Promise<void> {
    this.collectionChain = this.config().selectedCollectionChain;

    // Nur die filterbaren Typen zeigen
    const filterable: string[] = this.config().filterableCollections;
    this.activeChain = this.collectionChain.filter((t) =>
      filterable.includes(t),
    );

    // 1) Controls & Options nur für activeChain anlegen
    const optionsInit: CFOption[] = [];
    for (const type of this.activeChain) {
      this.form.controls.collectionFilter.addControl(
        type,
        new FormControl<CollectionName | null>({
          value: null,
          disabled: true,
        }),
      );
      optionsInit.push({ type, values: [] });
    }
    this.collectionFilterOptions.set(optionsInit);

    // 2) Erstes (generischstes) Select befüllen & enablen
    if (this.activeChain.length > 0) {
      await this.loadAndSetOptionsAt(0 /* generischstes Level */);
      this.enableAt(0, true);
    }

    // 3) Änderungen kaskadieren – nur für vorhandene Controls
    this.activeChain.forEach((type, idx) => {
      const ctrl = this.form.controls.collectionFilter.get(type);
      if (!ctrl) return;
      ctrl.valueChanges
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          map((v: CollectionName | null) => v?.id ?? null), // nur id betrachten
          distinctUntilChanged(),
          switchMap(async (idOrNull) => {
            const value = idOrNull
              ? (this.form.controls.collectionFilter.get(type)
                  ?.value as CollectionName)
              : null;

            await this.onLevelChanged(idx, value);
          }),
        )
        .subscribe();
    });

    // Fill form
    const queryParamValues: Record<string, never> =
      await this.queryParamService.readDecodedQueryParams();
    this.fillForm(this.form, queryParamValues);
    if (Object.keys(queryParamValues).length > 0) {
      await this.onSubmit();
    }
  }

  protected suggestionId(value: unknown): string | undefined {
    return this.isEntityName(value) && 'id' in value ? value.id : undefined;
  }

  protected onSuggestionValue(value: unknown): void {
    if (!this.isEntityName(value)) return;
    queueMicrotask(() => {
      this.form.controls.label.setValue(value.label);
      if (this.workspace()) {
        void this.router.navigate(['/entity', value.id]);
      } else {
        void this.onSubmit();
      }
    });
  }

  private suggestionRequest = 0;

  protected async autocompleteChanges(queryText: string) {
    const request = ++this.suggestionRequest;
    if (queryText.trim().length >= 3) {
      const types = this.form.controls.types.value;
      const collectionFilter = this.form.controls.collectionFilter.value;
      const formatted: Record<string, string[]> = {};

      for (const key of Object.keys(collectionFilter)) {
        const id = collectionFilter[key]?.id;
        if (id) formatted[key] = [id];
      }

      const query: EntityAutocompleteQuery = { types: types };

      if (Object.keys(formatted).length > 0) {
        query.collectionFilter = formatted;
      }
      const suggestions = await this.searchService.getSuggestions(
        queryText,
        query,
      );
      if (
        request !== this.suggestionRequest ||
        this.form.controls.label.value !== queryText
      )
        return;
      this.suggestions.set(suggestions);
    } else {
      this.suggestions.set([]);
    }
    this.showEmptyMessage.set(this.calcShowEmptyMessage());
  }

  protected hasResultFilters(): boolean {
    return (
      this.form.controls.types.value.length > 0 ||
      Object.values(this.form.controls.collectionFilter.value).some(Boolean)
    );
  }

  protected async updateResultTypes(value: unknown): Promise<void> {
    if (!Array.isArray(value)) return;
    const types = value.filter(
      (type): type is string =>
        typeof type === 'string' && this.config().entityTypes.includes(type),
    );
    this.form.controls.types.setValue(types);
    await this.onSubmit();
  }

  protected async updateResultCollection(
    type: string,
    value: unknown,
  ): Promise<void> {
    const selectedOption = this.collectionFilterOptions()
      .find((filter) => filter.type === type)
      ?.values.find((option) => this.compareSelectionValues(option, value));
    this.form.controls.collectionFilter
      .get(type)
      ?.setValue(selectedOption ?? null);
    await this.onSubmit();
  }

  protected async clearResultFilters(): Promise<void> {
    this.form.controls.types.setValue([]);
    this.form.controls.collectionFilter.reset();
    await this.onSubmit();
  }

  protected toggleFilters(): void {
    this.autocomplete()?.hide();
    this.filtersOpen.update((open) => !open);
  }

  protected updateAdvancedQuery(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const query = event.target.value;
    // Clear the autocomplete's internal edit buffer before updating its value.
    this.autocomplete()?.reset();
    this.form.controls.label.setValue(query);
    this.searchAttempted.set(false);
  }

  protected submitFilters(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.isComposing) return;
    event.preventDefault();
    void this.onSubmit();
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected async onSubmit() {
    if (this.searching()) return;
    this.autocomplete()?.hide();
    this.searchAttempted.set(true);
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((ctrl) => ctrl.markAsTouched());
      return;
    }

    this.closeFilters();
    const label = this.form.controls.label.value;
    const types = this.form.controls.types.value;
    const collectionFilter = this.form.controls.collectionFilter.value;
    const formatted: Record<string, string[]> = {};

    for (const key of Object.keys(collectionFilter)) {
      const id = collectionFilter[key]?.id;
      if (id) formatted[key] = [id];
    }

    const query: EntitySearchQuery = { label: label, types: types };

    if (Object.keys(formatted).length > 0) {
      query.collectionFilter = formatted;
    }

    try {
      await this.searchService.searchEntities(query);
    } catch {
      return; // The API service already reports the error.
    }
    this.searchSubmitted.emit();
    if (this.setQueryParams()) {
      const queryParams = this.queryParamService.transformQueryParams(
        this.form.value,
      );
      await this.queryParamService.setQueryParams(queryParams);
    }
  }

  private calcShowEmptyMessage() {
    return this.form.controls.label.valid && this.suggestions().length === 0;
  }

  /** Änderung an Ebene `idx` in der activeChain */
  private async onLevelChanged(idx: number, value: CollectionName | null) {
    if (value) {
      // Elternwert gesetzt → alle tieferen Ebenen leeren
      this.clearFromIndex(idx + 1);
      // Nächstes (filterbares) Level befüllen & enablen
      if (idx + 1 < this.activeChain.length) {
        await this.loadAndSetOptionsAt(idx + 1, value.id);
        this.enableAt(idx + 1, true);
      }
    } else {
      // Wert entfernt → alles darunter leeren & disablen
      this.clearFromIndex(idx + 1);
    }
  }

  /** Options für Ebene `idx` laden (optional mit parentId) und ins Signal schreiben */
  private async loadAndSetOptionsAt(idx: number, parentId?: string) {
    const type = this.activeChain[idx];
    if (!type) return;
    const values = await firstValueFrom(
      this.collectionService.getFilterableByType(type, parentId),
    );
    this.setOptions(idx, values);
  }

  /** Options an Position idx ersetzen (immutabel) */
  private setOptions(idx: number, values: CollectionName[]) {
    const curr = this.collectionFilterOptions();
    const next = curr.map((o, i) => (i === idx ? { ...o, values } : o));
    this.collectionFilterOptions.set(next);
  }

  /** Ab startIdx: value=null, disable, options leeren */
  private clearFromIndex(startIdx: number) {
    const cfGroup = this.form.controls.collectionFilter;

    // Options leeren
    const nextOptions = this.collectionFilterOptions().map((o, i) =>
      i >= startIdx ? { ...o, values: [] } : o,
    );
    this.collectionFilterOptions.set(nextOptions);

    // Controls zurücksetzen & disablen
    for (let i = startIdx; i < this.activeChain.length; i++) {
      const type = this.activeChain[i];
      const ctrl = cfGroup.get(type);
      if (!ctrl) continue;
      ctrl.setValue(null, { emitEvent: false });
      ctrl.disable({ emitEvent: false });
    }
  }

  /** Enable/Disable Control an Index */
  private enableAt(idx: number, enable: boolean) {
    const type = this.activeChain[idx];
    if (!type) return;
    const ctrl = this.form.controls.collectionFilter.get(type);
    if (!ctrl) return;

    if (enable) {
      ctrl.enable({ emitEvent: false });
    } else {
      ctrl.disable({ emitEvent: false });
    }
  }

  private fillForm(form: FormGroup, values: Record<string, never>) {
    for (const key of Object.keys(form.controls)) {
      if (form.controls[key] instanceof FormGroup) {
        this.fillForm(form.controls[key], values[key]);
        continue;
      }

      let val: unknown;
      try {
        val = values[key];
      } catch {
        val = undefined;
      }

      if (val) {
        form.controls[key].setValue(val);
      }
    }

    return form;
  }

  private resetForm(): void {
    this.form.reset();
  }

  private isEntityName(value: unknown): value is EntityNames {
    return (
      typeof value === 'object' &&
      value !== null &&
      'label' in value &&
      typeof value.label === 'string'
    );
  }

  public async resetFilterClicked(): Promise<void> {
    if (this.searchService.getEntitiesLoading()()) return;
    this.autocomplete()?.reset();
    this.searchAttempted.set(false);
    this.closeFilters();
    this.resetForm();
    this.searchService.resetEntityList();
    if (this.setQueryParams()) await this.queryParamService.setQueryParams({});
    this.searchReset.emit();
  }
}
