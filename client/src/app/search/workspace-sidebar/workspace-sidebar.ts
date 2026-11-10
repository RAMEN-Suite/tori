import { Component, computed, input, model, output } from '@angular/core';
import { Button } from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { Icon } from '../../utils/icon';
import { WorkspaceView } from '../workspace-view';

@Component({
  selector: 'app-workspace-sidebar',
  imports: [Button, Icon, TranslocoDirective],
  templateUrl: './workspace-sidebar.html',
  host: { class: 'block shrink-0 lg:sticky lg:top-24 lg:self-start' },
})
export class WorkspaceSidebar {
  public readonly active = input.required<WorkspaceView>();
  public readonly hasResults = input(false);
  public readonly collapsed = model(false);
  public readonly viewSelected = output<WorkspaceView>();
  protected readonly items = computed(() => {
    const items: { id: WorkspaceView; icon: string }[] = [
      { id: 'overview', icon: 'house' },
      { id: 'recent', icon: 'clock' },
      { id: 'frequent', icon: 'trending' },
    ];
    return this.hasResults()
      ? [...items, { id: 'results' as const, icon: 'search' }]
      : items;
  });
}
