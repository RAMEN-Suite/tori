import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  Button,
  Menu,
  MenuItemTemplate,
  MenuStartTemplate,
  MenuTrigger,
} from '@sushi-kit/angular';
import { map } from 'rxjs';
import { Icon } from '../utils/icon';
import { CreateEntityService } from './create-entity.service';
import { CreateEntityDialogService } from './create-entity-dialog.service';

@Component({
  selector: 'app-create-entity',
  imports: [
    Icon,
    Button,
    Menu,
    MenuTrigger,
    MenuItemTemplate,
    MenuStartTemplate,
    TranslocoDirective,
  ],
  providers: [CreateEntityService],
  templateUrl: './create-entity.html',
})
export class CreateEntity {
  public readonly compact = input(false);
  private readonly createEntityService = inject(CreateEntityService);
  private readonly createEntityDialog = inject(CreateEntityDialogService);

  protected readonly showTypeMenu = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 640px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly typeItems = computed(() =>
    this.createEntityService
      .getEntityTypes()()
      .map((type) => ({ label: type, value: type })),
  );

  protected create(type?: string): void {
    this.createEntityDialog.open(type);
  }
}
