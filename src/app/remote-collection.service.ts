import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { RemoteService } from './remote.service';
import { map, first } from 'rxjs/operators';
import { IAsynchCollection } from 'virtual-repeat-angular-lib/virtual-repeat-asynch';

@Injectable({
  providedIn: 'root'
})
export class RemoteCollectionService implements IAsynchCollection {

  private _itemPerPage = 10;
  private _length = 0;
  private _collection = [];

  constructor(private remoteService: RemoteService) { 
    this._length = this.remoteService.getCount();
  }

  getLength() { return of(this._length) }

  getItem(index: number) {
    if (this._collection[index]) {
      return of(this._collection[index]); //.pipe(first());
    }

    var page = Math.floor(index / this._itemPerPage);
    return this.remoteService.getPage(page)
      .pipe(
        map((items: any[]) => {
          //check if already received
          if (this._collection[index]) {
            return this._collection[index];
          }
          //fill sparse collection
          items.forEach((element, i) => {
            this._collection[(page * this._itemPerPage) + i] = {image: element.thumbnailUrl, content: element.title + "(" + index+ ")"};
          });
          //return item
          return this._collection[index];
        })
        //,first()
      );
  }
}
