import { Injectable, signal } from '@angular/core';

interface Action {
  label: string;
  severity?: string;
  outlined?: boolean;
}
export interface Confirmation {
  message: string;
  header?: string;
  target?: EventTarget;
  icon?: string;
  acceptButtonProps?: Action;
  rejectButtonProps?: Action;
  accept?: () => unknown;
  reject?: () => unknown;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  public readonly pending = signal<Confirmation | null>(null);
  public confirm(confirmation: Confirmation): void {
    this.pending.set(confirmation);
  }
  public async answer(accepted: boolean): Promise<void> {
    const confirmation = this.pending();
    this.pending.set(null);
    await (accepted ? confirmation?.accept?.() : confirmation?.reject?.());
  }
}
