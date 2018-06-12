import { TestBed, inject } from '@angular/core/testing';

import { RemoteCollectionService } from './remote-collection.service';

describe('RemoteCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemoteCollectionService]
    });
  });

  it('should be created', inject([RemoteCollectionService], (service: RemoteCollectionService) => {
    expect(service).toBeTruthy();
  }));
});
