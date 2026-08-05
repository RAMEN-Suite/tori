import { Component, effect, inject, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { ShortcutValidationError } from '../../../shortcuts/shortcut-key-normalizer';
import { ShortcutInputVm } from './shortcut-input.vm';
import { ButtonGroup } from 'primeng/buttongroup';

@Component({
  selector: 'app-shortcut-input',
  imports: [ButtonDirective, ButtonGroup],
  providers: [ShortcutInputVm],
  templateUrl: './shortcut-input.html',
})
export class ShortcutInput {
  private readonly vm = inject(ShortcutInputVm);

  public readonly keys = input<string | null>(null);
  public readonly disabled = input(false);
  public readonly ariaLabel = input('Keyboard shortcut');

  public readonly keysChange = output<string | null>();
  public readonly recordingChange = output<boolean>();
  public readonly validationErrorChange =
    output<ShortcutValidationError | null>();

  protected readonly displayValue = this.vm.displayValue;
  protected readonly placeholder = this.vm.placeholder;
  protected readonly recording = this.vm.recording;
  protected readonly validationError = this.vm.validationError;

  public constructor() {
    effect(() => {
      this.vm.syncKeys(this.keys());
    });

    effect(() => {
      this.recordingChange.emit(this.vm.recording());
    });

    effect(() => {
      this.validationErrorChange.emit(this.vm.validationError());
    });
  }

  protected startRecording(): void {
    if (this.disabled()) {
      return;
    }

    this.vm.startRecording();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled() || !this.recording()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.code === 'Escape') {
      this.vm.stopRecording();
      this.blurCurrentTarget(event);
      return;
    }

    if (event.code === 'Backspace' || event.code === 'Delete') {
      this.vm.clear();
      this.keysChange.emit(null);
      this.blurCurrentTarget(event);
      return;
    }

    const result = this.vm.normalizeEvent(event);

    if (result.keys != null) {
      this.keysChange.emit(result.keys);
      this.blurCurrentTarget(event);
    }
  }

  protected clear(event: MouseEvent): void {
    event.stopPropagation();
    this.vm.clear();
    this.keysChange.emit(null);
  }

  private blurCurrentTarget(event: Event): void {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }
  }
}
