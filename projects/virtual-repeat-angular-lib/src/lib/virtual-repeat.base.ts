import {
    EmbeddedViewRef,
    Input,
    isDevMode,
    IterableDiffer,
    IterableDiffers,
    NgIterable,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewContainerRef,
    ViewRef
} from '@angular/core';

import { Subscription, Observable } from 'rxjs';
import { filter, map, debounceTime, first } from 'rxjs/operators';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';

export class Recycler {
    private limit: number = 0;
    private _scrapViews: Map<number, ViewRef> = new Map();

    getView(position: number): ViewRef | null {
        let view = this._scrapViews.get(position);
        if (!view && this._scrapViews.size > 0) {
            position = this._scrapViews.keys().next().value;
            view = this._scrapViews.get(position);
        }
        if (view) {
            this._scrapViews.delete(position);
        }
        return view || null;
    }

    recycleView(position: number, view: ViewRef) {
        view.detach();
        this._scrapViews.set(position, view);
    }

    /**
     * scrap view count should not exceed the number of current attached views.
     */
    pruneScrapViews() {
        if (this.limit <= 1) {
            return;
        }
        let keyIterator = this._scrapViews.keys();
        let key: number;
        while (this._scrapViews.size > this.limit) {
            key = keyIterator.next().value;
            this._scrapViews.get(key).destroy();
            this._scrapViews.delete(key);
        }
    }

    setScrapViewsLimit(limit: number) {
        this.limit = limit;
        this.pruneScrapViews();
    }

    clean() {
        this._scrapViews.forEach((view: ViewRef) => {
            view.destroy();
        });
        this._scrapViews.clear();
    }
}

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

export abstract class VirtualRepeatBase<T> {
    protected _differ: IterableDiffer<T>;
    protected _trackByFn: TrackByFunction<T>;
    protected _subscription: Subscription = new Subscription();
    /**
     * scroll offset of y-axis in pixel
     */
    protected _scrollY: number = 0;
    /**
     * first visible item index in collection
     */
    protected _firstItemPosition: number;
    /**
     * last visible item index in collection
     */
    protected _lastItemPosition: number;

    protected _containerWidth: number;
    protected _containerHeight: number;

    /**
     * when this value is true, a full clean layout is required, every element must be reposition
     */
    protected _invalidate: boolean = true;
    /**
     * when this value is true, a layout is in process
     */
    protected _isInLayout: boolean = false;

    protected _isInMeasure: boolean = false;

    protected _pendingMeasurement: number;

    protected _recycler: Recycler = new Recycler();

    @Input() virtualRepeatAsynchOf: NgIterable<T>;

    @Input()
    set virtualRepeatAsynchForTrackBy(fn: TrackByFunction<T>) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (<any>console && <any>console.warn) {
                console.warn(
                    `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }

    get virtualRepeatAsynchForTrackBy(): TrackByFunction<T> {
        return this._trackByFn;
    }

    @Input()
    set virtualRepeatAsynchForTemplate(value: TemplateRef<VirtualRepeatRow>) {
        if (value) {
            this._template = value;
        }
    }

    constructor(protected _virtualRepeatContainer: VirtualRepeatContainer,
        protected _differs: IterableDiffers,
        protected _template: TemplateRef<VirtualRepeatRow>,
        protected _viewContainerRef: ViewContainerRef) {
    }

    abstract ngOnChanges(changes: SimpleChanges);

    ngOnInit(): void {
        this._subscription.add(this._virtualRepeatContainer.scrollPosition
            .pipe(
                filter((scrollY) => {
                    return Math.abs(scrollY - this._scrollY) >= this._virtualRepeatContainer._rowHeight;
                }),
                debounceTime(60)
            )
            .subscribe(
                (scrollY) => {
                    this._scrollY = scrollY;
                    this.requestLayout();
                }
            ));

        this._subscription.add(this._virtualRepeatContainer.sizeChange.subscribe(
            ([width, height]) => {
                // console.log('sizeChange: ', width, height);
                this._containerWidth = width;
                this._containerHeight = height;
                this.requestMeasure();
            }
        ));
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }

    protected requestMeasure() {
        if (this._isInMeasure || this._isInLayout) {
            clearTimeout(this._pendingMeasurement);
            this._pendingMeasurement = window.setTimeout(() => {
                this.requestMeasure();
            }, 60);
            return;
        }
        this.measure();
    }

    protected requestLayout() {
        if (!this._isInMeasure) {
            this.layout();
        }
    }

    protected abstract measure();

    protected abstract layout();

    protected detachAllViews() {
        for (let i = 0; i < this._viewContainerRef.length; i++) {
            let child = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
            this._viewContainerRef.detach(i);
            i--;
        }
        this._isInLayout = false;
        this._invalidate = false;
        return;
    }

    protected calculateScrapViewsLimit() {
        let limit = (this._containerHeight / this._virtualRepeatContainer._rowHeight) + 5;
        this._recycler.setScrapViewsLimit(limit);
    }

    protected abstract insertViews(collection_length: number)

    protected applyStyles(viewElement: HTMLElement, y: number) {
        viewElement.style.transform = `translate3d(0, ${y}px, 0)`;
        viewElement.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
        viewElement.style.width = `${this._containerWidth}px`;
        viewElement.style.height = `${this._virtualRepeatContainer._rowHeight}px`;
        viewElement.style.position = 'absolute';
    }

    protected dispatchLayout(position: number, view: ViewRef, addBefore: boolean) {
        let startPosY = position * this._virtualRepeatContainer._rowHeight;
        this.applyStyles((view as EmbeddedViewRef<VirtualRepeatRow>).rootNodes[0], startPosY);
        if (addBefore) {
            this._viewContainerRef.insert(view, 0);
        } else {
            this._viewContainerRef.insert(view);
        }
        view.reattach();

        //autoHeight update on first view attached
        if(this._virtualRepeatContainer._autoHeight && !this._virtualRepeatContainer._heightAutoComputed)
        {
            this._virtualRepeatContainer._rowHeight = (<any>view).rootNodes[0].scrollHeight;
            this._virtualRepeatContainer._heightAutoComputed = true;
            this.requestMeasure();
        }
    }

    protected findPositionInRange(collection_length: number) {
        let scrollY = this._scrollY;
        let firstPosition = Math.floor(scrollY / this._virtualRepeatContainer._rowHeight);
        let firstPositionOffset = scrollY - firstPosition * this._virtualRepeatContainer._rowHeight;
        let lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer._rowHeight) + firstPosition;
        this._firstItemPosition = Math.max(firstPosition - 5, 0);
        this._lastItemPosition = Math.min(lastPosition + 5, collection_length - 1);
    }

    protected abstract getView(collection_length: number, position: number)
}