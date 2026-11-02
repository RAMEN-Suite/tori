import {
  Chip,
  Input,
  InputNumber,
  Label,
  ToastService,
  Toggle,
} from '@sushi-kit/angular';
import { Component, computed, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ENTITY_NAME_PROPERTY } from '../../../constants';
import { EntityPropertyDto } from '../../../interfaces';
import { ConfigService } from '../../config-module/config.service';
import { EntityApiService } from '../../api/entity-api.service';
import { castValue, castValues } from '../utils';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { SushiToastTemplates } from '../../models/config/SushiToastTemplates';

interface AttributeWithOptValue
  extends
    Omit<EntityPropertyDto, 'value'>,
    Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-attribute-form',
  imports: [
    InputNumber,
    ReactiveFormsModule,
    TranslocoDirective,
    Input,
    Label,
    FormsModule,
    Toggle,
    Chip,
  ],
  templateUrl: './attribute-form.html',
})
export class AttributeForm {
  private readonly configService = inject(ConfigService);
  private readonly entityAPI = inject(EntityApiService);
  private readonly toastService = inject(ToastService);
  private readonly transloco = inject(TranslocoService);

  public properties = input.required<AttributeWithOptValue[]>();
  public formName = input.required<string>();
  public enableCheckForSimilarLabels = input<boolean>(false);

  public readonly propertiesForm = computed(() => {
    const props = this.properties();
    return this.buildFormGroup(props);
  });

  public readonly locale = this.transloco.getActiveLang();

  private buildFormGroup(props: AttributeWithOptValue[]) {
    const controlls: Record<string, FormControl> = {};

    for (const prop of props) {
      const formControl = this.createFormControl(prop);
      if (!formControl) continue;
      controlls[prop.name] = formControl;
    }

    return new FormGroup(controlls);
  }

  private createFormControl(
    prop: AttributeWithOptValue,
  ): FormControl | undefined {
    const dataType = this.findDataType(prop.typeId);
    if (!dataType) return undefined;

    const { lowerBound, upperBound } = prop.bounds;
    const isArray = this.isArray(prop.bounds);
    const isReadOnly = prop.isReadOnly;

    const validators = [...(lowerBound >= 1 ? [Validators.required] : [])];

    if (isArray) {
      validators.push(
        Validators.minLength(lowerBound),
        ...(upperBound !== -1 ? [Validators.maxLength(upperBound)] : []),
      );
    }

    switch (dataType.name.toLowerCase()) {
      case 'string': {
        let val: string | string[] | null = isArray ? [] : null;
        if (prop.value)
          val =
            isArray && Array.isArray(prop.value)
              ? castValues<string>(prop.value, 'string')
              : castValue<string>(prop.value, 'string');
        return new FormControl<string | string[] | null>(
          { value: val, disabled: isReadOnly },
          validators,
        );
      }
      case 'integer':
      case 'float': {
        let val: number | number[] | null = isArray ? [] : null;
        if (prop.value)
          val =
            isArray && Array.isArray(prop.value)
              ? castValues<number>(prop.value, 'float')
              : castValue<number>(prop.value, 'float');
        return new FormControl<number | number[] | null>(
          { value: val, disabled: isReadOnly },
          validators,
        );
      }
      case 'boolean': {
        let val: boolean | boolean[] = isArray ? new Array<boolean>() : false;
        if (prop.value)
          val =
            isArray && Array.isArray(prop.value)
              ? castValues<boolean>(prop.value, 'boolean')
              : castValue<boolean>(prop.value, 'boolean');
        if (isArray && Array.isArray(val)) {
          return new FormControl<boolean[]>(
            { value: val, disabled: isReadOnly },
            validators,
          );
        } else {
          return new FormControl<boolean>(
            { value: Boolean(val), disabled: isReadOnly },
            { nonNullable: true },
          );
        }
      }
      default:
        return undefined;
    }
  }

  protected findDataType(id: string) {
    return this.configService.findDataType(id);
  }

  private isArray(bounds: { lowerBound: number; upperBound: number }): boolean {
    return bounds.upperBound === -1 || bounds.upperBound > 1;
  }

  protected async onLabelBlur(event: FocusEvent) {
    const value = (event.target as HTMLInputElement).value;
    if (this.enableCheckForSimilarLabels()) {
      await this.checkForSimilarLabels(value);
    }
  }

  private async checkForSimilarLabels(label: string) {
    if (label.length === 0) return;
    const similarEntities = await this.entityAPI.getAutocomplete(label);
    const detailMsg = similarEntities.map((entity) =>
      this.transloco.translate('app.shared.attributeForm.similar.detail', {
        label: entity.label,
      }),
    );
    if (detailMsg.length === 0) return;
    this.toastService.show({
      severity: 'info',
      title: this.transloco.translate(
        'app.shared.attributeForm.similar.summary',
      ),
      message: detailMsg.join('\n'),
      duration: 11000,
      template: SushiToastTemplates.HTML,
    });
  }

  protected addArrayValue(
    property: AttributeWithOptValue,
    inputEl: HTMLInputElement,
  ): void {
    const control = this.propertiesForm().get(property.name);
    const value = inputEl.value.trim();

    if (!control || control.disabled || !value) return;

    const values = (control.value ?? []) as string[];
    const max = property.bounds.upperBound;

    if (max !== -1 && values.length >= max) return;

    control.setValue([...values, value]);
    control.markAsDirty();
    inputEl.value = '';
  }

  protected removeArrayValue(name: string, index: number): void {
    const control = this.propertiesForm().get(name);
    if (!control || control.disabled) return;

    const values = (control.value ?? []) as string[];
    control.setValue(values.filter((_, i) => i !== index));
    control.markAsDirty();
  }

  protected readonly ENTITY_NAME_PROPERTY = ENTITY_NAME_PROPERTY;
}
