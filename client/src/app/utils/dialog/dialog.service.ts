import { inject, Service } from '@angular/core';
import { Dialog as CdkDialog } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { Dialog } from './dialog';

interface Config<I extends Record<string, unknown>> {
  title: string;
  inputs?: I;
}

@Service()
export class DialogService {
  private readonly dialogService: CdkDialog = inject(CdkDialog);

  public open<C, I extends Record<string, unknown>>(
    component: ComponentType<C>,
    config: Config<I>,
  ) {
    return this.dialogService.open(Dialog, {
      ariaLabel: config.title,
      data: {
        title: config.title,
        component: component,
        inputs: config.inputs,
      },
      panelClass: 'sui-dynamic-dialog',
      backdropClass: 'sui-dialog-backdrop',
    });
  }
}
