import { Icon } from '../utils/icon';
import { Button, Popover, PopoverTrigger } from '@sushi-kit/angular';
import { Component, computed, inject } from '@angular/core';
import { CreateEntityService } from './create-entity.service';

import { TranslocoDirective } from '@jsverse/transloco';
import { CreateEntityDialogService } from './create-entity-dialog.service';

@Component({
  selector: 'app-create-entity',
  imports: [Icon, Button, Popover, PopoverTrigger, TranslocoDirective],
  providers: [CreateEntityService],
  templateUrl: './create-entity.html',
})
export class CreateEntity {
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
