import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CreateEntityService } from './create-entity.service';
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { TranslocoDirective } from '@jsverse/transloco';
import { CreateEntityDialogService } from './create-entity-dialog.service';

@Component({
  selector: 'app-create-entity',
  imports: [SplitButton, TranslocoDirective],
  providers: [CreateEntityService],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './create-entity.html',
})
export class CreateEntity {
  private readonly createEntityService = inject(CreateEntityService);
  private readonly createEntityDialog = inject(CreateEntityDialogService);

  private entityTypes = this.createEntityService.getEntityTypes();

  protected btnItems = computed<MenuItem[]>(() => {
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
