import {
  EmbeddedViewRef,
  IterableDiffer,
  IterableDiffers,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
  ViewRef,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Subscription, Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, debounceTime, tap, throttleTime, map } from 'rxjs/operators';
import {
  VirtualRepeatContainer,
  SCROLL_STATE
} from './virtual-repeat-container';
import { LoggerService } from './logger.service';

export class Deferred<T> {
  public promise: Promise<T>;
  public resolve: (value: T) => void;
  public reject: (value: T) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    Object.freeze(this);
  }
}

export class VirtualRepeatRow {
  constructor(
    public $implicit: any,
    public index: number,
    public count: number
  ) {}

  get first(): boolean {
    return this.index === 0;
  }

  get last(): boolean {
    return this.index === this.count - 1;
  }

  get even(): boolean {
    return this.index % 2 === 0;
  }

  get odd(): boolean {
    return !this.even;
  }

  previousDisplay: string;
  markedToBeRemoved: boolean;
  recycled: boolean;
}

export class Recycler {
  private _limit = 0;
  private _scrapViews: ViewRef[] = [];

  constructor(limit: number = 0) {
    this._limit = limit;
  }

  length() {
    return this._scrapViews.length;
  }

  recoverView(): EmbeddedViewRef<VirtualRepeatRow> {
    return this._scrapViews.pop() as EmbeddedViewRef<VirtualRepeatRow>;
  }

  recycleView(view: ViewRef) {
    view.detach();
    this._scrapViews.push(view);
  }

  /**
   * scrap view count should not exceed the number of current attached views.
   */
  pruneScrapViews() {
    if (this._limit <= 1) {
      return;
    }
    while (this._scrapViews.length > this._limit) {
      this._scrapViews.pop().destroy();
    }
  }

  setScrapViewsLimit(limit: number) {
    this._limit = limit;
    this.pruneScrapViews();
  }

  clean() {
    this._scrapViews.forEach((view: ViewRef) => {
      view.destroy();
    });
    this._scrapViews = [];
  }
}

export interface IVirtualRepeat {
  reset(): void;
}

export abstract class VirtualRepeatBase<T>
  implements IVirtualRepeat, OnInit, OnDestroy {
  protected _differ: IterableDiffer<T>;
  protected _trackByFn: TrackByFunction<T>;
  protected _subscription: Subscription = new Subscription();
  /**
   * scroll offset of y-axis in pixel
   */
  protected _scrollY = 0;
  /**
   * current first item index in collection
   */
  protected _firstItemIndex: number;
  /**
   * current last item index in collection
   */
  protected _lastItemIndex: number;
  /**
   * first requested item index in collection
   */
  protected _firstRequestedItemIndex: number;
  /**
   * last requested item index in collection
   */
  protected _lastRequestedItemIndex: number;
  /**
   * items inserted after and before the view area
   */
  protected _guardItems = 10;

  protected _containerWidth: number;
  protected _containerHeight: number;

  protected _isInLayout = false;

  protected _isInMeasure = false;

  protected _pendingMeasurement: any;

  protected _collectionLength = -1;

  protected _recycler: Recycler;

  protected _markedToBeRemovedCount: number;

  protected _fullScroll: boolean;
  protected _processTimeout = 5000;
  protected _doProcessTimeout: any;

  public requestMeasure: Subject<any> = new Subject();
  protected _requestMeasureFiltered: Observable<any> = this.requestMeasure.pipe(
    tap(() => {
      this.logger.log('requestMeasureFiltered: requested');
    }),
    debounceTime(60),
    filter(() => {
      this.logger.log(
        `requestMeasureFiltered: enter isInMeasure: ` +
          `${this._isInMeasure} isInLayout: ${this._isInLayout}`
      );
      if (this._isInMeasure || this._isInLayout) {
        this.logger.log('requestMeasureFiltered: retrying...');
        setTimeout(() => {
          this.requestMeasure.next();
        }, 500);
      }
      return !this._isInMeasure && !this._isInLayout;
    })
  );

  public requestLayout: Subject<any> = new Subject();
  protected _requestLayoutFiltered: Observable<any> = this.requestLayout.pipe(
    tap(() => {
      this.logger.log('requestLayoutFiltered: requested');
    }),
    filter(() => {
      this.logger.log(
        `requestLayoutFiltered: enter isInMeasure: ${
          this._isInMeasure
        } isInLayout: ${this._isInLayout}`
      );
      if (this._isInMeasure || this._isInLayout) {
        this.logger.log('requestLayoutFiltered: retrying...');
        setTimeout(() => {
          this.requestLayout.next();
        }, 500);
      }
      return !this._isInMeasure && !this._isInLayout;
    })
  );

  constructor(
    protected _virtualRepeatContainer: VirtualRepeatContainer,
    protected _differs: IterableDiffers,
    protected _template: TemplateRef<VirtualRepeatRow>,
    protected _viewContainerRef: ViewContainerRef,
    protected logger: LoggerService
  ) {
    this._virtualRepeatContainer.virtualRepeat = this;
  }

  ngOnInit(): void {
    this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  protected connect() {
    this._firstRequestedItemIndex = this._lastRequestedItemIndex = undefined;
    this._virtualRepeatContainer._autoHeightComputed = false;
    this._recycler = new Recycler();
    this.requestMeasure.next();

    this._subscription.add(
      this._requestMeasureFiltered.subscribe(() => {
        this.measure();
      })
    );

    this._subscription.add(
      this._requestLayoutFiltered.subscribe(() => {
        this.layout();
      })
    );

    this._subscription.add(
      this._virtualRepeatContainer.scrollPosition
        .pipe(
          debounceTime(60),
          filter(scrollY => {
            return (
              scrollY === 0 ||
              Math.abs(scrollY - this._scrollY) >=
                (this._virtualRepeatContainer.getRowHeight() * this._guardItems) / 2
            );
          })
        )
        .subscribe(scrollY => {
          this.logger.log('scrollPosition: ', scrollY);
          this._scrollY = scrollY;
          if (scrollY >= 0 && this._collectionLength !== -1) {
            this.requestLayout.next();
          }
        })
    );

    this._subscription.add(
      this._virtualRepeatContainer.sizeChange.subscribe(([width, height]) => {
        this.logger.log('sizeChange: ', width, height);
        this._containerWidth = width;
        this._containerHeight = height;
        if (height > 0) {
          this.requestMeasure.next();
        }
      })
    );

    this._subscription.add(
      this._virtualRepeatContainer.processingRaw$.subscribe(processing =>
        this.onProcessing(processing)
      )
    );
  }

  protected disconnect() {
    this._subscription.unsubscribe();
    this._recycler.clean();
  }

  public reset() {
    this._collectionLength = -1;
    this.detachAllViews();
    this.requestMeasure.next();
  }

  protected abstract createView(
    index: number,
    addBefore: boolean
  ): Promise<ViewRef>;

  protected abstract measure(): void;

  protected detachAllViews() {
    this._viewContainerRef.clear();
    this._isInLayout = false;
    return;
  }

  protected emptyItem(item: any) {
    const o = Array.isArray(item) ? [] : {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const t = typeof item[key];
        o[key] = t === 'object' ? this.emptyItem(item[key]) : undefined;
      }
    }
    return o;
  }

  protected layout() {
    this.logger.log('layout: on layout');
    this._virtualRepeatContainer.processing = true;
    this._isInLayout = true;

    const { width, height } = this._virtualRepeatContainer.getContainerSize();
    this._containerWidth = width;
    this._containerHeight = height;

    if (this._collectionLength <= 0) {
      this.logger.log('layout: this._isInLayout = false. detachAllViews');
      this.detachAllViews();
      this.processingDone();
      return;
    }
    this.findRequestedIndexesRange();
    this.removeViews();
    this.createViews().then(() => {
      clearTimeout(this._doProcessTimeout);
      this.processingDone();
    });
    this._doProcessTimeout = setTimeout(() => {
      this.processingDone();
    }, this._processTimeout);
  }

  private processingDone() {
    this._virtualRepeatContainer.processing = false;
    this._isInLayout = false;
    this._recycler.pruneScrapViews();
  }

  protected findRequestedIndexesRange() {
    let firstPosition;

    this._firstItemIndex = this._firstRequestedItemIndex;
    this._lastItemIndex = this._lastRequestedItemIndex;
    this.logger.log(
      `findRequestedIndexesRange: _autoHeightVariable: ${
        this._virtualRepeatContainer._autoHeightVariable
      } firstItemPosition: ${this._firstItemIndex}`
    );

    if (this._virtualRepeatContainer._autoHeightVariable) {
      this._virtualRepeatContainer.holderHeight =
        this._virtualRepeatContainer.getRowHeight() * this._collectionLength;

      firstPosition = Math.floor(
        this._collectionLength *
          (this._scrollY / this._virtualRepeatContainer.holderHeight)
      );
      const lastPosition =
        Math.ceil(
          this._containerHeight / this._virtualRepeatContainer.getRowHeight()
        ) + firstPosition;
      this._firstRequestedItemIndex = Math.max(
        firstPosition - this._guardItems,
        0
      );
      this._lastRequestedItemIndex = Math.min(
        lastPosition + this._guardItems,
        this._collectionLength - 1
      );
      this.logger.log(
        `findRequestedIndexesRange: _autoHeightVariable scrollY: ${
          this._scrollY
        } holderHeight: ${this._virtualRepeatContainer.holderHeight}`
      );
      this.logger.log(
        `findRequestedIndexesRange: _autoHeightVariable firstRequestedItemPosition: ${
          this._firstRequestedItemIndex
        } lastRequestedItemPosition: ${this._lastRequestedItemIndex}`
      );
    } else {
      firstPosition = Math.floor(
        this._scrollY / this._virtualRepeatContainer.getRowHeight()
      );
      const firstPositionOffset =
        this._scrollY - firstPosition * this._virtualRepeatContainer.getRowHeight();
      const lastPosition =
        Math.ceil(
          (this._containerHeight + firstPositionOffset) /
            this._virtualRepeatContainer.getRowHeight()
        ) + firstPosition;
      this._firstRequestedItemIndex = Math.max(
        firstPosition - this._guardItems,
        0
      );
      this._lastRequestedItemIndex = Math.min(
        lastPosition + this._guardItems,
        this._collectionLength - 1
      );
      if (this._lastRequestedItemIndex - this._firstRequestedItemIndex > 50) {
        this._lastRequestedItemIndex = this._firstRequestedItemIndex + 50;
      }

      this._virtualRepeatContainer.translateY =
        this._firstRequestedItemIndex * this._virtualRepeatContainer.getRowHeight();
      this.logger.log(
        `findRequestedIndexesRange: translateY: ${
          this._virtualRepeatContainer.translateY
        } rowHeight: ${this._virtualRepeatContainer.getRowHeight()}`
      );
      this.logger.log(
        `findRequestedIndexesRange: firstRequestedItemPosition: ${
          this._firstRequestedItemIndex
        } lastRequestedItemPosition: ${this._lastRequestedItemIndex}`
      );
    }
  }

  protected removeViews() {
    this._markedToBeRemovedCount = 0;
    if (this._viewContainerRef.length > 0) {
      this.logger.log('removeViews: length > 0');
      for (let i = 0; i < this._viewContainerRef.length; i++) {
        const view = <EmbeddedViewRef<VirtualRepeatRow>>(
          this._viewContainerRef.get(i)
        );
        const viewIndex = view.context.index;
        if (
          viewIndex > this._lastRequestedItemIndex ||
          viewIndex < this._firstRequestedItemIndex
        ) {
          if (this._virtualRepeatContainer._autoHeightVariable) {
            const viewElement: HTMLElement = view.rootNodes[0];
            view.context.markedToBeRemoved = true;
            this._markedToBeRemovedCount++;
            this.logger.log(
              'removeViews: _autoHeightVariable markedToBeRemoved',
              viewIndex
            );
          } else {
            this.logger.log('removeViews: recycleView ', viewIndex);
            this._recycler.recycleView(view);
            this._viewContainerRef.detach(i);
            i--;
          }
        }
      }

      this.logger.log('removeViews: recycler length', this._recycler.length());
    }
  }

  protected createViews(): Promise<ViewRef[]> {
    const promises = [];
    if (
      this._viewContainerRef.length > 0 &&
      this._markedToBeRemovedCount < this._viewContainerRef.length
    ) {
      this._fullScroll = false;
      this.logger.log(
        `createViews: length > 0, _firstItemPosition: ${
          this._firstItemIndex
        } _lastItemPosition: ${this._lastItemIndex}`
      );
      this.logger.log(
        `createViews: length > 0, _firstRequestedItemPosition: ${
          this._firstRequestedItemIndex
        } _lastRequestedItemPosition: ${this._lastRequestedItemIndex}`
      );
      for (
        let i = this._firstItemIndex - 1;
        i >= this._firstRequestedItemIndex;
        i--
      ) {
        this.logger.log('createViews: getView -- ', i);
        promises.push(this.createView(i, true));
      }
      for (
        let i = this._lastItemIndex + 1;
        i <= this._lastRequestedItemIndex;
        i++
      ) {
        this.logger.log('createViews: getView  ++ ', i);
        promises.push(this.createView(i, false));
      }
    } else {
      this.logger.log('createViews: length == 0');
      this._fullScroll = true;
      for (
        let i = this._firstRequestedItemIndex;
        i <= this._lastRequestedItemIndex;
        i++
      ) {
        promises.push(this.createView(i, false));
      }
    }

    return Promise.all(promises);
  }

  protected prepareView(index: number, item: T) {
    let view;
    if ((view = this._recycler.recoverView())) {
      view.context.$implicit = item;
      view.context.index = index;
      view.context.count = this._collectionLength;
      view.context.recycled = true;
      view.reattach();
    } else {
      view = this._template.createEmbeddedView(
        new VirtualRepeatRow(item, index, this._collectionLength)
      );
      view.context.recycled = false;
    }
    return view;
  }

  protected createViewForItem(index: number, item: T): ViewRef {
    this.logger.log(
      `createViewForItem: _firstItemPosition: ${
        this._firstItemIndex
      } _firstRequestedItemPosition: ${this._firstRequestedItemIndex} length: ${
        this._viewContainerRef.length
      }`
    );
    let containerPos = index - (this._firstItemIndex || 0);
    if (Math.abs(containerPos) > this._guardItems) {
      containerPos = 0; // out of previous range
    }
    this.logger.log(
      `createViewForItem: create containerPos: ${containerPos} index: ${index}`
    );
    let view: ViewRef = null;
    if (this._viewContainerRef.length === 0) {
      view = this.prepareView(index, item);
      this._viewContainerRef.insert(view);
    } else {
      let inserted = false;
      if (containerPos >= 0) {
        // insert at the end
        for (
          let containerIndex = this._viewContainerRef.length - 1;
          containerIndex >= 0;
          containerIndex--
        ) {
          const viewIndex = (<EmbeddedViewRef<VirtualRepeatRow>>(
            this._viewContainerRef.get(containerIndex)
          )).context.index;
          // this.logger.log(`createViewForItem: checking ${viewIndex} ++`);
          if (index === viewIndex) {
            this.logger.log(`createViewForItem: reasign ${viewIndex} ++`);
            view = this._viewContainerRef.get(containerIndex);
            (<EmbeddedViewRef<VirtualRepeatRow>>view).context.$implicit = item;
            view.reattach();
            inserted = true;
            break;
          } else if (index > viewIndex) {
            view = this.prepareView(index, item);
            this.logger.log(
              `createViewForItem: inserting in ${containerIndex + 1} ++`
            );
            this._viewContainerRef.insert(view, containerIndex + 1);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          view = this.prepareView(index, item);
          this.logger.log(`createViewForItem: inserting in first +++`);
          this._viewContainerRef.insert(view, 0);
        }
      } else {
        // insert at the beginning
        for (
          let containerIndex = 0;
          containerIndex < this._viewContainerRef.length;
          containerIndex++
        ) {
          const viewIndex = (<EmbeddedViewRef<VirtualRepeatRow>>(
            this._viewContainerRef.get(containerIndex)
          )).context.index;
          // this.logger.log(`createViewForItem: checking ${viewIndex} --`);
          if (index === viewIndex) {
            this.logger.log(
              `createViewForItem: reasign ${index} at ${containerIndex} --`,
              item
            );
            view = this._viewContainerRef.get(containerIndex);
            (<EmbeddedViewRef<VirtualRepeatRow>>view).context.$implicit = item;
            view.reattach();
            inserted = true;
            break;
          } else if (index < viewIndex) {
            view = this.prepareView(index, item);
            this.logger.log(
              `createViewForItem: inserting in ${containerIndex} --`
            );
            this._viewContainerRef.insert(view, containerIndex);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          view = this.prepareView(index, item);
          this.logger.log(`createViewForItem: inserting in last ---`);
          this._viewContainerRef.insert(view);
        }
      }
    }

    if (view) {
      this.applyStyles(index, view as EmbeddedViewRef<VirtualRepeatRow>);
    }

    return view;
  }

  protected applyStyles(
    index: number,
    view: EmbeddedViewRef<VirtualRepeatRow>
  ) {
    const viewContent = view.rootNodes[0];
    if (!this._virtualRepeatContainer._autoHeight) {
      viewContent.style.height = `${this._virtualRepeatContainer.getRowHeight()}px`;
    } else {
      viewContent.style.height = undefined;
    }
    viewContent.style.boxSizing = 'border-box';

    if (this._virtualRepeatContainer._autoHeightVariable) {
      view.context.previousDisplay = viewContent.style.display;
      viewContent.style.display = 'none'; // will be shown when processing finished
      this.logger.log(
        `applyStyles: _autoHeightVariable creaded view on ${index} recycled: ${
          view.context.recycled
        }`
      );
    }
  }

  onProcessing(processing: boolean): any {
    if (processing === false) {
      // processing finished
      this.logger.log('onProcessing: finished. Dispatching layout');
      window.requestAnimationFrame(() => {
        this.logger.log('onProcessing: inside');
        this.dispatchLayout();
        this.logger.log(
          'onProcessing: layout done rowHeight',
          this._virtualRepeatContainer.getRowHeight()
        );
      });
    }
  }

  private dispatchLayout() {
    let totalHeight = 0;
    let totalRemovedHeight = 0;
    let totalAddedHeight = 0;
    let guardHeight = 0;
    let meanHeight = 0;

    if (this._viewContainerRef.length === 0) { return; }

    if (this._virtualRepeatContainer._autoHeight) {
      if (this._virtualRepeatContainer._autoHeightVariable) {
        this.logger.log(
          `dispatchLayout: _autoHeightVariable enter ${
            this._viewContainerRef.length
          }`
        );
        // show / recycle views in _autoHeightVariable mode
        for (
          let containerIndex = 0;
          containerIndex < this._viewContainerRef.length;
          containerIndex++
        ) {
          const view = <EmbeddedViewRef<VirtualRepeatRow>>(
            this._viewContainerRef.get(containerIndex)
          );
          const viewElement: HTMLElement = view.rootNodes[0];
          if (view.context.previousDisplay !== undefined) {
            viewElement.style.display = view.context.previousDisplay;
            this.logger.log(
              `dispatchLayout: _autoHeightVariable showing ${
                view.context.index
              }`
            );
          }
          if (view.context.markedToBeRemoved) {
            totalRemovedHeight += this.getElementHeight(viewElement);
            this._recycler.recycleView(view);
            this._viewContainerRef.detach(containerIndex);
            this.logger.log(
              `dispatchLayout: _autoHeightVariable removing ${
                view.context.index
              } recycler lenght: ${this._recycler.length()}`
            );
            containerIndex--;
            delete view.context.markedToBeRemoved;
          }
        }
      }

      // compute meanHeight
      for (
        let containerIndex = 0;
        containerIndex < this._viewContainerRef.length;
        containerIndex++
      ) {
        const view = this._viewContainerRef.get(
          containerIndex
        ) as EmbeddedViewRef<VirtualRepeatRow>;
        const viewElement: HTMLElement = view.rootNodes[0];

        const height = this.getElementHeight(viewElement);
        this.logger.log(
          `dispatchLayout: index: ${containerIndex} height: ${height}`
        );
        totalHeight += height;
        if (containerIndex < this._guardItems) {
          guardHeight += height;
        }

        if (this._virtualRepeatContainer._autoHeightVariable) {
          if (view.context.previousDisplay !== undefined) {
            this.logger.log(
              `dispatchLayout: totalAddedHeight: ${totalAddedHeight}`
            );
            totalAddedHeight += height;
            if (
              this._virtualRepeatContainer._autoHeightVariableData.itemsCount <
              this._collectionLength
            ) {
              this._virtualRepeatContainer._autoHeightVariableData.totalHeight += height;
              this._virtualRepeatContainer._autoHeightVariableData.itemsCount++;
            }
            delete view.context.previousDisplay;
          }
        }
      }
      meanHeight = totalHeight / this._viewContainerRef.length;

      if (!this._virtualRepeatContainer._autoHeightComputed) {
        this._virtualRepeatContainer.rowHeight = meanHeight;
        this.logger.log(
          'dispatchLayout: autoHeight rowHeight updated ' + meanHeight
        );
        this._virtualRepeatContainer._autoHeightComputed = true;
        this.requestMeasure.next();
      } else if (meanHeight !== this._virtualRepeatContainer.getRowHeight()) {
        this._virtualRepeatContainer._autoHeightVariable = true;
        this.logger.log(
          'dispatchLayout: autoHeightVariable rowHeight updated ' +
            this._virtualRepeatContainer.getRowHeight()
        );
      }

      if (this._virtualRepeatContainer._autoHeightVariable) {
        if (
          this._virtualRepeatContainer._autoHeightVariableData.itemsCount === 0
        ) {
          // first page
          this._virtualRepeatContainer._autoHeightVariableData.totalHeight = totalHeight;
          this._virtualRepeatContainer._autoHeightVariableData.itemsCount = this._viewContainerRef.length;
        }
        this._virtualRepeatContainer.rowHeight =
          this._virtualRepeatContainer._autoHeightVariableData.totalHeight /
          this._virtualRepeatContainer._autoHeightVariableData.itemsCount;

        if (this._fullScroll) {
          this._virtualRepeatContainer.translateY = this._scrollY - guardHeight;
        } else {
          // partial scroll
          this.logger.log(`dispatchLayout: _autoHeightVariable partial scroll`);
          let translateY =
            this._virtualRepeatContainer.translateY +
            (this._virtualRepeatContainer.currentScrollState ===
            SCROLL_STATE.SCROLLING_DOWN
              ? totalRemovedHeight
              : -totalAddedHeight);
          // check out of scroll
          const offset = this._scrollY - translateY;
          if (offset > guardHeight * 1.5 || offset < guardHeight * 0.5) {
            translateY = this._scrollY - guardHeight;
            this.logger.log(
              `dispatchLayout: _autoHeightVariable out of scroll adjusted`
            );
          }
          this._virtualRepeatContainer.translateY = translateY;
        }

        if (this._scrollY === 0) {
          // adjust on limits
          this._virtualRepeatContainer.translateY = 0;
        }

        this.logger.log(`dispatchLayout: _autoHeightVariable rowHeight:${
          this._virtualRepeatContainer.getRowHeight()
        }
                         scrollY: ${this._scrollY} scrollState: ${
          this._virtualRepeatContainer.currentScrollState
        }
                         totalRemovedHeight: ${totalRemovedHeight} totalAddedHeight: ${totalAddedHeight}
                         translateY: ${
                           this._virtualRepeatContainer.translateY
                         }`);
      }
    }
  }

  private getElementHeight(viewElement: HTMLElement) {
    return viewElement.offsetHeight || viewElement.children['0'].clientHeight;
  }
}
