import { OptionsPipe, compareSelectionValues } from '../utils/options.pipe';
import {
  MultiSelect,
  MultiSelectSelectedItemsTemplate,
  Select,
} from '@sushi-kit/angular';
import { Component, computed, effect, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ENTITY_LABEL_NAME } from '../../constants';
import { TranslocoDirective } from '@jsverse/transloco';
import { ShortcutConfig } from './shortcut-config/shortcut-config';
import { Icon } from '../utils/icon';
import { MultiSelectSummary } from '../utils/multi-select-summary/multi-select-summary';

@Component({
  selector: 'app-config-pane',
  imports: [
    OptionsPipe,
    ReactiveFormsModule,
    MultiSelect,
    MultiSelectSelectedItemsTemplate,
    MultiSelectSummary,
    Select,
    TranslocoDirective,
    ShortcutConfig,
    Icon,
  ],
  templateUrl: './config-pane.html',
})
export class ConfigPane {
  protected readonly compareSelectionValues = compareSelectionValues;

  private configService: ConfigService = inject(ConfigService);

  private configOptions = this.configService.getRemoteConfig();
  private config = this.configService.getConfig();
  protected readonly loaded = this.configService.getLoaded();

  protected entityTypes = computed(() => {
    return this.configOptions().entityTypes.filter(
      (type) => type !== ENTITY_LABEL_NAME,
    );
  });

  protected collectionChains = computed(() => {
    return this.configOptions().collectionChains.map((chain) => ({
      label: chain.join(' → '),
      // The single-select needs a scalar value; persisted chains remain arrays.
      value: JSON.stringify(chain),
    }));
  });

  protected selectedCollectionChain = computed(() => {
    const chain = this.config().selectedCollectionChain;
    return Array.isArray(chain) ? chain : [];
  });

  protected configForm = new FormGroup({
    filterableCollections: new FormControl<string[]>(
      { value: [], disabled: true },
      { nonNullable: true },
    ),
    selectedCollectionChain: new FormControl<string | null>(null),
    entityTypes: new FormControl<string[]>([], { nonNullable: true }),
  });

  public constructor() {
    effect(() => {
      const config = this.config();
      const loaded = this.loaded();
      const chain = this.selectedCollectionChain();

      this.configForm.patchValue(
        {
          filterableCollections: config.filterableCollections,
          selectedCollectionChain: chain.length ? JSON.stringify(chain) : null,
          entityTypes: config.entityTypes,
        },
        { emitEvent: false },
      );

      if (loaded) {
        this.configForm.enable({ emitEvent: false });
      } else {
        this.configForm.disable({ emitEvent: false });
      }

      if (loaded && chain.length > 0) {
        this.configForm.controls.filterableCollections.enable({
          emitEvent: false,
        });
      } else {
        this.configForm.controls.filterableCollections.disable({
          emitEvent: false,
        });
      }
    });

    this.configForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const value = this.configForm.getRawValue();
      const selectedCollectionChain =
        this.configOptions().collectionChains.find(
          (chain) => JSON.stringify(chain) === value.selectedCollectionChain,
        ) ?? [];
      this.configService.setConfig({
        filterableCollections: value.filterableCollections.filter((type) =>
          selectedCollectionChain.includes(type),
        ),
        selectedCollectionChain,
        entityTypes: value.entityTypes,
      });
    });
  }
}
