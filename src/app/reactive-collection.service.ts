import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';
import { Subject, of, BehaviorSubject, Subscription, Observable, ReplaySubject } from 'rxjs';
import { flatMap, map, distinct, filter, throttleTime, distinctUntilChanged } from 'rxjs/operators';

import { IReactiveCollection } from 'virtual-repeat-angular/virtual-repeat-reactive';
//import { IReactiveCollection } from 'virtual-repeat-angular';

@Injectable({
  providedIn: 'root'
})
export class ReactiveCollectionService<T> implements IReactiveCollection<T> {
  private _itemsPerPage = 10;
  private _collection = [];
  private _subscriptions: Subscription = new Subscription();
  private _subscription: Subscription;

  private _requestLengthSubject: BehaviorSubject<any> = new BehaviorSubject(0);
  private _requestItemSubject: ReplaySubject<any> = new ReplaySubject();
  private _requestPageSubject: Subject<any> = new Subject();

  private _requestedItems: {} = {};

  length$:Observable<number> = this._requestLengthSubject.pipe(
    map(() => {
      console.log("requestLengthSubject: enter");
      return this.remoteService.getCount();
    })
  );

  items$:Observable<{ index: number, item: T }> = this._requestItemSubject.pipe(
    flatMap((index) => {
      console.log("requestItemSubject: enter " + index);
      if (this._collection[index]) {
        console.log("requestItemSubject: returns ", this._collection[index]);
        return of(this._collection[index]);
      }
      var page = Math.floor(index / this._itemsPerPage);

      console.log("requestItemSubject: request page " + page);
      this._requestPageSubject.next(page);
      this._requestedItems[index] = index;
      return of(null);
    }),
    filter((item) => item != null)
  );

  private pages$:Observable<number> = this._requestPageSubject.pipe(
    distinctUntilChanged(),
    flatMap((page) => {
      console.log("requestPageSubject: getPage " + page);
      return this.remoteService.getPage(page).pipe(
        map((items: any[]) => {
          //check if already received
          console.log("requestPageSubject: filling page " + page);
          //fill sparse collection
          items.forEach((item, i) => {
            var index = (page * this._itemsPerPage) + i;
            item.title += " (page: " + page + " index:" + index + ")"
            console.log("requestPageSubject: filling item -> ", index, item);
            this._collection[index] = { index, item };
          });
          
          //return requested items
          Object.keys(this._requestedItems).forEach((index) => {
            if(this._collection[index] != undefined){
              console.log("requestPageSubject: returning item ",index);
              this._requestItemSubject.next(index);
              delete this._requestedItems[index];
            }
          });
          return page;
        })
      )
    })
  );

  constructor(private remoteService: RemoteService) {
  }

  connect() {
    this._subscription=this.pages$.subscribe((page) => {
      console.log("pages$: requested", page); 
    }); 
  }

  disconnect() {
    this._subscription.unsubscribe();
  }

  requestLength() {
    this._requestLengthSubject.next(null);
  }

  requestItem(index: number) {
    console.log('requestItem: enter', index);
    this._requestItemSubject.next(index);
  }


}
