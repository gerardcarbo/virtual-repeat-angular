import { TestBed, inject } from '@angular/core/testing';

import { ReactiveCollectionService } from './reactive-collection.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualRepeatAngularLibModule } from 'projects/virtual-repeat-angular-lib/src/public_api';

describe('ReactiveCollectionServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReactiveCollectionService],
      imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        VirtualRepeatAngularLibModule],
    });
  });

  it('should be created', inject([ReactiveCollectionService], (service: ReactiveCollectionService<any>) => {
    expect(service).toBeTruthy();
  }));
});
