import { Component } from '@angular/core';
import { ConfigPane } from '../../config-module/config-pane';
import { TranslocoDirective } from '@jsverse/transloco';
import { Icon } from '../../utils/icon';

@Component({
  selector: 'app-config-page',
  imports: [ConfigPane, TranslocoDirective, Icon],
  templateUrl: './config-page.html',
})
export class ConfigPage {}
