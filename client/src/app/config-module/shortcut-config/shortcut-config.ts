import { Component, inject } from '@angular/core';
import { ShortcutConfigVm } from './shortcut-config.vm';
import { displayShortcut } from '../../shortcuts/shortcut-key-normalizer';

@Component({
  selector: 'app-shortcut-config',
  imports: [],
  templateUrl: './shortcut-config.html',
})
export class ShortcutConfig {
  private readonly shortcutConfigVm = inject(ShortcutConfigVm);

  protected readonly rows = this.shortcutConfigVm.rows;
  protected readonly displayShortcut = displayShortcut;
}
