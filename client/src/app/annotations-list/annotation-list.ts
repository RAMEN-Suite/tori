import { OptionsPipe } from '../utils/options.pipe';
import { Icon } from '../utils/icon';
import {
  Accordion,
  AccordionItem,
  Button,
  SelectButton,
  Skeleton,
} from '@sushi-kit/angular';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { EntityService } from '../entity.service';
import { AnnotationOfEntityWithContent, Direction } from '../../interfaces';
import { ANNOTATION_LABEL_NAME } from '../../constants';
import { AnnotationCard } from './annotation-card/annotation-card';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../config-module/config.service';
import { castUnknownToString } from '../utils/utils';
import type { AnnotationGroupView } from './annotation-list.model';
import {
  calculateGroupedAnnotations,
  type AnnotationListCalculationRequest,
} from './annotation-list-calculation';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-annotations-list',
  imports: [
    AccordionItem,
    OptionsPipe,
    Icon,
    Accordion,
    AnnotationCard,
    Button,
    SelectButton,
    FormsModule,
    Skeleton,
    TranslocoDirective,
  ],
  templateUrl: './annotation-list.html',
  host: { class: 'flex min-w-0 flex-col gap-4' },
})
export class AnnotationList {
  private readonly entityService = inject(EntityService);
  private readonly configService = inject(ConfigService);
  private readonly destroyRef = inject(DestroyRef);
  public annotationDirectionOptions: {
    labelKey: string;
    value: Direction;
    icon: string;
  }[] = [
    {
      labelKey: 'app.shared.annotationList.directions.outgoing',
      value: 'OUTGOING',
      icon: 'arrow-right',
    },
    {
      labelKey: 'app.shared.annotationList.directions.incoming',
      value: 'INCOMING',
      icon: 'arrow-left',
    },
  ];

  public annotations = input.required<AnnotationOfEntityWithContent[]>();
  public entity = this.entityService.entity;

  protected annotationListLoaded = signal<boolean>(true);

  protected readonly annotationNodeLabels =
    this.configService.getAnnotationTypes();
  protected readonly selectedNodeLabel = signal<string>(ANNOTATION_LABEL_NAME);
  protected readonly selectedAnnotationDirection =
    signal<Direction>('OUTGOING');
  protected readonly activeAccordionPanels = signal<string[]>([]);

  protected readonly groupedAnnotations = signal<AnnotationGroupView[]>([]);

  private worker?: Worker;
  private calculationId = 0;

  public constructor() {
    this.destroyRef.onDestroy(() => {
      this.worker?.terminate();
    });
  }

  private readonly recalculateGroupedAnnotations = effect(() => {
    const annotations = this.annotations();
    const selectedNodeLabel = this.selectedNodeLabel();
    const annotationDirection = this.selectedAnnotationDirection();
    const camiAvailable = this.configService.camiAvailable();
    const request: AnnotationListCalculationRequest = {
      annotations,
      annotationDirection,
      selectedNodeLabel,
      camiAvailable,
    };

    const currentCalculationId = ++this.calculationId;
    this.annotationListLoaded.set(false);
    this.worker?.terminate();
    this.worker = undefined;

    const calculateOnMainThread = () => {
      if (currentCalculationId !== this.calculationId) {
        return;
      }

      this.groupedAnnotations.set(calculateGroupedAnnotations(request));
      this.annotationListLoaded.set(true);
    };

    if (typeof Worker === 'undefined') {
      calculateOnMainThread();
      return;
    }

    try {
      const worker = new Worker(
        new URL('./annotation-list.worker', import.meta.url),
        { type: 'module' },
      );
      this.worker = worker;

      worker.onmessage = ({ data }: MessageEvent<AnnotationGroupView[]>) => {
        if (currentCalculationId !== this.calculationId) {
          return;
        }
        this.groupedAnnotations.set(data);
        this.annotationListLoaded.set(true);
        worker.terminate();
        this.worker = undefined;
      };

      worker.onerror = () => {
        worker.terminate();
        if (this.worker === worker) {
          this.worker = undefined;
        }
        calculateOnMainThread();
      };

      worker.postMessage(request);
    } catch {
      this.worker?.terminate();
      this.worker = undefined;
      calculateOnMainThread();
    }
  });

  protected expandAll() {
    this.activeAccordionPanels.set(
      this.groupedAnnotations().map((group) => group.type),
    );
  }

  protected closeAll() {
    this.activeAccordionPanels.set([]);
  }

  protected setActiveAccordionPanels(value: readonly (string | number)[]) {
    this.activeAccordionPanels.set(this.toStringArray(value));
  }

  protected setSelectedNodeLabel(value: string) {
    this.activeAccordionPanels.set([]);
    this.selectedNodeLabel.set(value);
  }

  protected setSelectedDirection(value: Direction) {
    this.activeAccordionPanels.set([]);
    this.selectedAnnotationDirection.set(value);
  }

  private toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map(castUnknownToString);
    }

    return value === null || value === undefined
      ? []
      : [castUnknownToString(value)];
  }

  protected skeletonGroups = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  protected skeletonWidths = this.skeletonGroups.map(() => {
    const value = Math.floor(Math.random() * 7) + 4;

    return `${value}rem`;
  });
}
