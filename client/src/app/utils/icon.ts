import { Component, computed, input } from '@angular/core';
import {
  LucideIconData,
  LucideDynamicIcon,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUp,
  LucideTrash,
  LucidePencil,
  LucidePlus,
  LucideCirclePlus,
  LucideChevronDown,
  LucideChevronUp,
  LucideX,
  LucideCheck,
  LucideSettings,
  LucideLanguages,
  LucideClipboard,
  LucideTag,
  LucideFolder,
  LucideUndo,
  LucideInfo,
} from '@lucide/angular';

const icons: Partial<Record<string, LucideIconData>> = {
  'arrow-left': LucideArrowLeft.icon,
  'arrow-right': LucideArrowRight.icon,
  'arrow-up': LucideArrowUp.icon,
  trash: LucideTrash.icon,
  pencil: LucidePencil.icon,
  plus: LucidePlus.icon,
  'plus-circle': LucideCirclePlus.icon,
  'chevron-down': LucideChevronDown.icon,
  'chevron-up': LucideChevronUp.icon,
  times: LucideX.icon,
  check: LucideCheck.icon,
  cog: LucideSettings.icon,
  language: LucideLanguages.icon,
  clipboard: LucideClipboard.icon,
  tag: LucideTag.icon,
  folder: LucideFolder.icon,
  undo: LucideUndo.icon,
  'info-circle': LucideInfo.icon,
};
@Component({
  selector: 'app-icon',
  imports: [LucideDynamicIcon],
  template: '<svg [lucideIcon]="icon()" size="18" aria-hidden="true"></svg>',
  host: { class: 'inline-flex shrink-0 items-center' },
})
export class Icon {
  public readonly name = input<string>('info-circle');
  protected readonly icon = computed(
    () => icons[this.name()] ?? LucideInfo.icon,
  );
}
