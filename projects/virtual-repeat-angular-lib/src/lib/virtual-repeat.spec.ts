import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualRepeatOf } from './virtual-repeat';

describe('VirtualRepeatOf', () => {
  let component: VirtualRepeatOf<any>;
  let fixture: ComponentFixture<VirtualRepeatOf<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualRepeatOf ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.create(VirtualRepeatOf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
