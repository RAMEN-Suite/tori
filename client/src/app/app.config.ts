import { ToastService } from '@sushi-kit/angular';
import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { ConfirmService } from './utils/confirm.service';
import { NotificationService } from './utils/notification.service';
import { EntityService } from './entity.service';
import { LocalStoreService } from './utils/local-store.service';
import { ConfigService } from './config-module/config.service';
import { HealthService } from './health.service';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { LanguageService } from './language.service';
import { DialogService } from './utils/dialog/dialog.service';
import { ShortcutService } from './shortcuts/shortcut.service';
import { ShortcutKeymapService } from './shortcuts/shortcut-keymap.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initApplication),
    EntityService,
    ConfirmService,
    NotificationService,
    ToastService,
    DialogService,
    ShortcutKeymapService,
    ShortcutService,
    HealthService,
    LocalStoreService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler(async (error) => {
        const router = inject(Router);
        const cause: unknown = error.error;

        const status =
          typeof cause === 'object' &&
          cause !== null &&
          'status' in cause &&
          (typeof cause.status === 'string' || typeof cause.status === 'number')
            ? cause.status
            : 'unknown';

        await router.navigate(['/error', status]);
      }),
    ),
    provideHttpClient(withXhr()),
    provideTransloco({
      config: { reRenderOnLangChange: true, prodMode: !isDevMode() },
      loader: TranslocoHttpLoader,
    }),
  ],
};

async function initApplication(): Promise<void> {
  const configService: ConfigService = inject(ConfigService);
  const languageService: LanguageService = inject(LanguageService);
  const healthService: HealthService = inject(HealthService);

  await configService.init();

  if (!configService.getLoaded()()) return;
  languageService.init();
  await healthService.init();
}
