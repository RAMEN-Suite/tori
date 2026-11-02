import { Button, DialogBody, DialogHeader } from '@sushi-kit/angular';
import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgComponentOutlet } from '@angular/common';
import { ComponentType } from '@angular/cdk/overlay';

interface Config {
  title: string;
  component: ComponentType<unknown>;
  inputs?: Record<string, unknown>;
}

@Component({
  imports: [Button, DialogHeader, DialogBody, NgComponentOutlet],
  selector: 'app-dialog',
  templateUrl: './dialog.html',
})
export class Dialog {
  protected readonly data: Config = inject<Config>(DIALOG_DATA);
  protected readonly dialog: DialogRef = inject<DialogRef>(DialogRef);
}
