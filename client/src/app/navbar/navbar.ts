import { Icon } from '../utils/icon';
import { PopoverTrigger, Button, Popover } from '@sushi-kit/angular';
import { Component, computed, inject, Signal } from '@angular/core';

import { BackButtonComponent } from '../utils/back-button.component';
import { isActive, Router, RouterLink } from '@angular/router';
import { CreateEntity } from '../create-entity/create-entity';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../language.service';
import {
  AVAILABLE_LANGUAGES,
  LanguageKey,
} from '../models/config/LanguageOptions';
import { ConfigService } from '../config-module/config.service';

@Component({
  selector: 'app-navbar',
  imports: [
    Icon,
    BackButtonComponent,
    RouterLink,
    CreateEntity,
    Button,
    TranslocoDirective,
    Popover,
    PopoverTrigger,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly config: ConfigService = inject(ConfigService);

  protected isHomeRoute = isActive('/', this.router, {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });

  protected readonly activeLanguage: Signal<LanguageKey | undefined> =
    this.languageService.activeLanguage;
  protected readonly languages: Signal<LanguageKey[]> = computed(
    (): LanguageKey[] => {
      const languages: LanguageKey[] =
        this.config.getConfig()().language.available;
      return AVAILABLE_LANGUAGES.filter((key: LanguageKey): boolean =>
        languages.includes(key),
      );
    },
  );

  protected handleLanguageChange(
    language: LanguageKey,
    popover: Popover,
  ): void {
    popover.hide();
    this.languageService.setActiveLanguage(language);
  }
}
