import { EmbeddedViewRef, IterableDiffer, IterableDiffers, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { LoggerService } from './logger.service';
import * as i0 from "@angular/core";
export declare class Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (value: T) => void;
    constructor();
}
export declare class VirtualRepeatRow {
    $implicit: any;
    index: number;
    count: number;
    constructor($implicit: any, index: number, count: number);
    get first(): boolean;
    get last(): boolean;
    get even(): boolean;
    get odd(): boolean;
    previousDisplay: string;
    markedToBeRemoved: boolean;
    recycled: boolean;
}
export declare class Recycler {
    private _limit;
    private _scrapViews;
    constructor(limit?: number);
    length(): number;
    recoverView(): EmbeddedViewRef<VirtualRepeatRow>;
    recycleView(view: ViewRef): void;
    /**
     * scrap view count should not exceed the number of current attached views.
     */
    pruneScrapViews(): void;
    setScrapViewsLimit(limit: number): void;
    clean(): void;
}
export interface IVirtualRepeat {
    reset(): void;
}
export declare abstract class VirtualRepeatBase<T> implements IVirtualRepeat, OnInit, OnDestroy {
    protected _virtualRepeatContainer: VirtualRepeatContainer;
    protected _differs: IterableDiffers;
    protected _template: TemplateRef<VirtualRepeatRow>;
    protected _viewContainerRef: ViewContainerRef;
    protected logger: LoggerService;
    protected _differ: IterableDiffer<T>;
    protected _trackByFn: TrackByFunction<T>;
    protected _subscription: Subscription;
    /**
     * scroll offset of y-axis in pixel
     */
    protected _scrollY: number;
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
    protected _guardItems: number;
    protected _containerWidth: number;
    protected _containerHeight: number;
    protected _isInLayout: boolean;
    protected _isInMeasure: boolean;
    protected _pendingMeasurement: any;
    protected _collectionLength: number;
    protected _recycler: Recycler;
    protected _markedToBeRemovedCount: number;
    protected _fullScroll: boolean;
    protected _processTimeout: number;
    protected _doProcessTimeout: any;
    requestMeasure: Subject<void>;
    protected _requestMeasureFiltered: Observable<any>;
    requestLayout: Subject<void>;
    protected _requestLayoutFiltered: Observable<any>;
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<VirtualRepeatRow>, _viewContainerRef: ViewContainerRef, logger: LoggerService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected connect(): void;
    protected disconnect(): void;
    reset(): void;
    protected abstract createView(index: number, addBefore: boolean): Promise<ViewRef>;
    protected abstract measure(): void;
    protected detachAllViews(): void;
    protected emptyItem(item: any): {};
    protected layout(): void;
    private processingDone;
    protected findRequestedIndexesRange(): void;
    protected removeViews(): void;
    protected createViews(): Promise<ViewRef[]>;
    protected prepareView(index: number, item: T): any;
    protected createViewForItem(index: number, item: T): ViewRef;
    protected applyStyles(index: number, view: EmbeddedViewRef<VirtualRepeatRow>): void;
    onProcessing(processing: boolean): any;
    private dispatchLayout;
    private getElementHeight;
    static ɵfac: i0.ɵɵFactoryDeclaration<VirtualRepeatBase<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<VirtualRepeatBase<any>, never, never, {}, {}, never, never, false>;
}
