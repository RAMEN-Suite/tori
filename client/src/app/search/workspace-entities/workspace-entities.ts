import { Component, input, output } from '@angular/core';
import { OldEntity } from '../../../interfaces';
import { Icon } from '../../utils/icon';

@Component({
  selector: 'app-workspace-entities',
  imports: [Icon],
  templateUrl: './workspace-entities.html',
  host: { class: 'block min-w-0' },
})
export class WorkspaceEntities {
  public readonly entities = input.required<OldEntity[]>();
  public readonly cards = input(false);
  public readonly selectedId = input<string>();
  public readonly entitySelected = output<OldEntity>();

  protected typeOf(entity: OldEntity): string {
    return (
      entity.types.find((type) => type !== 'Entity') ??
      entity.types.at(0) ??
      entity.nodeLabel
    );
  }
}
