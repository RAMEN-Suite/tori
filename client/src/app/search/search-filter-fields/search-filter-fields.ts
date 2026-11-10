import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Select } from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { OptionsPipe, compareSelectionValues } from '../../utils/options.pipe';
import { TypeFilter } from '../type-filter/type-filter';
import { SearchState } from '../search-state';

@Component({
  selector: 'app-search-filter-fields',
  imports: [
    ReactiveFormsModule,
    Select,
    OptionsPipe,
    TypeFilter,
    TranslocoDirective,
  ],
  templateUrl: './search-filter-fields.html',
  host: { class: 'block' },
})
export class SearchFilterFields {
  protected readonly search = inject(SearchState);
  protected readonly compareSelectionValues = compareSelectionValues;
  public readonly compact = input(false);
}
