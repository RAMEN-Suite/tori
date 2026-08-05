import {
  effect,
  EffectRef,
  inject,
  Injectable,
  OnDestroy,
  signal,
} from '@angular/core';
import { LocalStoreService } from '../utils/local-store.service';
import { ActionShortcut } from './shortcut.types';

export type ShortcutOverrides = Record<string, string | null | undefined>;

export interface ShortcutDefinition {
  slug: string;
  title: string;
  defaultShortcut: ActionShortcut | null;
}

export interface ShortcutConflict {
  slug: string;
  title: string;
  keys: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShortcutKeymapService implements OnDestroy {
  public ngOnDestroy(): void {
    this.storeOverridesEffectRef.destroy();
  }
  private readonly store = inject(LocalStoreService);

  private readonly overrides = signal<ShortcutOverrides>({});
  private readonly storeOverridesEffectRef: EffectRef;

  public readonly configuredShortcuts = this.overrides.asReadonly();

  public constructor() {
    const storedOverrides = this.store.getData('EM_SHORTCUT_STORE_KEY');
    if (storedOverrides) {
      this.overrides.set(storedOverrides);
    }

    this.storeOverridesEffectRef = effect(() => {
      const overrides = this.overrides();
      this.store.saveData('EM_SHORTCUT_STORE_KEY', overrides);
    });
  }

  public resolve(
    slug: string,
    defaultShortcut: ActionShortcut | null,
  ): ActionShortcut | null {
    const override = this.overrides()[slug];

    if (override === undefined) {
      return defaultShortcut;
    }

    if (override === null) {
      return null;
    }

    return {
      ...(defaultShortcut ?? {}),
      keys: override,
      preventDefault: defaultShortcut?.preventDefault ?? true,
    };
  }

  public setOverride(slug: string, shortcut: ActionShortcut | null): void {
    this.overrides.update((old) => {
      if (shortcut) {
        old[slug] = shortcut.keys;
      } else {
        old[slug] = shortcut;
      }
      return old;
    });
  }

  public reset(slug: string): void {
    this.overrides.update((old) => {
      old[slug] = undefined;
      return old;
    });
  }

  public resetAll(): void {
    this.overrides.set({});
  }

  public findConflict(
    slug: string,
    keys: string | null,
  ): ShortcutConflict | null {
    if (keys === null) return null;
    const entry = Object.entries(this.overrides()).find(([_, value]) => {
      return value === keys;
    });
    if (entry) {
      return {
        slug: slug,
        title: entry[0],
        keys: keys,
      };
    }
    return null;
  }
}
