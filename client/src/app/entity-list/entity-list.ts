import { Icon } from '../utils/icon';
import { Spinner, Chip, Button, Tooltip } from '@sushi-kit/angular';
import {
  booleanAttribute,
  Component,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { OldEntity } from '../../interfaces';
import { NgClass } from '@angular/common';
import { UtilsService } from '../utils/utils.service';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-entity-list',
  imports: [Icon, NgClass, Spinner, Chip, Button, Tooltip, TranslocoDirective],
  templateUrl: './entity-list.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
  `,
})
export class EntityList {
  private readonly utils = inject(UtilsService);

  public width = input<string>('100%');
  public height = input<string>('100%');

  public entities = input.required<OldEntity[]>();
  public entitiesLoading = input.required<boolean>();
  public onSelect = input.required<(entity: OldEntity) => void>();
  public enableInfiniteScroll = input(false, { transform: booleanAttribute });
  public loading = input(false, { transform: booleanAttribute });

  public atBottom = output();

  @ViewChild('list') protected listDiv!: ElementRef<HTMLDivElement>;

  protected selectEntity(entity: OldEntity) {
    this.onSelect()(entity);
  }
  protected copyToClipboard = this.utils.copyToClipboard;

  protected onScroll(event: Event) {
    if (!this.enableInfiniteScroll()) return;
    if (!this._atBottom(event)) return;

    this.atBottom.emit();
  }

  private _atBottom(event: Event) {
    const tracker = event.target as HTMLDivElement;
    const limit = tracker.scrollHeight - tracker.clientHeight;

    return (event.target as HTMLDivElement).scrollTop === limit;
  }
}
