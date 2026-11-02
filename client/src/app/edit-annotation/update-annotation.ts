import { Icon } from '../utils/icon';
import { Button } from '@sushi-kit/angular';
import { Component, inject, input } from '@angular/core';
import { DialogService } from '../utils/dialog/dialog.service';
import { UpdateAnnotationService } from './update-annotation.service';
import { UpdateAnnotationForm } from './update-annotation-form/update-annotation-form';
import { Annotation } from '../../interfaces';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-update-annotation',
  providers: [UpdateAnnotationService],
  imports: [Icon, Button],
  templateUrl: './update-annotation.html',
})
export class UpdateAnnotation {
  private readonly dialogService = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  public annotation = input.required<Annotation>();
  public label = input<string>();
  public icon = input<string>('pencil');

  protected clickUpdateBtn() {
    this.dialogService.open(UpdateAnnotationForm, {
      inputs: {
        annotation: this.annotation(),
      },
      title: this.transloco.translate(
        'app.shared.updateAnnotation.dialog.header',
      ),
    });
  }
}
