import { CommonModule } from '@angular/common';
import { TestBed, inject } from '@angular/core/testing';

import { IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatAsynch } from './virtual-repeat-asynch';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
import { VirtualRepeatRow } from 'virtual-repeat-angular-lib/virtual-repeat.base';

describe('VirtualRepeat', () => {
  let virtualRepeatContainer: VirtualRepeatContainer;
  let differs: IterableDiffers;
  let template: TemplateRef<VirtualRepeatRow>;
  let viewContainerRef: ViewContainerRef;

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

  beforeEach(inject([VirtualRepeatContainer, TemplateRef, ViewContainerRef],
    (_virtualRepeatContainer: VirtualRepeatContainer, 
      
      _template: TemplateRef<VirtualRepeatRow>,
      _viewContainerRef: ViewContainerRef) => {

      virtualRepeatContainer = _virtualRepeatContainer;
      template = _template;
      viewContainerRef = _viewContainerRef;
    }));
  
  it('should create', inject([ IterableDiffers, VirtualRepeatContainer, TemplateRef, ViewContainerRef ], (iterableDiffers: IterableDiffers) => {
    const directive = new VirtualRepeatAsynch(virtualRepeatContainer,
      iterableDiffers,
      template,
      viewContainerRef);
    expect(directive).toBeTruthy();
  }));
});
