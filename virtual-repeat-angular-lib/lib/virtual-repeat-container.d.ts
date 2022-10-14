import { ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from './logger.service';
import { IVirtualRepeat } from './virtual-repeat.base';
import * as i0 from "@angular/core";
export declare const SCROLL_STOP_TIME_THRESHOLD = 200;
export declare class VirtualRepeatContainer implements AfterViewInit, OnDestroy {
    protected logger: LoggerService;
    set virtualRepeat(virtualRepeat: IVirtualRepeat);
    get currentScrollState(): SCROLL_STATE;
    set holderHeight(height: number);
    get holderHeight(): number;
    get holderHeightInPx(): string;
    get translateYInPx(): string;
    /**
     * scroll state change
     */
    get scrollStateChange(): Observable<SCROLL_STATE>;
    /**
     * current scroll position.
     */
    get scrollPosition$(): Observable<number>;
    /**
     * container width and height.
     */
    get sizeChange(): Observable<[number, number]>;
    set rowHeight(height: string | number);
    set processing(l: boolean);
    set scrollPosition(p: number);
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    constructor(logger: LoggerService);
    private _holderHeight;
    private _containerWidth;
    private _containerHeight;
    translateY: number;
    private _subscription;
    private _scrollStateChange;
    private _scrollPosition;
    private _sizeChange;
    private _ignoreScrollEvent;
    private _initialScrollTop;
    private _currentScrollState;
    listContainer: ElementRef;
    scrollbarStyle: string;
    scrollbarWidth: number;
    private _virtualRepeat;
    private _rowHeight;
    _autoHeight: boolean;
    _autoHeightComputed: boolean;
    _autoHeightVariable: boolean;
    _autoHeightVariableData: {
        itemsCount: number;
        totalHeight: number;
    };
    private _processingSubject;
    processingRaw$: Observable<boolean>;
    processing$: Observable<unknown>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    getRowHeight(): number;
    getContainerSize(): {
        width: number;
        height: number;
    };
    reset(): void;
    resize(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<VirtualRepeatContainer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VirtualRepeatContainer, "gc-virtual-repeat-container", never, { "rowHeight": "rowHeight"; "scrollPosition": "scrollPosition"; }, { "scrollPosition$": "scrollPosition$"; }, never, ["*"], false>;
}
export declare enum SCROLL_STATE {
    IDLE = 0,
    SCROLLING_DOWN = 1,
    SCROLLING_UP = 2
}
export declare function getScrollBarWidth(): number;
