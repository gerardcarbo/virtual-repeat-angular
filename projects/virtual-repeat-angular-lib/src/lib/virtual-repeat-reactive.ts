import {
  Directive,
  EmbeddedViewRef,
  Input,
  isDevMode,
  IterableDiffers,
  NgIterable,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
  ViewRef
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { VirtualRepeatBase, VirtualRepeatRow, Deferred } from './virtual-repeat.base';
import { LoggerService } from './logger.service';
import { VirtualRepeatContainer } from './virtual-repeat-container';

export interface IReactiveCollectionFactory<T> {
  create(): IReactiveCollection<T>;
}

export interface IReactiveCollection<T> {
  length$: Observable<number>;
  items$: Observable<{ index: number; item: T }>;
  reset$: Observable<boolean>;

  connect(): void;
  disconnect(): void;

  reset(): void;

  requestLength(): void;
  requestItem(index: number): void;
}

interface ForDirectiveContext<T> {
  $implicit: T;
  index: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
  count: number;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[virtualRepeatReactive]'
})
// tslint:disable-next-line:directive-class-suffix
export class VirtualRepeatReactive<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {
  static ngTemplateContextGuard<T>(
    dir: VirtualRepeatReactive<T>,
    ctx: unknown
  ): ctx is ForDirectiveContext<T> {
    return true;
  }

  @Input()
  set virtualRepeatReactiveForTrackBy(fn: TrackByFunction<T>) {
    if (isDevMode() && fn != null && typeof fn !== 'function') {
      if (<any>console && <any>console.warn) {
        console.warn(
          `trackBy must be a function, but received ${JSON.stringify(fn)}.
          See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation
          for more information.`
        );
      }
    }
    this._trackByFn = fn;
  }

  get virtualRepeatReactiveForTrackBy(): TrackByFunction<T> {
    return this._trackByFn;
  }

  @Input()
  set virtualRepeatReactiveForTemplate(value: TemplateRef<VirtualRepeatRow>) {
    if (value) {
      this._template = value;
    }
  }

  @Input() virtualRepeatReactiveOf: NgIterable<T>;

  constructor(
    virtualRepeatContainer: VirtualRepeatContainer,
    differs: IterableDiffers,
    template: TemplateRef<VirtualRepeatRow>,
    viewContainerRef: ViewContainerRef,
    logger: LoggerService
  ) {
    super(virtualRepeatContainer, differs, template, viewContainerRef, logger);
  }

  protected _collection: IReactiveCollection<T>;

  private _viewDeferreds: { [index: number]: Deferred<ViewRef> } = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ('virtualRepeatReactiveOf' in changes) {
      this.detachAllViews();

      // React on virtualRepeatReactiveOf only once all inputs have been initialized
      let value = changes['virtualRepeatReactiveOf'].currentValue;
      if (!value) {
        return;
      }

      if (value.create !== undefined) {
        // is factory?
        value = value.create(); // create reactive collection
      }
      this._collection = value;
      this._collection.connect();
      this.logger.log('ngOnChanges: this._collection asigned.');

      this._subscription.add(
        this._collection.length$.subscribe(
          lenght => this.onLength(lenght),
          error => {
            this.onLength(0);
          }
        )
      );
      this._subscription.add(
        this._collection.items$.subscribe(data => {
          try {
            this.onItem(data);
          } catch (exc) {
            this.logger.log('onItem: Exception', exc);
          }
        })
      );

      this._subscription.add(
        this._collection.reset$.subscribe(() => {
          this.reset();
        })
      );

      this.requestMeasure.next();
    }
  }

  protected connect() {
    super.connect();
  }

  protected disconnect() {
    super.disconnect();
    if (!!this._collection) {
      this._collection.disconnect();
    }
  }

  protected measure() {
    this.logger.log('measure: enter');
    if (!this._collection) {
      this.logger.log('measure: !this._collection. Exit');
      return;
    }

    this._virtualRepeatContainer.processing = true;

    this.logger.log('measure: requestLength -> onLength');
    this._collection.requestLength();
  }

  onLength(length: number) {
    this.logger.log('onLength: enter', this._collectionLength, length);

    this._isInMeasure = true;
    this._collectionLength = length;
    this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer.getRowHeight() * length;
    // calculate a approximate number of which a view can contain
    this._isInMeasure = false;
    this.logger.log('onLength: requestLayout');
    if (length > 0) {
      this.requestLayout.next();
    } else {
      this._virtualRepeatContainer.processing = false;
    }
  }

  protected createView(index: number, addBefore: boolean): Promise<ViewRef> {
    this.logger.log('createView: requestItem: ', index);
    let view;
    if (!this._virtualRepeatContainer._autoHeightVariable && !!(view = this._recycler.recoverView())) {
      // recover recycled views. Will be filled with new item once received.
      const embedView = <EmbeddedViewRef<VirtualRepeatRow>>view;
      embedView.context.index = index;
      embedView.rootNodes[0].style.height = this._virtualRepeatContainer.getRowHeight() + 'px';
      embedView.context.$implicit = this.emptyItem(embedView.context.$implicit);
      embedView.context.recycled = true;
      this._viewContainerRef.insert(view, addBefore ? 0 : undefined);
      view.reattach();
    }

    this.logger.log('createView: _viewDeferreds add: ', index);
    this._viewDeferreds[index] = new Deferred();
    this._collection.requestItem(index);

    return this._viewDeferreds[index].promise;
  }

  onItem(data: { index: number; item: T }) {
    const { index, item } = data;
    this.logger.log('onItem: enter', index, item);
    const view = this.createViewForItem(index, item);
    if (this._viewDeferreds[index]) {
      this.logger.log('onItem: _viewPromises resolve: ', index);
      this._viewDeferreds[index].resolve(view);
    }
  }

  onProcessing(processing: boolean): any {
    if (!processing) {
      // processing finished
      this.logger.log('onProcessing: _viewDeferreds deleting');
      this._viewDeferreds = [];
    }
    super.onProcessing(processing);
  }
}
