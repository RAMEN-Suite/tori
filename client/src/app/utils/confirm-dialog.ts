import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@sushi-kit/angular';
import { Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    TranslocoDirective,
  ],
  template: `
    <ng-container *transloco="let t">
      @if (service.pending(); as confirmation) {
        <sui-dialog
          [open]="!!service.pending()"
          (closed)="service.answer(false)"
          [ariaLabel]="
            service.pending()?.header ?? t('app.shared.common.dangerZone')
          "
        >
          <header suiDialogHeader>
            <h2>{{ confirmation.header }}</h2>
          </header>
          <div suiDialogBody>{{ confirmation.message }}</div>
          <footer suiDialogFooter>
            <button
              suiButton
              variant="outlined"
              severity="secondary"
              (click)="service.answer(false)"
            >
              {{
                confirmation.rejectButtonProps?.label ??
                  t('app.shared.actions.cancel')
              }}
            </button>
            <button
              suiButton
              [severity]="
                confirmation.acceptButtonProps?.severity === 'danger'
                  ? 'error'
                  : 'primary'
              "
              (click)="service.answer(true)"
            >
              {{
                confirmation.acceptButtonProps?.label ??
                  t('app.shared.actions.yes')
              }}
            </button>
          </footer>
        </sui-dialog>
      }
    </ng-container>
  `,
})
export class ConfirmDialog {
  protected readonly service = inject(ConfirmService);
}
