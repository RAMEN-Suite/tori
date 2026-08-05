import { CreateAnnotationAction } from '../create-annotation/create-annotation-action';
import { Action } from './action.class';
import { Type } from '@angular/core';

type ConfigurableShortcutActionType = Type<Action<unknown>>;

export const CONFIGURABLE_SHORTCUT_ACTIONS: readonly Type<Action<unknown>>[] = [
  CreateAnnotationAction,
] as const satisfies readonly ConfigurableShortcutActionType[];
