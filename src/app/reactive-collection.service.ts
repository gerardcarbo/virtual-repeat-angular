import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';
import { Subject, of, BehaviorSubject, Subscription, Observable, ReplaySubject } from 'rxjs';
import { flatMap, map, filter, catchError, share, takeUntil } from 'rxjs/operators';
import { LoggerService } from 'virtual-repeat-angular/logger.service';
import { IReactiveCollectionFactory, IReactiveCollection } from 'virtual-repeat-angular/virtual-repeat-reactive';
import { throttleTimeUntilChanged } from 'virtual-repeat-angular/rxjs.operators';

@Injectable({
  providedIn: 'root'
})
export class ReactiveCollectionFactory<T> implements IReactiveCollectionFactory<T> {
  constructor(private remoteService: RemoteService, private logger: LoggerService) {
  }

  create(): IReactiveCollection<T> {
    const reactiveCollection = new ReactiveCollectionService<T>(this.remoteService, this.logger);
    reactiveCollection.connect();
    return reactiveCollection;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReactiveCollectionService<T> implements IReactiveCollection<T>, Iterable<T>, Iterator<T>  {
  private _itemsPerPage = 10;
  private _collection = [];
  private _subscription: Subscription;

  private _requestLengthSubject: BehaviorSubject<void>;
  private _requestItemSubject: ReplaySubject<number>;
  private _requestPageSubject: Subject<any>;

  private _requestedItems: {} = {};

  length$: Observable<number>;
  items$: Observable<{ index: number, item: T }>;
  reset$: Subject<boolean>;

  private pages$: Observable<number>;
  _connected = false;

  constructor(private remoteService: RemoteService, private logger: LoggerService) {
  }

  //disable error TS2322: Type 'ReactiveCollectionService<any>' is not assignable to type 'NgIterable<any>'
  [Symbol.iterator](): Iterator<T>
  {
    return <Iterator<T>>this;
  }
  next(...args: [] | [T]): IteratorResult<T, T>
  {
    return null;
  }

  connect() {
    if (this._connected) {
      return;
    }

    this._requestLengthSubject = new BehaviorSubject(null);
    this._requestItemSubject = new ReplaySubject();
    this._requestPageSubject = new Subject();
    this.reset$ = new Subject();

    this.length$ = this._requestLengthSubject.pipe(
      map(() => {
        this.logger.log('requestLengthSubject: enter');
        return this.remoteService.getCount();
      }),
      share() // important -> make it multicast
    );

    this.items$ = this._requestItemSubject.pipe(
      flatMap((index) => {
        this.logger.log('requestItemSubject: enter ' + index);
        if (this._collection[index]) {
          this.logger.log('requestItemSubject: returns ', this._collection[index]);
          return of(this._collection[index]);
        }
        const page = Math.floor(index / this._itemsPerPage);

        this.logger.log('requestItemSubject: request page ' + page);
        this._requestPageSubject.next(page);
        this._requestedItems[index] = index;
        return of(null);
      }),
      filter((item) => item != null),
      catchError((error, caught) => {
        this.logger.log('items$: exception', error);
        return caught;
      }),
      share() // important -> make it multicast
    );

    this.pages$ = this._requestPageSubject.pipe(
      throttleTimeUntilChanged(1000),
      flatMap((page: number) => {
        this.logger.log('requestPageSubject: getPage ' + page);
        return this.remoteService.getPage(page).pipe(
          map((items: any[]) => {
            // check if already received and add to _collection
            this.logger.log('requestPageSubject: filling page ' + page);

            // fill sparse collection
            items.forEach((item, i) => {
              const index = (page * this._itemsPerPage) + i;
              item.title += ' (page: ' + page + ' index:' + index + ')';
              this.logger.log('requestPageSubject: filling item -> ', index, item);
              this._collection[index] = { index, item };
            });

            // return requested items
            Object.keys(this._requestedItems).forEach((index) => {
              if (this._collection[index] !== undefined) {
                this.logger.log('requestPageSubject: _requestItemSubject ', index);
                this._requestItemSubject.next(Number(index));
                delete this._requestedItems[index];
              }
            });
            return page;
          }),
          takeUntil(this.reset$)
        );
      }),
      share()
    );

    this._subscription = this.pages$.subscribe((page) => { // subscription needed to activate observer.
      this.logger.log('pages$: requested', page);
    });

    this._subscription = this.reset$.subscribe(() => { // subscription needed to activate observer.
      this.logger.log('reset$: event');
    });

    this._connected = true;
  }

  disconnect() {
    if (!this._connected) {
      return;
    }

    this._subscription.unsubscribe();
    delete this._requestLengthSubject;
    delete this._requestItemSubject;
    delete this._requestPageSubject;
    delete this.reset$;

    this._connected = false;
  }

  requestLength() {
    this._requestLengthSubject.next(null);
  }

  requestItem(index: number) {
    this.logger.log('requestItem: enter _requestItemSubject', index);
    this._requestItemSubject.next(index);
  }

  reset() {
    this.clean();
    if (this.reset$) { this.reset$.next(true); }
  }

  clean() {
    this._collection.length = 0;
  }
}
