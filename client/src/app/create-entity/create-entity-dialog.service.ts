import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslocoService } from '@jsverse/transloco';
import { CreateEntityForm } from './create-entity-form/create-entity-form';

@Injectable({
  providedIn: 'root',
})
export class CreateEntityDialogService {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public open(preselectedType?: string): void {
    this.dialogService.open(CreateEntityForm, {
      inputValues: {
        preselectedType: preselectedType,
      },
      header: this.transloco.translate('app.shared.createEntity.dialog.header'),
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '20vh',
      },
      closable: true,
    });
  }
}
