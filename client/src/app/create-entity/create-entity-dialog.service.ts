import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { CreateEntityForm } from './create-entity-form/create-entity-form';
import { DialogService } from '../utils/dialog/dialog.service';

@Injectable({
  providedIn: 'root',
})
export class CreateEntityDialogService {
  private readonly dialogService: DialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public open(preselectedType?: string): void {
    this.dialogService.open(CreateEntityForm, {
      inputs: {
        preselectedType: preselectedType,
      },
      title: this.transloco.translate('app.shared.createEntity.dialog.header'),
    });
  }
}
