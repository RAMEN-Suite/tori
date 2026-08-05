import { CreateAnnotationAction } from '../actions/create-annotation-action';
import { Action } from '../actions/action.class';
import { Type } from '@angular/core';
import { CreateEntityAction } from '../actions/create-entity-action';

type ConfigurableShortcutActionType = Type<Action<unknown>>;

export const CONFIGURABLE_SHORTCUT_ACTIONS: readonly Type<Action<unknown>>[] = [
  CreateEntityAction,
  CreateAnnotationAction,
] as const satisfies readonly ConfigurableShortcutActionType[];
