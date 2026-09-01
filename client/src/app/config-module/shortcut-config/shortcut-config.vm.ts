import { computed, inject, Injectable, Injector } from '@angular/core';
import { CONFIGURABLE_SHORTCUT_ACTIONS } from '../../shortcuts/shortcut-registry';
import { ShortcutKeymapService } from '../../shortcuts/shortcut-keymap.service';
import { ActionShortcut } from '../../shortcuts/shortcut.types';
import { createAppShortcut } from '../../shortcuts/createAppShortcut';

@Injectable({
  providedIn: 'root',
})
export class ShortcutConfigVm {
  private readonly injector = inject(Injector);
  private readonly keymap = inject(ShortcutKeymapService);

  private readonly actions = CONFIGURABLE_SHORTCUT_ACTIONS.map((actionType) =>
    this.injector.get(actionType),
  );

  public readonly rows = computed<
    {
      slug: string;
      title: string;
      defaultShortcut: ActionShortcut | null;
      effectiveShortcut: ActionShortcut | null;
    }[]
  >(() => {
    return this.actions.map((action) => ({
      slug: action.slug(),
      title: action.title({}),
      defaultShortcut: action.shortcut({}),
      effectiveShortcut: this.keymap.resolve(
        action.slug(),
        action.shortcut({}),
      ),
    }));
  });

  public setShortcut(slug: string, keys: string | null) {
    const shortcut = keys ? createAppShortcut(keys) : null;
    this.keymap.setOverride(slug, shortcut);
  }

  public resetShortcut(slug: string) {
    this.keymap.reset(slug);
  }
  // clearShortcut(slug);
  // conflictFor(slug);
}
