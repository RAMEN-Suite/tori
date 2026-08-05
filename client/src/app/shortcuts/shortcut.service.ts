import {
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActionShortcut, RegisteredShortcut } from './shortcut.types';
import { Action } from './action.class';
import { tinykeys } from 'tinykeys';
import { ShortcutKeymapService } from './shortcut-keymap.service';

interface ResolvedShortcutBinding {
  binding: RegisteredShortcut;
  shortcut: ActionShortcut;
}

@Injectable({
  providedIn: 'root',
})
export class ShortcutService {
  private readonly keymap = inject(ShortcutKeymapService);

  private actionBindings: WritableSignal<RegisteredShortcut[]> = signal([]);
  private runningActions: WritableSignal<Set<string>> = signal(
    new Set<string>(),
  );
  private nextBindingId = 0;

  private shortCutBindingEffect = effect((onCleanup) => {
    const actionBindings = this.actionBindings();

    const seenSlugs = new Set<string>();
    const bindingsByKeys = new Map<string, ResolvedShortcutBinding[]>();

    for (const binding of [...actionBindings].reverse()) {
      const defaultShortcut = binding.shortcut();
      const shortcut = this.keymap.resolve(binding.slug, defaultShortcut);

      if (shortcut == null || seenSlugs.has(binding.slug)) {
        continue;
      }
      seenSlugs.add(binding.slug);
      const registeredBindings = bindingsByKeys.get(shortcut.keys) ?? [];
      registeredBindings.push({ binding, shortcut });
      bindingsByKeys.set(shortcut.keys, registeredBindings);
    }

    if (bindingsByKeys.size === 0) {
      return;
    }

    const bindings = Object.fromEntries(
      Array.from(bindingsByKeys.entries()).map(([keys, keyBindings]) => [
        keys,
        (event: KeyboardEvent) => {
          if (event.repeat || this.isEditableTarget(event.target)) {
            return;
          }
          const activeBinding = keyBindings.find(
            (candidate) => !candidate.binding.disabled(),
          );
          if (activeBinding == null) {
            return;
          }
          const binding = activeBinding.binding;
          if (activeBinding.shortcut.preventDefault ?? false) {
            event.preventDefault();
          }
          if (this.runningActions().has(binding.slug)) {
            return;
          }
          this.runningActions.update((old) => {
            const next = new Set(old);
            next.add(binding.slug);
            return next;
          });
          void binding.run().finally(() => {
            this.runningActions.update((old) => {
              const next = new Set(old);
              next.delete(binding.slug);
              return next;
            });
          });
        },
      ]),
    );

    const unsubscribe = tinykeys(window, bindings);
    onCleanup(unsubscribe);
  });

  public register<T>(
    action: Action<T>,
    params: () => T,
    destroyRef?: DestroyRef,
  ): () => void {
    const binding: RegisteredShortcut = {
      id: this.nextBindingId++,
      slug: action.slug(),
      shortcut: () => action.shortcut(params()),
      disabled: () => action.disabled(params()),
      run: () => action.run(params()),
    };

    this.actionBindings.update((old) => [...old, binding]);

    let registered = true;
    const unregister = () => {
      if (!registered) {
        return;
      }
      registered = false;
      this.unregisterShortcut(binding.id);
    };

    destroyRef?.onDestroy(unregister);

    return unregister;
  }

  private unregisterShortcut(id: number): void {
    this.actionBindings.update((old) =>
      old.filter((binding) => binding.id !== id),
    );
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false;
    }
    return (
      target.closest("input, textarea, select, [contenteditable='true']") !=
      null
    );
  }
}
