import { TestBed, inject } from '@angular/core/testing';

import { RemoteService } from './remote.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualRepeatAngularLibModule } from 'projects/virtual-repeat-angular-lib/src/public_api';

describe('RemoteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemoteService],
      imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        VirtualRepeatAngularLibModule],
    });
  });

  it('should be created', inject([RemoteService], (service: RemoteService) => {
    expect(service).toBeTruthy();
  }));
});
