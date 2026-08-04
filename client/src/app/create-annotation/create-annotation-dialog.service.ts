import { inject, Injectable } from '@angular/core';
import { CreateAnnotationForm } from './create-annotation-form/create-annotation-form';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationDialogService {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public open(entityId: string): void {
    this.dialogService.open(CreateAnnotationForm, {
      inputValues: {
        entityId: entityId,
      },
      header: this.transloco.translate(
        'app.shared.createAnnotation.dialog.header',
      ),
      styleClass: 'w-11 md:w-9 lg:w-8',
      style: {
        'min-height': '20vh',
      },
      contentStyle: {
        'padding-top': '0.5rem',
      },
      closable: true,
    });
  }
}
