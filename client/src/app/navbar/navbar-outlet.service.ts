import { Injectable, signal, TemplateRef } from '@angular/core';

/** Lets a page provide navigation content while the header stays outside scrolling. */
@Injectable({ providedIn: 'root' })
export class NavbarOutletService {
  private readonly currentTemplate = signal<TemplateRef<unknown> | null>(null);
  public readonly template = this.currentTemplate.asReadonly();

  public attach(template: TemplateRef<unknown>): void {
    this.currentTemplate.set(template);
  }

  public detach(template: TemplateRef<unknown>): void {
    this.currentTemplate.update((current) =>
      current === template ? null : current,
    );
  }
}
