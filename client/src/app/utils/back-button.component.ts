import { Icon } from './icon';
import { Button } from '@sushi-kit/angular';
import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  imports: [Icon, Button],
  template: `
    <button
      suiButton
      severity="secondary"
      [shape]="label() ? null : 'square'"
      [variant]="outlined() ? 'outlined' : text() ? 'text' : null"
      (click)="goBack()"
    >
      <app-icon name="arrow-left" />{{ label() }}
    </button>
  `,
})
export class BackButtonComponent {
  private location = inject(Location);

  public label = input<string>('');
  public outlined = input<boolean>(false);
  public text = input<boolean>(true);

  protected goBack(): void {
    this.location.back();
  }
}
