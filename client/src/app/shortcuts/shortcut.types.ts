export interface ActionShortcut {
  keys: string;
  preventDefault?: boolean;
}

export interface RegisteredShortcut {
  id: number;
  slug: string;
  shortcut: () => ActionShortcut | null;
  disabled: () => boolean;
  run: () => Promise<void>;
}
