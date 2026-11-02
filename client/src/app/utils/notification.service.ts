import { Injectable, inject } from '@angular/core';
import { ToastService } from '@sushi-kit/angular';
import type { MessageSeverity } from '@sushi-kit/angular';

interface Notice {
  severity?: string;
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toast = inject(ToastService);
  public add(notice: Notice): void {
    this.toast.show({
      title: notice.summary,
      message: notice.detail ?? '',
      severity: (notice.severity === 'warn'
        ? 'warning'
        : (notice.severity ?? 'info')) as MessageSeverity,
      duration: notice.sticky ? 0 : (notice.life ?? 5000),
      dismissible: true,
      template: 'html',
    });
  }
}
