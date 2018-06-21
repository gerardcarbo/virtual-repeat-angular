import { CommonModule } from '@angular/common';
import { TestBed, inject } from '@angular/core/testing';

import { VirtualRepeatReactive } from './virtual-repeat-reactive';
import { IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatRow } from './virtual-repeat.base';

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

  it('should create an instance', inject([IterableDiffers, VirtualRepeatContainer, TemplateRef, ViewContainerRef], 
    (iterableDiffers: IterableDiffers, 
      virtualRepeatContainer: VirtualRepeatContainer,
      template: TemplateRef<VirtualRepeatRow>,
      viewContainerRef: ViewContainerRef) => {
    const directive = new VirtualRepeatReactive(virtualRepeatContainer,
      iterableDiffers,
      template,
      viewContainerRef);
    expect(directive).toBeTruthy();
  }));
});
