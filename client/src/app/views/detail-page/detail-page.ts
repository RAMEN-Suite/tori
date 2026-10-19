import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { DeleteEntity } from '../../delete-entity/delete-entity';
import { EditEntity } from '../../edit-entity/edit-entity';
import { EntityService } from '../../entity.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CreateAnnotation } from '../../create-annotation/create-annotation';
import { visibleProperties } from '../../utils/utils';
import { NodeTypes } from '../../annotations-list/node-types/node-types';
import { AnnotationList } from '../../annotations-list/annotation-list';
import { AttributeList } from '../../annotations-list/attribute-list/attribute-list';
import { TranslocoDirective } from '@jsverse/transloco';
import { ShortcutService } from '../../shortcuts/shortcut.service';
import { CreateAnnotationAction } from '../../actions/create-annotation-action';

@Component({
  selector: 'app-detail-page',
  imports: [
    TableModule,
    DeleteEntity,
    EditEntity,
    ProgressSpinner,
    CreateAnnotation,
    NodeTypes,
    AnnotationList,
    AttributeList,
    TranslocoDirective,
  ],
  styleUrl: './detail-page.scss',
  templateUrl: './detail-page.html',
})
export class DetailPage implements OnDestroy, OnInit {
  private readonly entityService = inject(EntityService);
  private readonly shortcuts = inject(ShortcutService);
  private readonly createAnnotationAction = inject(CreateAnnotationAction);
  private readonly destroyRef = inject(DestroyRef);

  public entityId = input.required<string>();

  public ngOnInit() {
    this.shortcuts.register(
      this.createAnnotationAction,
      () => ({
        entityId: this.entityId(),
      }),
      this.destroyRef,
    );
  }

  protected annotations = this.entityService.annotations;
  protected entity = this.entityService.entity;

  protected readonly visibleProperties = visibleProperties;

  private readonly loadEntityEffect = effect(() => {
    const id = this.entityId();
    void this.entityService.loadNewEntity(id);
  });

  public ngOnDestroy() {
    this.entityService.resetState();
    this.loadEntityEffect.destroy();
  }
}
