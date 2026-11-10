import { Pipe, PipeTransform } from '@angular/core';
import type { SelectionOption, SelectionValue } from '@sushi-kit/angular';

/** Converts application values to Sushi options without changing the stored values. */
@Pipe({ name: 'options' })
export class OptionsPipe implements PipeTransform {
  public transform(
    values: readonly unknown[] | null | undefined,
  ): SelectionOption[] {
    return (values ?? []).map((value) => {
      if (
        value &&
        typeof value === 'object' &&
        'label' in value &&
        'value' in value
      ) {
        return value as SelectionOption;
      }
      const label = Array.isArray(value)
        ? value.join(' → ')
        : value && typeof value === 'object' && 'label' in value
          ? String(value.label)
          : String(value);
      return { label, value: value as SelectionValue };
    });
  }
}

/** Matches persisted chains and collection filters to freshly loaded options. */
export function compareSelectionValues(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value: unknown, index: number) => value === right[index])
    );
  }
  if (
    left &&
    right &&
    typeof left === 'object' &&
    typeof right === 'object' &&
    'id' in left &&
    'id' in right
  ) {
    return left.id === right.id;
  }
  return left === right;
}
