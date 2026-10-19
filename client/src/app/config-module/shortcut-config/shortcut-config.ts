import { Component, inject } from '@angular/core';
import { ShortcutConfigVm } from './shortcut-config.vm';
import { ShortcutInput } from './shortcut-input/shortcut-input';
import { ButtonDirective } from 'primeng/button';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-shortcut-config',
  imports: [ShortcutInput, ButtonDirective, TranslocoDirective],
  templateUrl: './shortcut-config.html',
})
export class ShortcutConfig {
  private readonly shortcutConfigVm = inject(ShortcutConfigVm);
  protected readonly rows = this.shortcutConfigVm.rows;

  protected setShortcut(slug: string, keys: string | null) {
    this.shortcutConfigVm.setShortcut(slug, keys);
  }

  protected resetShortcut(slug: string): void {
    this.shortcutConfigVm.resetShortcut(slug);
  }
}
