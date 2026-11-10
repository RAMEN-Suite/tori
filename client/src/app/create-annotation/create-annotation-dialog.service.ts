import { inject, Injectable } from '@angular/core';
import { CreateAnnotationForm } from './create-annotation-form/create-annotation-form';
import { DialogService } from '../utils/dialog/dialog.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationDialogService {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public open(entityId: string): void {
    this.dialogService.open(CreateAnnotationForm, {
      inputs: {
        entityId: entityId,
      },
      title: this.transloco.translate(
        'app.shared.createAnnotation.dialog.header',
      ),
    });
  }
}
