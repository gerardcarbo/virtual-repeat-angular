import { TestBed, inject } from '@angular/core/testing';

import { ReactiveCollectionService } from './reactive-collection.service';

describe('ReactiveCollectionServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReactiveCollectionService]
    });
  });

  it('should be created', inject([ReactiveCollectionService], (service: ReactiveCollectionService<any>) => {
    expect(service).toBeTruthy();
  }));
});
