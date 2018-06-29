import {
    EmbeddedViewRef,
    IterableDiffer,
    IterableDiffers,
    TemplateRef,
    TrackByFunction,
    ViewContainerRef,
    ViewRef
} from '@angular/core';

import { Subscription, Observable, Subject } from 'rxjs';
import { filter, debounceTime, tap, throttleTime } from 'rxjs/operators';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { LoggerService } from './logger.service';

export class VirtualRepeatRow {
    constructor(public $implicit: any, public index: number, public count: number) {
    }

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
}

export class Recycler {
    private _limit: number = 0;
    private _scrapViews: ViewRef[] = [];

    constructor(limit = 0) {
        this._limit = limit;
    }

    length() {
        return this._scrapViews.length;
    }

    recoverView(): ViewRef | null {
        return this._scrapViews.pop();
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

export abstract class VirtualRepeatBase<T> {
    protected _differ: IterableDiffer<T>;
    protected _trackByFn: TrackByFunction<T>;
    protected _subscription: Subscription = new Subscription();
    /**
     * scroll offset of y-axis in pixel
     */
    protected _scrollY: number = 0;
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
    protected _guardItems: number = 10;

    protected _containerWidth: number;
    protected _containerHeight: number;

    protected _isInLayout: boolean = false;

    protected _isInMeasure: boolean = false;

    protected _pendingMeasurement: any;

    protected _collectionLength = -1;

    protected _recycler: Recycler;

    requestMeasure: Subject<any> = new Subject();
    requestMeasureFiltered: Observable<any> = this.requestMeasure.pipe(
        tap(() => {
            this.logger.log("requestMeasureFiltered: requested");
        }),
        debounceTime(60),
        filter(() => {
            this.logger.log(`requestMeasureFiltered: enter isInMeasure: ${this._isInMeasure} isInLayout: ${this._isInLayout}`);
            if (this._isInMeasure || this._isInLayout) {
                this.logger.log("requestMeasureFiltered: retrying...");
                setTimeout(() => {
                    this.requestMeasure.next();
                }, 60);
            }
            return !this._isInMeasure && !this._isInLayout;
        })
    );

    requestLayout: Subject<any> = new Subject();
    requestLayoutFiltered: Observable<any> = this.requestLayout.pipe(
        tap(() => {
            this.logger.log("requestLayoutFiltered: requested");
        }),
        filter(() => {
            this.logger.log(`requestLayoutFiltered: enter isInMeasure: ${this._isInMeasure} isInLayout: ${this._isInLayout}`);
            if (this._isInMeasure || this._isInLayout) {
                this.logger.log("requestLayoutFiltered: retrying...");
                setTimeout(() => {
                    this.requestLayout.next();
                }, 60);
            }
            return !this._isInMeasure && !this._isInLayout;
        })
    );

    constructor(protected _virtualRepeatContainer: VirtualRepeatContainer,
        protected _differs: IterableDiffers,
        protected _template: TemplateRef<VirtualRepeatRow>,
        protected _viewContainerRef: ViewContainerRef,
        protected logger: LoggerService
    ) {

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

        this._subscription.add(this.requestMeasureFiltered.subscribe(() => {
            this.measure()
        }));

        this._subscription.add(this.requestLayoutFiltered.subscribe(() => {
            this.layout()
        }));

        this._subscription.add(this._virtualRepeatContainer.scrollPosition
            .pipe(
                debounceTime(60),
                filter((scrollY) => {
                    return Math.abs(scrollY - this._scrollY) >= this._virtualRepeatContainer._rowHeight * this._guardItems / 2;
                })
            )
            .subscribe(
                (scrollY) => {
                    this.logger.log('scrollPosition: ', scrollY);
                    this._scrollY = scrollY;
                    this.requestLayout.next();
                }
            ));

        this._subscription.add(this._virtualRepeatContainer.sizeChange.subscribe(
            ([width, height]) => {
                this.logger.log('sizeChange: ', width, height);
                this._containerWidth = width;
                this._containerHeight = height;
                this.requestMeasure.next();
            }
        ));
    }

    protected disconnect() {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }

    protected abstract createView(position: number, addBefore: boolean);

    protected abstract measure();

    protected detachAllViews() {
        for (let i = 0; i < this._viewContainerRef.length; i++) {
            let child = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
            this._recycler.recycleView(child);
            this._viewContainerRef.detach(i);

            i--;
        }
        this._isInLayout = false;
        return;
    }

    protected emptyItem(item: any) {
        var o = Array.isArray(item) ? [] : {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                var t = typeof item[key];
                o[key] = t == 'object' ? this.emptyItem(item[key]) : undefined;
            }
        }
        return o;
    }

    protected layout() {
        this.logger.log('layout: on layout');
        this._isInLayout = true;
        let { width, height } = this._virtualRepeatContainer.measure();
        this._containerWidth = width;
        this._containerHeight = height;

        if (this._collectionLength == 0) {
            this.logger.log('layout: this._isInLayout = false. detachAllViews');
            this._isInLayout = false;
            return this.detachAllViews();
        }
        this.findRequestedIndexesRange();
        this.removeViews();
        this.createViews();
        this._isInLayout = false;
    }

    protected findRequestedIndexesRange() {
        let firstPosition;

        this._firstItemIndex = this._firstRequestedItemIndex;
        this._lastItemIndex = this._lastRequestedItemIndex;
        this.logger.log(`findPositionInRange: firstItemPosition: ${this._firstItemIndex} lastItemPosition: ${this._lastItemIndex}`);

        if (this._virtualRepeatContainer._autoHeightVariable) {
            firstPosition = Math.floor(this._collectionLength * (this._scrollY / this._virtualRepeatContainer.holderHeight));
            let firstPositionOffset = this._scrollY - (firstPosition * this._virtualRepeatContainer._rowHeight);
            let lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer._rowHeight) + firstPosition;
            this._firstRequestedItemIndex = Math.max(firstPosition - this._guardItems, 0);
            this._lastRequestedItemIndex = Math.min(lastPosition + this._guardItems, this._collectionLength - 1);

            this._virtualRepeatContainer._translateY = this._scrollY - ((firstPosition - this._firstRequestedItemIndex) * this._virtualRepeatContainer._rowHeight);
        } else {
            firstPosition = Math.floor(this._scrollY / this._virtualRepeatContainer._rowHeight);
            let firstPositionOffset = this._scrollY - (firstPosition * this._virtualRepeatContainer._rowHeight);
            let lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer._rowHeight) + firstPosition;
            this._firstRequestedItemIndex = Math.max(firstPosition - this._guardItems, 0);
            this._lastRequestedItemIndex = Math.min(lastPosition + this._guardItems, this._collectionLength - 1);

            this._virtualRepeatContainer._translateY = (this._firstRequestedItemIndex * this._virtualRepeatContainer._rowHeight);
        }

        this.logger.log(`findPositionInRange: firstRequestedItemPosition: ${this._firstRequestedItemIndex} lastRequestedItemPosition: ${this._lastRequestedItemIndex}`);
        this.logger.log(`findPositionInRange: translateY: ${this._virtualRepeatContainer._translateY} rowHeight: ${this._virtualRepeatContainer._rowHeight}`);
    }

    protected removeViews() {
        if (this._viewContainerRef.length > 0) {
            this.logger.log("removeViews: length > 0");
            for (let i = 0; i < this._viewContainerRef.length; i++) {
                let view = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
                let viewIndex = view.context.index;
                if (viewIndex > this._lastRequestedItemIndex || viewIndex < this._firstRequestedItemIndex) {
                    this.logger.log("removeViews: recycleView ", viewIndex, view);
                    this._recycler.recycleView(view);
                    this._viewContainerRef.detach(i);
                    i--;
                }
            }

            this.logger.log("removeViews: recycler length", this._recycler.length());
        }
    }

    protected createViews() {
        if (this._viewContainerRef.length > 0) {
            this.logger.log(`createViews: length > 0, _firstItemPosition: ${this._firstItemIndex} _lastItemPosition: ${this._lastItemIndex}`);
            this.logger.log(`createViews: length > 0, _firstRequestedItemPosition: ${this._firstRequestedItemIndex} _lastRequestedItemPosition: ${this._lastRequestedItemIndex}`);
            for (let i = this._firstItemIndex - 1; i >= this._firstRequestedItemIndex; i--) {
                this.logger.log("createViews: getView -- ", i);
                this.createView(i, true);
            }
            for (let i = this._lastItemIndex + 1; i <= this._lastRequestedItemIndex; i++) {
                this.logger.log("createViews: getView  ++ ", i);
                this.createView(i, false);
            }
        } else {
            this.logger.log("createViews: length == 0");
            for (let i = this._firstRequestedItemIndex; i <= this._lastRequestedItemIndex; i++) {
                this.createView(i, false);
            }
        }
    }

    //to be called once createView has finished
    protected dispatchLayout(position: number, view: ViewRef) {
        this.applyStyles((view as EmbeddedViewRef<VirtualRepeatRow>).rootNodes[0]);
        let containerPos = position - this._firstRequestedItemIndex;
        this.logger.log(`dispatchLayout: item: ${position} containerPos: ${containerPos}`);

        if (this._virtualRepeatContainer._autoHeight) {
            var height = (<any>view).rootNodes[0].scrollHeight || (<any>view).rootNodes["0"].children["0"].clientHeight;
            if (height == 0) return;
            if (!this._virtualRepeatContainer._autoHeightComputed) {
                this._virtualRepeatContainer._rowHeight = height;
                this.logger.log('dispatchLayout: autoHeight rowHeight updated ' + height);
                this._virtualRepeatContainer._autoHeightComputed = true;
                this.requestMeasure.next();
            }
            else if (height != this._virtualRepeatContainer._rowHeight) {
                this._virtualRepeatContainer._autoHeightVariable = true;
            }

            /*if(this._virtualRepeatContainer._autoHeightVariable){
                this._virtualRepeatContainer._autoHeightVariableCount++;
                this.logger.log('dispatchLayout: _autoHeightVariable rowHeight ' + height);

                this._virtualRepeatContainer._rowHeight += (height - this._virtualRepeatContainer._rowHeight) / this._virtualRepeatContainer._autoHeightVariableCount;
                this.logger.log('dispatchLayout: _autoHeightVariable mean height('+this._virtualRepeatContainer._autoHeightVariableCount+'):' + this._virtualRepeatContainer._rowHeight);

                if(this._virtualRepeatContainer._autoHeightVariableCount % this._lastItemPosition - this._firstItemPosition == 0){
                    this.logger.log('dispatchLayout: _autoHeightVariable update holderHeight');
                    this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * this._collectionLength;           
                }
            }*/
        }
    }

    protected applyStyles(viewElement: HTMLElement) {
        viewElement.style.width = `${this._containerWidth}px`;
        if (!this._virtualRepeatContainer._autoHeight) {
            viewElement.style.height = `${this._virtualRepeatContainer._rowHeight}px`;
        } else {
            viewElement.style.height = undefined;
        }
        viewElement.style.boxSizing = 'border-box';
    }

    protected prepareView(index: number, item: T) {
        let view;
        if (view = this._recycler.recoverView()) {
            (<EmbeddedViewRef<VirtualRepeatRow>>view).context.$implicit = item;
            (<EmbeddedViewRef<VirtualRepeatRow>>view).context.index = index;
            (<EmbeddedViewRef<VirtualRepeatRow>>view).context.count = this._collectionLength;
            (<EmbeddedViewRef<VirtualRepeatRow>>view).reattach();
        } else {
            view = this._template.createEmbeddedView(new VirtualRepeatRow(item, index, this._collectionLength));
        }
        return view;
    }

    protected createViewForItem(index: number, item: T) {
        this.logger.log(`createViewForItem: _firstItemPosition: ${this._firstItemIndex} _firstRequestedItemPosition: ${this._firstRequestedItemIndex} length: ${this._viewContainerRef.length}`);
        let containerPos = index - (this._firstItemIndex || 0);
        if (Math.abs(containerPos) > this._guardItems) {
            containerPos = 0; //out of previous range
        }
        this.logger.log(`createViewForItem: create containerPos: ${containerPos} index: ${index}`);
        let view = null;
        if (this._viewContainerRef.length == 0) {
            view = this.prepareView(index, item);
            this._viewContainerRef.insert(view);
        } else {
            let inserted = false;
            if (containerPos >= 0) { //insert at the end
                for (let containerIndex = this._viewContainerRef.length - 1; containerIndex >= 0; containerIndex--) {
                    let viewIndex = (<EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(containerIndex)).context.index;
                    this.logger.log(`createViewForItem: checking ${viewIndex} ++`);
                    if (index == viewIndex) {
                        this.logger.log(`createViewForItem: reasign ${viewIndex} ++`);
                        (<EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(containerIndex)).context.$implicit = item;
                        inserted = true;
                        break;
                    } else if (index > viewIndex) {
                        view = this.prepareView(index, item);
                        this.logger.log(`createViewForItem: inserting in ${containerIndex + 1} ++`);
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
            } else { //insert at the beginning
                for (let containerIndex = 0; containerIndex < this._viewContainerRef.length; containerIndex++) {
                    let viewIndex = (<EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(containerIndex)).context.index;
                    this.logger.log(`createViewForItem: checking ${viewIndex} --`);
                    if (index == viewIndex) {
                        this.logger.log(`createViewForItem: reasign ${viewIndex} --`);
                        (<EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(containerIndex)).context.$implicit = item;
                        inserted = true;
                        break;
                    } else if (index < viewIndex) {
                        view = this.prepareView(index, item);
                        this.logger.log(`createViewForItem: inserting in ${containerIndex} --`);
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
            this.dispatchLayout(index, view);
        }
    }
}