import { Button } from '@sushi-kit/angular';
import {
  Component,
  computed,
  inject,
  input,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { UpdateAnnotationService } from '../update-annotation.service';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { Annotation, EntityPropertyDto, GAttribute } from '../../../interfaces';
import { getKeyProperty } from '../../utils/entity.utils';
import { NotificationService } from '../../utils/notification.service';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { from, map, switchMap } from 'rxjs';
import { ANNOTATION_TYPE_NAME } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

interface AttributeWithOptValue
  extends
    Omit<EntityPropertyDto, 'value'>,
    Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-update-annotation-form',
  imports: [FormsModule, Button, AttributeForm, TranslocoDirective],
  templateUrl: './update-annotation-form.html',
})
export class UpdateAnnotationForm {
  private readonly updateAnnotationService = inject(UpdateAnnotationService);
  private readonly dialogRef = inject(DialogRef);
  private messageService = inject(NotificationService);
  private readonly utilService = inject(UtilsService);
  private readonly transloco = inject(TranslocoService);

  public annotation = input.required<Annotation>();
  protected loading = signal<boolean>(false);

  private annotationId: Signal<string | null> = computed(() => {
    const keyProp = getKeyProperty(this.annotation().properties);
    if (keyProp) {
      return keyProp.value as string;
    }
    return null;
  });

  protected readonly properties: Signal<(GAttribute | EntityPropertyDto)[]> =
    toSignal(
      toObservable(this.annotation).pipe(
        switchMap((annotation) =>
          from(
            this.updateAnnotationService.getAnnotationProperties(
              annotation.types[annotation.types.length - 1],
            ),
          ),
        ),
        map((attributes) =>
          this.mergePropArrays(this.annotation().properties, attributes),
        ),
      ),
      { initialValue: [] },
    );

  private attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  protected propertiesForm = computed(() =>
    this.attributeForm().propertiesForm(),
  );

  private mergePropArrays(
    props: EntityPropertyDto[],
    attributes: AttributeWithOptValue[],
  ) {
    const arr: AttributeWithOptValue[] = [...props];
    let nameAttribute: AttributeWithOptValue | undefined;

    attributes.forEach((attribute) => {
      if (attribute.name === ANNOTATION_TYPE_NAME) {
        attribute.value = this.annotation().type;
        nameAttribute = attribute;
      }
      const included = arr.find((prop) => attribute.name === prop.name);
      if (!included) arr.push(attribute);
    });

    if (nameAttribute) {
      const index = arr.indexOf(nameAttribute);
      if (index > -1) arr.splice(index, 1);
      arr.unshift(nameAttribute);
    }

    return arr;
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    const annotationId = this.annotationId();
    if (!annotationId) {
      this.messageService.add({
        severity: 'danger',
        summary: this.transloco.translate(
          'app.shared.updateAnnotationForm.errors.missingId.summary',
        ),
        detail: this.transloco.translate(
          'app.shared.updateAnnotationForm.errors.missingId.detail',
        ),
      });
      return;
    }
    try {
      this.loading.set(true);
      const payload = this.utilService.createPayload(
        this.propertiesForm().value,
        this.properties(),
      );
      await this.updateAnnotationService.update(annotationId, payload);
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }
}
