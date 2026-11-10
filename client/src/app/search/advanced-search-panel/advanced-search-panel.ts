import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { AutoFocus, Button, Input } from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { Icon } from '../../utils/icon';
import { SearchState } from '../search-state';
import { SearchFilterFields } from '../search-filter-fields/search-filter-fields';

@Component({
  selector: 'app-advanced-search-panel',
  imports: [
    CdkTrapFocus,
    ReactiveFormsModule,
    Button,
    Input,
    Icon,
    SearchFilterFields,
    TranslocoDirective,
    AutoFocus,
  ],
  templateUrl: './advanced-search-panel.html',
  host: { class: 'block w-full' },
})
export class AdvancedSearchPanel {
  protected readonly search = inject(SearchState);
  public readonly closed = output();
  public readonly searchRequested = output();
  public readonly resetRequested = output();

  protected updateQuery(event: Event): void {
    if (event.target instanceof HTMLInputElement)
      this.search.setQuery(event.target.value);
  }

  protected onEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.isComposing) return;
    event.preventDefault();
    this.searchRequested.emit();
  }
}
