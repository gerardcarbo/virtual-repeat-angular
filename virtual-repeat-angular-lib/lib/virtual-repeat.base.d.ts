import { IterableDiffer, IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
export declare class Recycler {
    private limit;
    private _scrapViews;
    getView(position: number): ViewRef | null;
    recycleView(position: number, view: ViewRef): void;
    /**
     * scrap view count should not exceed the number of current attached views.
     */
    pruneScrapViews(): void;
    setScrapViewsLimit(limit: number): void;
    clean(): void;
}
export declare class VirtualRepeatRow {
    $implicit: any;
    index: number;
    count: number;
    constructor($implicit: any, index: number, count: number);
    readonly first: boolean;
    readonly last: boolean;
    readonly even: boolean;
    readonly odd: boolean;
}
export declare abstract class VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {
    protected _virtualRepeatContainer: VirtualRepeatContainer;
    protected _differs: IterableDiffers;
    protected _template: TemplateRef<VirtualRepeatRow>;
    protected _viewContainerRef: ViewContainerRef;
    protected _differ: IterableDiffer<T>;
    protected _trackByFn: TrackByFunction<T>;
    protected _subscription: Subscription;
    /**
     * scroll offset of y-axis in pixel
     */
    protected _scrollY: number;
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
    protected _invalidate: boolean;
    /**
     * when this value is true, a layout is in process
     */
    protected _isInLayout: boolean;
    protected _isInMeasure: boolean;
    protected _pendingMeasurement: number;
    protected _recycler: Recycler;
    virtualRepeatAsynchOf: NgIterable<T>;
    virtualRepeatAsynchForTrackBy: TrackByFunction<T>;
    virtualRepeatAsynchForTemplate: TemplateRef<VirtualRepeatRow>;
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<VirtualRepeatRow>, _viewContainerRef: ViewContainerRef);
    abstract ngOnChanges(changes: SimpleChanges): any;
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected requestMeasure(): void;
    protected requestLayout(): void;
    protected abstract measure(): any;
    protected abstract layout(): any;
    protected detachAllViews(): void;
    protected calculateScrapViewsLimit(): void;
    protected abstract insertViews(collection_length: number): any;
    protected applyStyles(viewElement: HTMLElement, y: number): void;
    protected dispatchLayout(position: number, view: ViewRef, addBefore: boolean): void;
    protected findPositionInRange(collection_length: number): void;
    protected abstract getView(collection_length: number, position: number): any;
}
