import { ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
export declare const SCROLL_STOP_TIME_THRESHOLD = 200;
export declare class VirtualRepeatContainer implements AfterViewInit, OnDestroy {
    private _holderHeight;
    private _containerWidth;
    private _containerHeight;
    private _subscription;
    private _scrollStateChange;
    private _scrollPosition;
    private _sizeChange;
    private ignoreScrollEvent;
    private _initialScrollTop;
    currentScrollState: SCROLL_STATE;
    listContainer: ElementRef;
    scrollbarStyle: string;
    scrollbarWidth: number;
    holderHeight: number;
    readonly holderHeightInPx: string;
    /**
     * scroll state change
     */
    readonly scrollStateChange: Observable<SCROLL_STATE>;
    /**
     * current scroll position.
     */
    readonly scrollPosition: Observable<number>;
    /**
     * list container width and height.
     */
    readonly sizeChange: Observable<number[]>;
    rowHeight: string;
    _rowHeight: number;
    _autoHeight: boolean;
    _heightAutoComputed: boolean;
    newScrollPosition: number;
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    measure(): {
        width: number;
        height: number;
    };
    requestMeasure(): void;
}
export declare enum SCROLL_STATE {
    SCROLLING = 0,
    IDLE = 1,
}
export declare function getScrollBarWidth(): number;
