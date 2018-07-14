import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';
import { map } from 'rxjs/operators';

import { IAsynchCollection } from 'virtual-repeat-angular/virtual-repeat-asynch';
import { LoggerService } from 'virtual-repeat-angular/logger.service';
//import { IAsynchCollection, LoggerService} from 'virtual-repeat-angular';

@Injectable({
  providedIn: 'root'
})
export class AsynchCollectionService<T> implements IAsynchCollection<T> {

  private _itemsPerPage = 10;
  private _collection = [];
  private _lenghtPromise: Promise<number>;

  constructor(private remoteService: RemoteService, private logger:LoggerService) {
    this._lenghtPromise = Promise.resolve(this.remoteService.getCount());
  }

  getLength(): Promise<number> {
    this.logger.log("AsynchCollectionService: getLength")
    return this._lenghtPromise;
  }

  getItem(index: number): Promise<T> {
    this.logger.log("AsynchCollectionService: getItem ", index)
    if (this._collection[index]) {
      this.logger.log("AsynchCollectionService: returns ", this._collection[index])
      return Promise.resolve(this._collection[index]);
    }

    var page = Math.floor(index / this._itemsPerPage);
    return this.remoteService.getPage(page)
      .pipe(
        map((items: any[]) => {
          //check if already received
          if (!this._collection[index]) {
            //fill sparse collection
            items.forEach((item, i) => {
              item.title += " (page: " + page + " index:" + ((page * this._itemsPerPage) + i) + ")";
              this._collection[(page * this._itemsPerPage) + i] = item;
            });
          }

          //return item
          this.logger.log("AsynchCollectionService: returns paged", this._collection[index])
          return this._collection[index];
        })
      ).toPromise();
  }
}
