import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualRepeatContainer } from './virtual-repeat-container';
import { LoggerService } from '../public_api';

describe('VirtualRepeatContainer', () => {
  let component: VirtualRepeatContainer;
  let fixture: ComponentFixture<VirtualRepeatContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualRepeatContainer ],
      providers: [
        VirtualRepeatContainer, LoggerService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualRepeatContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
