import { Component, computed, inject, input } from '@angular/core';
import { Button } from 'primeng/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { CreateAnnotationAction } from './create-annotation-action';

@Component({
  selector: 'app-create-annotation',
  imports: [Button, TranslocoDirective],
  templateUrl: './create-annotation.html',
})
export class CreateAnnotation {
  private readonly action = inject(CreateAnnotationAction);

  public entityId = input.required<string>();
  public label = input<string | undefined>();
  public icon = input<string | undefined>();

  protected params = computed(() => ({
    entityId: this.entityId(),
  }));

  protected title = computed(() => this.label() ?? this.action.title());

  protected buttonIcon = computed(() => this.icon() ?? this.action.icon());

  protected disabled = computed(() => this.action.disabled(this.params()));

  protected clickCreate() {
    void this.action.run(this.params());
  }
}
