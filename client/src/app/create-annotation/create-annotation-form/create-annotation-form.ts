import { OptionsPipe } from '../../utils/options.pipe';
import { Button, Select } from '@sushi-kit/angular';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { CreateAnnotationService } from '../create-annotation.service';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '../../utils/dialog/dialog.service';
import { DialogRef } from '@angular/cdk/dialog';
import { Annotation, GAttribute } from '../../../interfaces';
import { CreateAnnotationConnection } from '../../create-annotation-connection/create-annotation-connection';
import { ConfirmService } from '../../utils/confirm.service';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { UtilsService } from '../../utils/utils.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

// Using experimental Signal Form. Cause why not
@Component({
  selector: 'app-create-annotation-form',
  providers: [CreateAnnotationService],
  imports: [
    OptionsPipe,
    FormsModule,
    Button,
    Select,
    ReactiveFormsModule,
    AttributeForm,
    TranslocoDirective,
  ],
  templateUrl: './create-annotation-form.html',
})
export class CreateAnnotationForm {
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmService);
  private readonly utilService = inject(UtilsService);
  private readonly transloco = inject(TranslocoService);
  private readonly createAnnotationService = inject(CreateAnnotationService);
  private readonly dialogRef = inject(DialogRef);

  protected readonly types: Signal<string[]> =
    this.createAnnotationService.getAnnotationTypes();
  public entityId = input.required<string>();
  protected readonly properties: WritableSignal<GAttribute[]> = signal<
    GAttribute[]
  >([]);
  protected loading = signal<boolean>(false);
  private readonly propertiesLoaded: WritableSignal<boolean> =
    signal<boolean>(true); // TODO: UI Loading state
  protected readonly typesLoaded: Signal<boolean> =
    this.createAnnotationService.geAnnotationTypesLoaded();

  private attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  protected typeInput = new FormControl('', { nonNullable: true });

  protected propertiesForm = computed(() =>
    this.attributeForm().propertiesForm(),
  );

  public constructor() {
    // effect(async () => {
    //   const type = this.preselectedType();
    //   if (type) {
    //     this.typeInput.setValue(type, { emitEvent: false });
    //     await this.loadAndDisplayPropertyInputs(type);
    //   }
    // });
    effect(() => {
      const types = this.types();
      if (types[0]) {
        this.typeInput.setValue(types[0], { emitEvent: false });
        void this.loadAndDisplayPropertyInputs(types[0]);
      }
    });
    this.typeInput.valueChanges.subscribe((value) => {
      void this.loadAndDisplayPropertyInputs(value);
    });
  }

  private async loadAndDisplayPropertyInputs(type: string) {
    this.propertiesLoaded.set(false);
    const props: GAttribute[] =
      await this.createAnnotationService.getAnnotationProperties(type);
    this.properties.set(props);
    this.propertiesLoaded.set(true);
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    try {
      this.loading.set(true);
      const payload = this.utilService.createPayload(
        this.propertiesForm().value,
        this.properties(),
      );
      const annotationId =
        await this.createAnnotationService.createAnnotationForEntity(
          this.entityId(),
          this.typeInput.value,
          payload,
        );
      console.log(`Created Annotation ${annotationId}`);
      this.confirmationService.confirm({
        target: event.target ?? undefined,
        message: this.transloco.translate(
          'app.shared.createAnnotationForm.connection.message',
        ),
        icon: 'info-circle',
        rejectButtonProps: {
          label: this.transloco.translate('app.shared.actions.no'),
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: this.transloco.translate('app.shared.actions.yes'),
          severity: 'primary',
        },
        accept: async () => {
          const annotation = await this.annotationApi.get(annotationId);
          this.clickCreateAnnotationConnection(annotation);
        },
      });
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.dialogService.open(CreateAnnotationConnection, {
      inputs: {
        annotation: annotation,
      },
      title: this.transloco.translate(
        'app.shared.createAnnotationConnection.optionalHeader',
      ),
    });
  }
}
