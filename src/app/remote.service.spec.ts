import { TestBed, inject } from '@angular/core/testing';

import { RemoteService } from './remote.service';

describe('RemoteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemoteService]
    });
  });

  it('should be created', inject([RemoteService], (service: RemoteService) => {
    expect(service).toBeTruthy();
  }));
});
