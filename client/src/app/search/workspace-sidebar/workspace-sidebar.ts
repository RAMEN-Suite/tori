import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Button,
  NavbarItem,
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarItemTemplate,
} from '@sushi-kit/angular';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { Icon } from '../../utils/icon';
import { WorkspaceView } from '../workspace-view';

interface WorkspaceSidebarItem extends NavbarItem<WorkspaceView> {
  readonly icon: string;
}

@Component({
  selector: 'app-workspace-sidebar',
  imports: [
    Button,
    Icon,
    Sidebar,
    SidebarHeader,
    SidebarItemTemplate,
    TranslocoDirective,
  ],
  templateUrl: './workspace-sidebar.html',
  host: { class: 'block h-full' },
})
export class WorkspaceSidebar {
  public readonly active = input.required<WorkspaceView>();
  public readonly hasResults = input(false);
  public readonly collapsed = model(false);
  public readonly viewSelected = output<WorkspaceView>();
  public readonly closeRequested = output();

  private readonly transloco = inject(TranslocoService);
  private readonly translation = toSignal(this.transloco.selectTranslation());

  protected readonly groups = computed<SidebarGroup<WorkspaceSidebarItem>[]>(
    () => {
      this.translation();
      const items: { id: WorkspaceView; icon: string }[] = [
        { id: 'overview', icon: 'house' },
        { id: 'recent', icon: 'clock' },
        { id: 'frequent', icon: 'trending' },
      ];
      if (this.hasResults()) items.push({ id: 'results', icon: 'search' });
      return [
        {
          label: this.transloco.translate('app.screens.workspace.shortcuts'),
          heading: null,
          items: items.map((item) => ({
            value: item.id,
            icon: item.icon,
            label: this.transloco.translate('app.screens.workspace.' + item.id),
          })),
        },
      ];
    },
  );

  protected selectView(value: WorkspaceView | null): void {
    if (value !== null) this.viewSelected.emit(value);
  }
}
