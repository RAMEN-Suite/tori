export type ShortcutPlatform = 'mac' | 'windows' | 'linux' | 'unknown';

export type ShortcutValidationError =
  | 'empty'
  | 'modifier-only'
  | 'unsupported-key';

export interface ShortcutNormalizeOptions {
  useModAlias?: boolean;
  platform?: ShortcutPlatform;
  requireNonModifierKey?: boolean;
}

export interface ShortcutNormalizationResult {
  keys: string | null;
  error: ShortcutValidationError | null;
}

export interface ShortcutDisplayOptions {
  platform?: ShortcutPlatform;
  separator?: string;
}

export interface ShortcutValidationResult {
  valid: boolean;
  error: ShortcutValidationError | null;
}

const MODIFIER_CODES = new Set([
  'AltLeft',
  'AltRight',
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
  'ShiftLeft',
  'ShiftRight',
]);

const DISPLAY_LABELS = new Map<string, string>([
  ['$mod', 'Ctrl'],
  ['Alt', 'Alt'],
  ['Control', 'Ctrl'],
  ['Meta', 'Meta'],
  ['Shift', 'Shift'],
  ['ArrowDown', 'Arrow Down'],
  ['ArrowLeft', 'Arrow Left'],
  ['ArrowRight', 'Arrow Right'],
  ['ArrowUp', 'Arrow Up'],
  ['Backspace', 'Backspace'],
  ['Delete', 'Delete'],
  ['Enter', 'Enter'],
  ['Escape', 'Esc'],
  ['Space', 'Space'],
  ['Tab', 'Tab'],
]);

const SUPPORTED_KEY_PREFIXES = ['Key', 'Digit', 'Numpad', 'Arrow', 'F'];

export function normalizeShortcutEvent(
  event: KeyboardEvent,
  options: ShortcutNormalizeOptions = {},
): ShortcutNormalizationResult {
  const requireNonModifierKey = options.requireNonModifierKey ?? true;
  const keyCode = normalizeKeyCode(event.code);

  if (keyCode == null) {
    return { keys: null, error: 'unsupported-key' };
  }

  const parts = collectModifierParts(event, options);

  if (!MODIFIER_CODES.has(event.code)) {
    parts.push(keyCode);
  }

  if (parts.length === 0) {
    return { keys: null, error: 'empty' };
  }

  if (requireNonModifierKey && parts.every(isModifierPart)) {
    return { keys: null, error: 'modifier-only' };
  }

  return {
    keys: parts.join('+'),
    error: null,
  };
}

export function displayShortcut(
  keys: string | null | undefined,
  options: ShortcutDisplayOptions = {},
): string {
  if (!keys) {
    return '';
  }

  const platform = options.platform ?? detectPlatform();
  const separator = options.separator ?? ' + ';

  return keys
    .split('+')
    .filter((part) => part.length > 0)
    .map((part) => displayShortcutPart(part, platform))
    .join(separator);
}

export function validateShortcutKeys(
  keys: string | null | undefined,
): ShortcutValidationResult {
  if (!keys) {
    return { valid: false, error: 'empty' };
  }

  const parts = keys.split('+').filter((part) => part.length > 0);

  if (parts.length === 0) {
    return { valid: false, error: 'empty' };
  }

  if (parts.every(isModifierPart)) {
    return { valid: false, error: 'modifier-only' };
  }

  const keyPart = parts.find((part) => !isModifierPart(part));

  if (keyPart == null || normalizeKeyCode(keyPart) == null) {
    return { valid: false, error: 'unsupported-key' };
  }

  return { valid: true, error: null };
}

export function detectPlatform(): ShortcutPlatform {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const platform = navigator.userAgent.toLowerCase();

  if (platform.includes('mac')) {
    return 'mac';
  }

  if (platform.includes('win')) {
    return 'windows';
  }

  if (platform.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

function collectModifierParts(
  event: KeyboardEvent,
  options: ShortcutNormalizeOptions,
): string[] {
  const platform = options.platform ?? detectPlatform();
  const useModAlias = options.useModAlias ?? true;
  const parts: string[] = [];
  const modPressed = platform === 'mac' ? event.metaKey : event.ctrlKey;

  if (useModAlias && modPressed) {
    parts.push('$mod');
  } else {
    if (event.ctrlKey) {
      parts.push('Control');
    }

    if (event.metaKey) {
      parts.push('Meta');
    }
  }

  if (event.altKey) {
    parts.push('Alt');
  }

  if (event.shiftKey) {
    parts.push('Shift');
  }

  return parts;
}

function normalizeKeyCode(code: string): string | null {
  if (code === ' ') {
    return 'Space';
  }

  if (DISPLAY_LABELS.has(code)) {
    return code;
  }

  if (SUPPORTED_KEY_PREFIXES.some((prefix) => code.startsWith(prefix))) {
    return code;
  }

  return null;
}

function displayShortcutPart(part: string, platform: ShortcutPlatform): string {
  if (part === '$mod') {
    return platform === 'mac' ? 'Cmd' : 'Ctrl';
  }

  if (part.startsWith('Key')) {
    return part.slice(3).toUpperCase();
  }

  if (part.startsWith('Digit')) {
    return part.slice(5);
  }

  if (part.startsWith('Numpad')) {
    return `Numpad ${part.slice(6)}`;
  }

  return DISPLAY_LABELS.get(part) ?? part;
}

function isModifierPart(part: string): boolean {
  return (
    part === '$mod' ||
    part === 'Alt' ||
    part === 'Control' ||
    part === 'Meta' ||
    part === 'Shift'
  );
}
