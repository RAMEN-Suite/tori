import { computed, Injectable, signal } from '@angular/core';
import {
  displayShortcut,
  normalizeShortcutEvent,
  ShortcutNormalizationResult,
  ShortcutValidationError,
} from '../../../shortcuts/shortcut-key-normalizer';

@Injectable({
  providedIn: 'root',
})
export class ShortcutInputVm {
  private readonly keys = signal<string | null>(null);
  private readonly _recording = signal(false);
  private readonly _validationError = signal<ShortcutValidationError | null>(
    null,
  );

  public readonly recording = this._recording.asReadonly();
  public readonly validationError = this._validationError.asReadonly();

  public readonly displayValue = computed(() => {
    if (this._recording()) {
      return '';
    }

    return displayShortcut(this.keys());
  });

  public readonly placeholder = computed(() => {
    if (this._recording()) {
      return 'Press shortcut';
    }

    if (this.keys() == null) {
      return 'No shortcut';
    }

    return '';
  });

  public syncKeys(keys: string | null): void {
    this.keys.set(keys);
  }

  public startRecording(): void {
    this._recording.set(true);
    this._validationError.set(null);
  }

  public stopRecording(): void {
    this._recording.set(false);
    this._validationError.set(null);
  }

  public clear(): void {
    this.keys.set(null);
    this._recording.set(false);
    this._validationError.set(null);
  }

  public normalizeEvent(event: KeyboardEvent): ShortcutNormalizationResult {
    const result = normalizeShortcutEvent(event);
    this._validationError.set(result.error);

    if (result.keys != null) {
      this.keys.set(result.keys);
      this._recording.set(false);
    }

    return result;
  }
}
