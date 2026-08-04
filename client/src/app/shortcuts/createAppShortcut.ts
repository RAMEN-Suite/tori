import { ActionShortcut } from './shortcut.types';

export function createAppShortcut(keys: string): ActionShortcut {
  return {
    keys,
    preventDefault: true,
  };
}
