import { inject, Injectable } from '@angular/core';
import { Action } from './action.class';
import { ActionShortcut } from '../shortcuts/shortcut.types';
import { createAppShortcut } from '../shortcuts/createAppShortcut';
import { CreateAnnotationDialogService } from '../create-annotation/create-annotation-dialog.service';
import { TranslocoService } from '@jsverse/transloco';

interface CreateAnnotationDialog {
  entityId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationAction extends Action<CreateAnnotationDialog> {
  private readonly dialog = inject(CreateAnnotationDialogService);
  private readonly translocoService = inject(TranslocoService);

  public override slug(): string {
    return 'annotation.create';
  }

  public override title(): string {
    return this.translocoService.translate(
      'app.actions.createAnnotation.title',
    );
  }

  public override icon(): string | null {
    return null;
  }

  public override disabled(input: CreateAnnotationDialog): boolean {
    return !input.entityId;
  }

  protected override action(
    input: CreateAnnotationDialog,
  ): Promise<void> | void {
    this.dialog.open(input.entityId);
  }

  public override configurableShortcut(): ActionShortcut | null {
    return createAppShortcut('$mod+Alt+KeyA');
  }
}
