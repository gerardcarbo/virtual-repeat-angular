import { DoCheck, IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { VirtualRepeatContainer } from './virtual-repeat-container';
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
export declare class InfiniteRow {
    $implicit: any;
    index: number;
    count: number;
    constructor($implicit: any, index: number, count: number);
    readonly first: boolean;
    readonly last: boolean;
    readonly even: boolean;
    readonly odd: boolean;
}
export declare class VirtualRepeat<T> implements OnChanges, DoCheck, OnInit, OnDestroy {
    private _virtualRepeatContainer;
    private _differs;
    private _template;
    private _viewContainerRef;
    private _differ;
    private _trackByFn;
    private _subscription;
    /**
     * scroll offset of y-axis in pixel
     */
    private _scrollY;
    /**
     * first visible item index in collection
     */
    private _firstItemPosition;
    /**
     * last visible item index in collection
     */
    private _lastItemPosition;
    private _containerWidth;
    private _containerHeight;
    /**
     * when this value is true, a full clean layout is required, every element must be reposition
     */
    private _invalidate;
    /**
     * when this value is true, a layout is in process
     */
    private _isInLayout;
    private _isInMeasure;
    private _pendingMeasurement;
    private _collection;
    private _recycler;
    virtualRepeatOf: NgIterable<T>;
    infiniteForTrackBy: TrackByFunction<T>;
    infiniteForTemplate: TemplateRef<InfiniteRow>;
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<InfiniteRow>, _viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    private applyChanges(changes);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private requestMeasure();
    private requestLayout();
    private measure();
    private layout();
    private calculateScrapViewsLimit();
    private insertViews();
    private applyStyles(viewElement, y);
    private dispatchLayout(position, view, addBefore);
    private findPositionInRange();
    private getView(position);
}
export declare function getTypeNameForDebugging(type: any): string;
