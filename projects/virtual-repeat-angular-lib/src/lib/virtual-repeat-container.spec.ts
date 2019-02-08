import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualRepeatContainer } from '@app/shared/grid/virtual-repeat/virtual-repeat-container';

describe('VirtualRepeatContainer', () => {
  let component: VirtualRepeatContainer;
  let fixture: ComponentFixture<VirtualRepeatContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualRepeatContainer ]
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
