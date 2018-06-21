import { TestBed, inject } from '@angular/core/testing';

import { AsynchCollectionService } from './asynch-collection.service';

describe('RemoteCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsynchCollectionService]
    });
  });

  it('should be created', inject([AsynchCollectionService], (service: AsynchCollectionService<any>) => {
    expect(service).toBeTruthy();
  }));
});
