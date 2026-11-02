import { Icon } from '../../utils/icon';
import { Button } from '@sushi-kit/angular';
import { Component, inject, input } from '@angular/core';
import { ConnectedNode } from '../connected-node/connected-node';
import { NodeTypes } from '../node-types/node-types';
import { AttributeList } from '../attribute-list/attribute-list';
import { UpdateAnnotation } from '../../edit-annotation/update-annotation';
import type { StatementAnnotationView } from '../annotation-list.model';
import { DialogService } from '../../utils/dialog/dialog.service';
import { CreateAnnotationConnection } from '../../create-annotation-connection/create-annotation-connection';
import { Annotation } from '../../../interfaces';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { ConfirmService } from '../../utils/confirm.service';
import { NotificationService } from '../../utils/notification.service';
import { UtilsService } from '../../utils/utils.service';
import { EntityService } from '../../entity.service';
import { NgClass } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-annotation-card',
  imports: [
    Icon,
    Button,
    ConnectedNode,
    NodeTypes,
    AttributeList,
    UpdateAnnotation,
    NgClass,
    TranslocoDirective,
  ],
  templateUrl: './annotation-card.html',
})
export class AnnotationCard {
  private readonly dialogService = inject(DialogService);
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly confirmationService = inject(ConfirmService);
  private readonly messageService = inject(NotificationService);
  private readonly utils = inject(UtilsService);
  private readonly entityService = inject(EntityService);
  private readonly transloco = inject(TranslocoService);

  public annotation = input.required<StatementAnnotationView>();

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.dialogService.open(CreateAnnotationConnection, {
      inputs: {
        annotation: annotation,
      },
      title: this.transloco.translate(
        'app.shared.createAnnotationConnection.header',
      ),
    });
  }

  protected clickDeleteAnnotation(id: string, event?: Event) {
    this.confirmationService.confirm({
      target: event?.target ?? undefined,
      message: this.transloco.translate(
        'app.shared.annotationCard.delete.confirm.message',
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
          'app.shared.annotationCard.delete.confirm.accept',
        ),
        severity: 'danger',
      },
      accept: async () => {
        await this.deleteAnnotation(id);
        this.messageService.add({
          severity: 'success',
          summary: this.transloco.translate(
            'app.shared.annotationCard.delete.success',
          ),
        });
        await this.entityService.reloadEntity();
      },
    });
  }

  private async deleteAnnotation(id: string) {
    await this.annotationApi.delete(id);
  }

  protected copyToClipboard = this.utils.copyToClipboard;
}
