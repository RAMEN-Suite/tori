import { Icon } from '../utils/icon';
import { Button } from '@sushi-kit/angular';
import { Component, inject, input } from '@angular/core';
import { DialogService } from '../utils/dialog/dialog.service';
import { EditEntityService } from './edit-entity.service';
import { Entity } from '../../interfaces';
import { EditEntityForm } from './edit-entity-form/edit-entity-form';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-edit-entity',
  imports: [Icon, Button],
  providers: [EditEntityService],
  templateUrl: './edit-entity.html',
})
export class EditEntity {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public entity = input<Entity>();

  private show() {
    this.dialogService.open(EditEntityForm, {
      inputs: {
        entity: this.entity(),
      },
      title: this.transloco.translate('app.shared.editEntity.dialog.header'),
    });
  }

  protected clickEditEntityBtn() {
    this.show();
  }
}
