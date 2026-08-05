import { Component, inject } from '@angular/core';
import { ShortcutConfigVm } from './shortcut-config.vm';

@Component({
  selector: 'app-shortcut-config',
  imports: [],
  templateUrl: './shortcut-config.html',
})
export class ShortcutConfig {
  private readonly shortcutConfigVm = inject(ShortcutConfigVm);

  protected readonly rows = this.shortcutConfigVm.rows;
}
