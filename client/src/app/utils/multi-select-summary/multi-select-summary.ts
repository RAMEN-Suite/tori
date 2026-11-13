import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

/** Fits complete selected labels and the remaining count into a Sushi control. */
@Component({
  selector: 'app-multi-select-summary',
  templateUrl: './multi-select-summary.html',
  host: { class: 'relative block w-full min-w-0' },
})
export class MultiSelectSummary {
  public readonly options = input.required<readonly { label: string }[]>();
  public readonly placeholder = input('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly measurements =
    viewChild.required<ElementRef<HTMLElement>>('measurements');
  private readonly candidateElements =
    viewChildren<ElementRef<HTMLElement>>('candidate');
  private readonly visibleCount = signal(0);

  protected readonly fullText = computed(() =>
    this.options()
      .map((option) => option.label)
      .join(', '),
  );

  protected readonly candidates = computed(() => {
    const labels = this.options().map((option) => option.label);
    return Array.from({ length: labels.length + 1 }, (_, count) => {
      const text = labels.slice(0, count).join(', ');
      const remaining = labels.length - count;
      return remaining ? `${text}${text ? ' ' : ''}+${remaining}` : text;
    });
  });

  protected readonly displayValue = computed(() =>
    this.options().length
      ? (this.candidates().at(
          Math.min(this.visibleCount(), this.options().length),
        ) ?? '')
      : this.placeholder(),
  );

  public constructor() {
    afterRenderEffect({
      read: () => this.measure(),
    });

    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(this.host.nativeElement);
      // Also remeasure when font metrics or the selected labels change.
      observer.observe(this.measurements().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private measure(): void {
    const candidates = this.candidates();
    const elements = this.candidateElements();
    const width = this.host.nativeElement.getBoundingClientRect().width;
    let count = 0;

    // Check every prefix: the last label may fit once the +N suffix disappears.
    for (let index = 0; index < candidates.length; index++) {
      const element = elements.at(index);
      if (
        element &&
        element.nativeElement.getBoundingClientRect().width <= width
      ) {
        count = index;
      }
    }
    this.visibleCount.set(count);
  }
}
