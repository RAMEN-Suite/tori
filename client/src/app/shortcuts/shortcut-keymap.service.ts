import { effect, inject, Injectable, signal } from '@angular/core';
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
export class ShortcutKeymapService {
  private readonly store = inject(LocalStoreService);

  private readonly overrides = signal<ShortcutOverrides>({});

  private readonly storeOverridesEffectRef = effect(() => {
    const overrides = this.overrides();
    this.store.saveData('EM_SHORTCUT_STORE_KEY', overrides);
  });

  public readonly configuredShortcuts = this.overrides.asReadonly();

  public constructor() {
    const storedOverrides = this.store.getData('EM_SHORTCUT_STORE_KEY');
    if (storedOverrides) {
      this.overrides.set(storedOverrides);
    }
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
    this.overrides.update((old) => ({
      ...old,
      [slug]: shortcut?.keys ?? null,
    }));
  }

  public reset(slug: string): void {
    this.overrides.update((old) => {
      const { [slug]: _removed, ...next } = old;
      void _removed;
      return next;
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
