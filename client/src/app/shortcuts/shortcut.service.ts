import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import { ActionShortcut, RegisteredShortcut } from './shortcut.types';
import { Action } from './action.class';
import { tinykeys } from 'tinykeys';

@Injectable({
  providedIn: 'root',
})
export class ShortcutService {
  private actionBindings: WritableSignal<RegisteredShortcut[]> = signal([
    this.registerShortcut(),
  ]);
  private runningActions: WritableSignal<Set<string>> = signal(
    new Set<string>(),
  );

  private shortCutBindingEffect = effect(() => {
    const actionBindings = this.actionBindings();

    const seenSlugs = new Set<string>();
    const bindingsByKeys = new Map<string, RegisteredShortcut[]>();

    for (const binding of actionBindings) {
      const shortcut = binding.shortcut;
      if (shortcut == null || seenSlugs.has(binding.slug)) {
        continue;
      }
      seenSlugs.add(binding.slug);
      const registeredBindings = bindingsByKeys.get(shortcut.keys) ?? [];
      registeredBindings.push(binding);
      bindingsByKeys.set(shortcut.keys, registeredBindings);
    }
    const bindings = Object.fromEntries(
      Array.from(bindingsByKeys.entries()).map(([keys, keyBindings]) => [
        keys,
        (event: KeyboardEvent) => {
          if (event.repeat || this.isEditableTarget(event.target)) {
            return;
          }
          const binding = keyBindings.find(
            (candidate) => !candidate.disabled(),
          );
          if (binding == null) {
            return;
          }
          if (binding.shortcut?.preventDefault ?? false) {
            event.preventDefault();
          }
          if (this.runningActions().has(binding.slug)) {
            return;
          }
          this.runningActions.update((old) => {
            old.add(binding.slug);
            return old;
          });
          void binding.run().finally(() => {
            this.runningActions.update((old) => {
              old.delete(binding.slug);
              return old;
            });
          });
        },
      ]),
    );
    tinykeys(window, bindings);
  });

  private registerShortcut<T>(
    action: Action<T>,
    params: T,
  ): RegisteredShortcut {
    return {
      slug: action.slug(),
      shortcut: action.shortcut(params),
      disabled: () => action.disabled(params),
      run: () => action.run(params),
    };
  }

  private createAppShortcut(keys: string): ActionShortcut {
    return {
      keys,
      preventDefault: true,
    };
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
