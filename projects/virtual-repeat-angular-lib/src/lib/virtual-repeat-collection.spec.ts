import { CommonModule } from '@angular/common';
import { TestBed, inject } from '@angular/core/testing';

import { IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeat } from './virtual-repeat-collection';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatRow } from './virtual-repeat.base';
import { LoggerService } from './logger.service';

describe('VirtualRepeat', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
      ],
      providers: [
        VirtualRepeatContainer, TemplateRef, ViewContainerRef
      ]
    });
  });

  it('should create', inject([IterableDiffers, VirtualRepeatContainer, TemplateRef, ViewContainerRef], 
    (iterableDiffers: IterableDiffers, 
      virtualRepeatContainer: VirtualRepeatContainer,
      template: TemplateRef<VirtualRepeatRow>,
      viewContainerRef: ViewContainerRef,
      logger: LoggerService) => {
    const directive = new VirtualRepeat(virtualRepeatContainer,
      iterableDiffers,
      template,
      viewContainerRef,
      logger);
    expect(directive).toBeTruthy();
  }));
});
