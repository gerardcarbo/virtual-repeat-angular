import { CommonModule } from '@angular/common';
import { TestBed, inject } from '@angular/core/testing';

import { IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatReactive } from './virtual-repeat-reactive';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatRow } from './virtual-repeat.base';
import { LoggerService } from './logger.service';

describe('VirtualRepeatReactive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
      ],
      providers: [
        VirtualRepeatContainer, TemplateRef, ViewContainerRef, LoggerService
      ]
    });
  });

  it('should create an instance', inject([IterableDiffers, VirtualRepeatContainer, TemplateRef, ViewContainerRef, LoggerService],
    (iterableDiffers: IterableDiffers,
      virtualRepeatContainer: VirtualRepeatContainer,
      template: TemplateRef<VirtualRepeatRow>,
      viewContainerRef: ViewContainerRef,
      logger: LoggerService) => {
    const directive = new VirtualRepeatReactive(virtualRepeatContainer,
      iterableDiffers,
      template,
      viewContainerRef,
      logger);
    expect(directive).toBeTruthy();
  }));
});
