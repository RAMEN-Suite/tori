import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Button,
  MultiSelect,
  MultiSelectSelectedItemsTemplate,
  Select,
} from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { OptionsPipe, compareSelectionValues } from '../../utils/options.pipe';
import { Icon } from '../../utils/icon';
import { SearchState } from '../search-state';
import { MultiSelectSummary } from '../../utils/multi-select-summary/multi-select-summary';

@Component({
  selector: 'app-search-result-filters',
  imports: [
    FormsModule,
    Button,
    MultiSelect,
    MultiSelectSelectedItemsTemplate,
    MultiSelectSummary,
    Select,
    OptionsPipe,
    Icon,
    TranslocoDirective,
  ],
  templateUrl: './search-result-filters.html',
  host: { class: 'block' },
})
export class SearchResultFilters {
  protected readonly search = inject(SearchState);
  protected readonly compareSelectionValues = compareSelectionValues;

  protected async updateTypes(value: unknown): Promise<void> {
    this.search.setTypes(value);
    await this.search.submit();
  }

  protected async updateCollection(
    type: string,
    value: unknown,
  ): Promise<void> {
    const filter = this.search
      .collectionFilters()
      .find((item) => item.type === type);
    const selected = filter?.options.find((item) =>
      compareSelectionValues(item, value),
    );
    filter?.control.setValue(selected ?? null);
    await this.search.submit();
  }
}
