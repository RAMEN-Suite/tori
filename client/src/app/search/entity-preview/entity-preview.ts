import { Component, inject, input, output, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Spinner } from '@sushi-kit/angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { EntityNames } from '../../../interfaces';
import { EntityApiService } from '../../api/entity-api.service';
import { AttributeList } from '../../annotations-list/attribute-list/attribute-list';
import { NodeTypes } from '../../annotations-list/node-types/node-types';
import { Icon } from '../../utils/icon';
import { visibleProperties } from '../../utils/utils';

@Component({
  selector: 'app-entity-preview',
  imports: [
    RouterLink,
    Button,
    Spinner,
    TranslocoDirective,
    AttributeList,
    NodeTypes,
    Icon,
  ],
  templateUrl: './entity-preview.html',
  host: { class: 'block min-w-0 xl:sticky xl:top-24' },
})
export class EntityPreview {
  private readonly api = inject(EntityApiService);
  public readonly selection = input.required<EntityNames>();
  public readonly closed = output();
  protected readonly visibleProperties = visibleProperties;
  protected readonly preview = resource({
    params: () => this.selection().id,
    loader: ({ params }) => this.api.getById(params),
  });
}
