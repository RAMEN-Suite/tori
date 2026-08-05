import { inject, Injectable } from '@angular/core';
import { Action } from './action.class';
import { ActionShortcut } from '../shortcuts/shortcut.types';
import { createAppShortcut } from '../shortcuts/createAppShortcut';
import { CreateEntityDialogService } from '../create-entity/create-entity-dialog.service';

interface CreateEntitynDialog {
  preselectedType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreateEntityAction extends Action<CreateEntitynDialog> {
  private readonly dialog = inject(CreateEntityDialogService);

  public override slug(): string {
    return 'entity.create';
  }

  public override title(): string {
    return 'app.actions.createEntity.title';
  }

  public override icon(): string | null {
    return null;
  }

  public override disabled(): boolean {
    return false;
  }

  protected override action(input: CreateEntitynDialog): Promise<void> | void {
    this.dialog.open(input.preselectedType);
  }

  public override configurableShortcut(): ActionShortcut | null {
    return createAppShortcut('$mod+Alt+KeyE');
  }
}
