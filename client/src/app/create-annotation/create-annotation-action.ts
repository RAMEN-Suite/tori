import { inject, Injectable } from '@angular/core';
import { Action } from '../shortcuts/action.class';
import { ActionShortcut } from '../shortcuts/shortcut.types';
import { createAppShortcut } from '../shortcuts/createAppShortcut';
import { CreateAnnotationDialogService } from './create-annotation-dialog.service';

interface CreateAnnotationDialog {
  entityId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationAction extends Action<CreateAnnotationDialog> {
  private readonly dialog = inject(CreateAnnotationDialogService);

  public override slug(): string {
    return 'annotation.create';
  }

  public override title(): string {
    return 'Create Annotation';
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
