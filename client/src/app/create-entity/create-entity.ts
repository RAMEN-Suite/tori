import { Icon } from '../utils/icon';
import {
  Button,
  Join,
  JoinItem,
  Popover,
  PopoverTrigger,
} from '@sushi-kit/angular';
import { Component, computed, inject, input } from '@angular/core';
import { CreateEntityService } from './create-entity.service';

import { TranslocoDirective } from '@jsverse/transloco';
import { CreateEntityDialogService } from './create-entity-dialog.service';

@Component({
  selector: 'app-create-entity',
  imports: [
    Icon,
    Button,
    Popover,
    PopoverTrigger,
    TranslocoDirective,
    Join,
    JoinItem,
  ],
  providers: [CreateEntityService],
  templateUrl: './create-entity.html',
})
export class CreateEntity {
  public readonly compact = input(false);

  private readonly createEntityService = inject(CreateEntityService);
  private readonly createEntityDialog = inject(CreateEntityDialogService);

  private entityTypes = this.createEntityService.getEntityTypes();

  protected btnItems = computed(() => {
    return this.entityTypes().map((item) => {
      return {
        label: item,
        command: () => this.show(item),
      };
    });
  });

  private show(preselectedType?: string) {
    this.createEntityDialog.open(preselectedType);
  }

  protected clickCreateEntityBtn() {
    this.show();
  }
}
