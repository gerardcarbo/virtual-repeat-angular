import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Output, Input } from '@angular/core';
import { Subscription, BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, tap, map, debounceTime } from 'rxjs/operators';

export const SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds

const INVALID_POSITION = -1;

@Component({
    selector: 'gc-virtual-repeat-container',
    templateUrl: './virtual-repeat-container.html',
    styleUrls: ['./virtual-repeat-container.scss']
})
export class VirtualRepeatContainer implements AfterViewInit, OnDestroy {
    private _holderHeight: number = 0;
    private _containerWidth: number = 0;
    private _containerHeight: number = 0;

    private _subscription: Subscription = new Subscription();

    private _scrollStateChange: BehaviorSubject<SCROLL_STATE> = new BehaviorSubject(SCROLL_STATE.IDLE);
    private _scrollPosition: BehaviorSubject<number> = new BehaviorSubject(0);
    private _sizeChange: BehaviorSubject<number[]> = new BehaviorSubject([0, 0]);

    private ignoreScrollEvent = false;

    private _initialScrollTop = INVALID_POSITION;

    currentScrollState: SCROLL_STATE = SCROLL_STATE.IDLE;

    @ViewChild('listContainer') listContainer: ElementRef;

    scrollbarStyle: string;
    scrollbarWidth: number;

    set holderHeight(height: number) {
        if (typeof height !== 'undefined') {
            this._holderHeight = height;
            if (this._holderHeight === 0) {
                this.listContainer.nativeElement.scrollTop = 0;
            }
            // When initialization, the list-holder doesn't not have its height. So the scrollTop should be delayed for waiting
            // the list-holder rendered bigger than the list-container.
            if (this._initialScrollTop !== INVALID_POSITION && this._holderHeight !== 0) {
                setTimeout(() => {
                    this.listContainer.nativeElement.scrollTop = this._initialScrollTop;
                    this._initialScrollTop = INVALID_POSITION;
                });
            }
        }
    }

    get holderHeight(): number {
        return this._holderHeight;
    }

    get holderHeightInPx(): string {
        if (this.holderHeight) {
            return this.holderHeight + 'px';
        }
        return '100%';
    }

    /**
     * scroll state change
     */
    get scrollStateChange(): Observable<SCROLL_STATE> {
        return this._scrollStateChange.asObservable();
    }

    /**
     * current scroll position.
     */
    @Output()
    get scrollPosition(): Observable<number> {
        return this._scrollPosition.asObservable();
    }

    /**
     * list container width and height.
     */
    get sizeChange(): Observable<number[]> {
        return this._sizeChange.asObservable();
    }

    @Input() set rowHeight(rowHeight: string) {
        if(rowHeight != undefined) {
            if (rowHeight != "auto") {
                this._rowHeight = Number(rowHeight);
                this._autoHeight =  false;

            } else {
                this._autoHeight = true;
            }            
        }
    } 

    _rowHeight: number = 100;
    _autoHeight: boolean = false;
 
    @Input()
    set newScrollPosition(p: number) {
        // console.log('p', p);
        this.listContainer.nativeElement.scrollTop = p;
        // if list-holder has no height at the certain time. scrollTop will not be set.
        if (!this.holderHeight) {
            this._initialScrollTop = p;
        }
        this._scrollPosition.next(p);
    }

    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    constructor() {
        this.scrollbarStyle = 'normal';
        this.scrollbarWidth = getScrollBarWidth();
    }

    ngAfterViewInit(): void {
        if (this.scrollbarStyle === 'hide-scrollbar') {
            this.listContainer.nativeElement.style.right = (0 - this.scrollbarWidth) + 'px';
            this.listContainer.nativeElement.style.paddingRight = this.scrollbarWidth + 'px';
        }

        if (window) {
            this._subscription.add(fromEvent(window, 'resize')
                .subscribe(() => {
                    this.requestMeasure();
                }));
        }
        this._subscription.add(
            fromEvent(this.listContainer.nativeElement, 'scroll')
                .pipe(
                    filter(() => {
                        if (this.ignoreScrollEvent) {
                            this.ignoreScrollEvent = false;
                            return false;
                        }
                        return true;
                    }),
                    map(() => {
                        return this.listContainer.nativeElement.scrollTop;
                    })
                )
                .subscribe((scrollY: number) => {
                    this._scrollPosition.next(scrollY);
                }));

        this._subscription.add(
            this.scrollPosition
                .pipe(
                    tap(() => {
                        if (this.currentScrollState === SCROLL_STATE.IDLE) {
                            this.currentScrollState = SCROLL_STATE.SCROLLING;
                            this._scrollStateChange.next(this.currentScrollState);
                        }
                    }),
                    debounceTime(SCROLL_STOP_TIME_THRESHOLD)
                )
                .subscribe(
                    () => {
                        if (this.currentScrollState === SCROLL_STATE.SCROLLING) {
                            this.currentScrollState = SCROLL_STATE.IDLE;
                            this._scrollStateChange.next(this.currentScrollState);
                        }
                    }
                ));

        setTimeout(() => {
            this.requestMeasure();
        });
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    measure(): { width: number, height: number } {
        if (this.listContainer && this.listContainer.nativeElement) {
            // let measuredWidth = this.listContainer.nativeElement.clientWidth;
            // let measuredHeight = this.listContainer.nativeElement.clientHeight;
            let rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return { width: this._containerWidth, height: this._containerHeight };
        }
        return { width: 0, height: 0 };
    }

    requestMeasure() {
        let { width, height } = this.measure();
        this._sizeChange.next([width, height]);
    }
}

export enum SCROLL_STATE {
    SCROLLING,
    IDLE
}

export function getScrollBarWidth() {
    let inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    let outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    let w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let w2 = inner.offsetWidth;

    if (w1 == w2) {
        w2 = outer.clientWidth;
    }

    document.body.removeChild(outer);

    return (w1 - w2);
}

