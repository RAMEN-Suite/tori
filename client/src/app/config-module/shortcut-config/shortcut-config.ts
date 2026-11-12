import { Button } from '@sushi-kit/angular';
import { Component, inject } from '@angular/core';
import { ShortcutConfigVm } from './shortcut-config.vm';
import { ShortcutInput } from './shortcut-input/shortcut-input';
import { TranslocoDirective } from '@jsverse/transloco';
import { Icon } from '../../utils/icon';

@Component({
  selector: 'app-shortcut-config',
  imports: [ShortcutInput, Button, TranslocoDirective, Icon],
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
