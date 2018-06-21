import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';
import { map } from 'rxjs/operators';

import { IAsynchCollection } from 'virtual-repeat-angular/virtual-repeat-asynch';
//import { IAsynchCollection } from 'virtual-repeat-angular';

@Injectable({
  providedIn: 'root'
})
export class AsynchCollectionService<T> implements IAsynchCollection<T> {

  private _itemsPerPage = 10;
  private _length = 0;
  private _collection = [];
  private _lenghtPromise: Promise<number>;

  constructor(private remoteService: RemoteService) {
    this._length = this.remoteService.getCount();
    this._lenghtPromise = Promise.resolve(this._length);
  }

  getLength() {
    console.log("AsynchCollectionService: getLength")
    return this._lenghtPromise;
  }

  getItem(index: number) {
    console.log("AsynchCollectionService: getItem ", index)
    if (this._collection[index]) {
      console.log("AsynchCollectionService: returns ", this._collection[index])
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
          console.log("AsynchCollectionService: returns paged", this._collection[index])
          return this._collection[index];
        })
      ).toPromise();
  }
}
