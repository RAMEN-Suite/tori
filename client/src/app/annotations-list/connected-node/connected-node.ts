import { Icon } from '../../utils/icon';
import { Button } from '@sushi-kit/angular';
import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmService } from '../../utils/confirm.service';
import { NotificationService } from '../../utils/notification.service';
import { EntityService } from '../../entity.service';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { ConnectedNodeDto, StatementNodeView } from '../../../interfaces';
import { UtilsService } from '../../utils/utils.service';
import {
  ANNOTATION_LABEL_NAME,
  ANNOTATION_TYPE_NAME,
  COLLECTION_LABEL_NAME,
  CONTENT_LABEL_NAME,
  ENTITY_LABEL_NAME,
} from '../../../constants';
import { getLabelProperty } from '../../utils/entity.utils';
import { NodeTypes } from '../node-types/node-types';
import { getProperty } from '../../utils/utils';
import { ConfigService } from '../../config-module/config.service';
import { NgTemplateOutlet } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-connected-node',
  imports: [Icon, NodeTypes, RouterLink, Button, NgTemplateOutlet],
  providers: [NotificationService],
  templateUrl: './connected-node.html',
})
export class ConnectedNode {
  private readonly config = inject(ConfigService);
  private readonly entityService = inject(EntityService);
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly messageService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly utils = inject(UtilsService);
  private readonly transloco = inject(TranslocoService);

  public annotationId = input.required<string>();
  public node = input.required<StatementNodeView>();
  public firstEntry = input(false, { transform: booleanAttribute });
  public lastEntry = input(false, { transform: booleanAttribute });

  protected readonly camiAvailable = this.config.camiAvailable;

  protected readonly title = computed<string | undefined>(() => {
    return this.getTitle(this.node().node);
  });

  protected async navigate(entityLink: string) {
    await this.router.navigate([entityLink]);
  }

  protected clickDeleteAnnotationRelation(
    id: string,
    connectedNodeId: string,
    event?: Event,
  ) {
    this.confirmationService.confirm({
      target: event?.target ?? undefined,
      message: this.transloco.translate(
        'app.shared.connectedNode.delete.confirm.message',
      ),
      header: this.transloco.translate('app.shared.common.dangerZone'),
      icon: 'info-circle',
      rejectButtonProps: {
        label: this.transloco.translate('app.shared.actions.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.transloco.translate(
          'app.shared.connectedNode.delete.confirm.accept',
        ),
        severity: 'danger',
      },
      accept: async () => {
        await this.deleteAnnotationRelation(id, connectedNodeId);
        this.messageService.add({
          severity: 'success',
          summary: this.transloco.translate(
            'app.shared.connectedNode.delete.success',
          ),
        });
        await this.entityService.reloadEntity();
      },
    });
  }

  private async deleteAnnotationRelation(id: string, connectedNodeId: string) {
    await this.annotationApi.deleteOutgoingRelation(id, connectedNodeId);
  }

  private getTitle(node: ConnectedNodeDto) {
    if (node.types.includes(ENTITY_LABEL_NAME)) {
      return (getLabelProperty(node.properties)?.value ?? '') as string;
    }
    if (node.types.includes(ANNOTATION_LABEL_NAME)) {
      return (getProperty(node.properties, ANNOTATION_TYPE_NAME)?.value ??
        '') as string;
    }

    //TODO: nicht mehr hacken, sondern über projektspezifische config lösen
    if (node.types.includes(CONTENT_LABEL_NAME)) {
      return (
        ((getProperty(node.properties, 'text')?.value ?? '') as string).slice(
          0,
          20,
        ) + '...'
      );
    }
    if (node.types.includes(COLLECTION_LABEL_NAME)) {
      return (getProperty(node.properties, 'label')?.value ?? '') as string;
    }
    return undefined;
  }
}
