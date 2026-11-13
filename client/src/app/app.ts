import { Icon } from './utils/icon';
import { ConfirmDialog } from './utils/confirm-dialog';
import {
  Spinner,
  Button,
  Skeleton,
  Toast as SushiToast,
  ToastContentTemplate,
} from '@sushi-kit/angular';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ConfigService } from './config-module/config.service';

import { HealthService } from './health.service';
import { filter } from 'rxjs';
import { Navbar } from './navbar/navbar';
import { NavbarOutletService } from './navbar/navbar-outlet.service';
import { TranslocoDirective } from '@jsverse/transloco';
import { ShortcutService } from './shortcuts/shortcut.service';
import { CreateEntityAction } from './actions/create-entity-action';

import { SushiToastTemplates } from './models/config/SushiToastTemplates';

@Component({
  selector: 'app-root',
  imports: [
    Icon,
    RouterOutlet,
    Spinner,
    Button,
    ConfirmDialog,
    Navbar,
    NgTemplateOutlet,
    Skeleton,
    TranslocoDirective,
    SushiToast,
    ToastContentTemplate,
  ],
  host: { class: 'block h-full' },
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly config = inject(ConfigService);
  private readonly status = inject(HealthService);
  private readonly shortcuts = inject(ShortcutService);
  private readonly createEntityAction = inject(CreateEntityAction);

  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected readonly navbarOutlet = inject(NavbarOutletService);

  @ViewChild('appContent') private appContent!: ElementRef<HTMLDivElement>;

  protected showScrollTop = false;

  public constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop('instant');
      });
  }
  public ngOnInit(): void {
    this.shortcuts.register(
      this.createEntityAction,
      () => ({}),
      this.destroyRef,
    );
  }

  protected onContentScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.showScrollTop = target.scrollTop > 300;
  }

  protected scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    this.appContent.nativeElement.scrollTo({ top: 0, behavior: behavior });
  }

  protected readonly healthStatusLoaded = this.status.getHealthStatusLoaded();

  protected loaded = computed(() => {
    const loaded = this.config.getLoaded();
    const healthy = this.status.getHealthStatus();
    const healthStatusLoaded = this.healthStatusLoaded();
    return loaded() && healthy() && healthStatusLoaded;
  });

  protected appVersion = this.status.getServerVersion();
  protected ramenVersion = this.status.getRamenVersion();
  protected readonly SushiToastTemplates = SushiToastTemplates;
}
