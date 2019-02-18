import { TestBed, inject } from '@angular/core/testing';

import { AsynchCollectionService } from './asynch-collection.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualRepeatAngularLibModule } from 'projects/virtual-repeat-angular-lib/src/public_api';

describe('RemoteCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsynchCollectionService],
      imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        VirtualRepeatAngularLibModule],
    });
  });

  it('should be created', inject([AsynchCollectionService], (service: AsynchCollectionService<any>) => {
    expect(service).toBeTruthy();
  }));
});
