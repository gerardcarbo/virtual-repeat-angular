/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, ViewChild, ElementRef, Output, Input } from '@angular/core';
import { Subscription, BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, tap, map, debounceTime } from 'rxjs/operators';
export const /** @type {?} */ SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
const /** @type {?} */ INVALID_POSITION = -1;
export class VirtualRepeatContainer {
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     */
    constructor() {
        this._holderHeight = 0;
        this._containerWidth = 0;
        this._containerHeight = 0;
        this._subscription = new Subscription();
        this._scrollStateChange = new BehaviorSubject(SCROLL_STATE.IDLE);
        this._scrollPosition = new BehaviorSubject(0);
        this._sizeChange = new BehaviorSubject([0, 0]);
        this.ignoreScrollEvent = false;
        this._initialScrollTop = INVALID_POSITION;
        this.currentScrollState = SCROLL_STATE.IDLE;
        this._rowHeight = 100;
        this._autoHeight = false;
        this._heightAutoComputed = false;
        this.scrollbarStyle = 'normal';
        this.scrollbarWidth = getScrollBarWidth();
    }
    /**
     * @param {?} height
     * @return {?}
     */
    set holderHeight(height) {
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
    /**
     * @return {?}
     */
    get holderHeight() {
        return this._holderHeight;
    }
    /**
     * @return {?}
     */
    get holderHeightInPx() {
        if (this.holderHeight) {
            return this.holderHeight + 'px';
        }
        return '100%';
    }
    /**
     * scroll state change
     * @return {?}
     */
    get scrollStateChange() {
        return this._scrollStateChange.asObservable();
    }
    /**
     * current scroll position.
     * @return {?}
     */
    get scrollPosition() {
        return this._scrollPosition.asObservable();
    }
    /**
     * list container width and height.
     * @return {?}
     */
    get sizeChange() {
        return this._sizeChange.asObservable();
    }
    /**
     * @param {?} rowHeight
     * @return {?}
     */
    set rowHeight(rowHeight) {
        if (rowHeight != undefined) {
            if (rowHeight != "auto") {
                this._rowHeight = Number(rowHeight);
                this._heightAutoComputed = this._autoHeight = false;
            }
            else {
                this._heightAutoComputed = false;
                this._autoHeight = true;
            }
        }
    }
    /**
     * @param {?} p
     * @return {?}
     */
    set newScrollPosition(p) {
        // console.log('p', p);
        this.listContainer.nativeElement.scrollTop = p;
        // if list-holder has no height at the certain time. scrollTop will not be set.
        if (!this.holderHeight) {
            this._initialScrollTop = p;
        }
        this._scrollPosition.next(p);
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
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
        this._subscription.add(fromEvent(this.listContainer.nativeElement, 'scroll')
            .pipe(filter(() => {
            if (this.ignoreScrollEvent) {
                this.ignoreScrollEvent = false;
                return false;
            }
            return true;
        }), map(() => {
            return this.listContainer.nativeElement.scrollTop;
        }))
            .subscribe((scrollY) => {
            this._scrollPosition.next(scrollY);
        }));
        this._subscription.add(this.scrollPosition
            .pipe(tap(() => {
            if (this.currentScrollState === SCROLL_STATE.IDLE) {
                this.currentScrollState = SCROLL_STATE.SCROLLING;
                this._scrollStateChange.next(this.currentScrollState);
            }
        }), debounceTime(SCROLL_STOP_TIME_THRESHOLD))
            .subscribe(() => {
            if (this.currentScrollState === SCROLL_STATE.SCROLLING) {
                this.currentScrollState = SCROLL_STATE.IDLE;
                this._scrollStateChange.next(this.currentScrollState);
            }
        }));
        setTimeout(() => {
            this.requestMeasure();
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
    /**
     * @return {?}
     */
    measure() {
        if (this.listContainer && this.listContainer.nativeElement) {
            // let measuredWidth = this.listContainer.nativeElement.clientWidth;
            // let measuredHeight = this.listContainer.nativeElement.clientHeight;
            let /** @type {?} */ rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return { width: this._containerWidth, height: this._containerHeight };
        }
        return { width: 0, height: 0 };
    }
    /**
     * @return {?}
     */
    requestMeasure() {
        let { width, height } = this.measure();
        this._sizeChange.next([width, height]);
    }
}
VirtualRepeatContainer.decorators = [
    { type: Component, args: [{
                selector: 'gc-virtual-repeat-container',
                template: `<div class="gc-virtual-repeat-container" #listContainer [ngClass]="scrollbarStyle">
    <div class="gc-virtual-repeat-container" [style.height]="holderHeightInPx">
        <ng-content></ng-content>
    </div>
</div>
`,
                styles: [`.gc-virtual-repeat-container{overflow-y:auto;overflow-x:hidden;position:relative;contain:layout;-webkit-overflow-scrolling:touch}.gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%;position:relative}.gc-virtual-repeat-container.normal{width:100%;height:100%}.gc-virtual-repeat-container.hide-scrollbar{position:absolute;top:0;left:0;bottom:0;right:0}`]
            },] },
];
/** @nocollapse */
VirtualRepeatContainer.ctorParameters = () => [];
VirtualRepeatContainer.propDecorators = {
    listContainer: [{ type: ViewChild, args: ['listContainer',] }],
    scrollPosition: [{ type: Output }],
    rowHeight: [{ type: Input }],
    newScrollPosition: [{ type: Input }]
};
function VirtualRepeatContainer_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeatContainer.prototype._holderHeight;
    /** @type {?} */
    VirtualRepeatContainer.prototype._containerWidth;
    /** @type {?} */
    VirtualRepeatContainer.prototype._containerHeight;
    /** @type {?} */
    VirtualRepeatContainer.prototype._subscription;
    /** @type {?} */
    VirtualRepeatContainer.prototype._scrollStateChange;
    /** @type {?} */
    VirtualRepeatContainer.prototype._scrollPosition;
    /** @type {?} */
    VirtualRepeatContainer.prototype._sizeChange;
    /** @type {?} */
    VirtualRepeatContainer.prototype.ignoreScrollEvent;
    /** @type {?} */
    VirtualRepeatContainer.prototype._initialScrollTop;
    /** @type {?} */
    VirtualRepeatContainer.prototype.currentScrollState;
    /** @type {?} */
    VirtualRepeatContainer.prototype.listContainer;
    /** @type {?} */
    VirtualRepeatContainer.prototype.scrollbarStyle;
    /** @type {?} */
    VirtualRepeatContainer.prototype.scrollbarWidth;
    /** @type {?} */
    VirtualRepeatContainer.prototype._rowHeight;
    /** @type {?} */
    VirtualRepeatContainer.prototype._autoHeight;
    /** @type {?} */
    VirtualRepeatContainer.prototype._heightAutoComputed;
}
/** @enum {number} */
const SCROLL_STATE = {
    SCROLLING: 0,
    IDLE: 1,
};
export { SCROLL_STATE };
SCROLL_STATE[SCROLL_STATE.SCROLLING] = "SCROLLING";
SCROLL_STATE[SCROLL_STATE.IDLE] = "IDLE";
/**
 * @return {?}
 */
export function getScrollBarWidth() {
    let /** @type {?} */ inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";
    let /** @type {?} */ outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);
    document.body.appendChild(outer);
    let /** @type {?} */ w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let /** @type {?} */ w2 = inner.offsetWidth;
    if (w1 == w2) {
        w2 = outer.clientWidth;
    }
    document.body.removeChild(outer);
    return (w1 - w2);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvIiwic291cmNlcyI6WyJsaWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFVLFNBQVMsRUFBRSxVQUFVLEVBQTRCLE1BQU0sRUFBRSxLQUFLLEVBQTRCLE1BQU0sZUFBZSxDQUFDO0FBQzVJLE9BQU8sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUUsT0FBTyxFQUFRLE1BQU0sRUFBRSxHQUFHLEVBQXVCLEdBQUcsRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzRixNQUFNLENBQUMsdUJBQU0sMEJBQTBCLEdBQUcsR0FBRyxDQUFDO0FBRTlDLHVCQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBWTVCLE1BQU07Ozs7O0lBeUdGOzZCQXhHZ0MsQ0FBQzsrQkFDQyxDQUFDO2dDQUNBLENBQUM7NkJBRUUsSUFBSSxZQUFZLEVBQUU7a0NBRUksSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQzsrQkFDL0MsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDOzJCQUN4QixJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQ0FFaEQsS0FBSztpQ0FFTCxnQkFBZ0I7a0NBRVQsWUFBWSxDQUFDLElBQUk7MEJBc0UvQixHQUFHOzJCQUNELEtBQUs7bUNBQ0csS0FBSztRQW1CaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO0tBQzdDOzs7OztJQXRGRCxJQUFJLFlBQVksQ0FBQyxNQUFjO1FBQzNCLEVBQUUsQ0FBQyxDQUFD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QUNoQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXpCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLHFCQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUNoQyxxQkFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUUzQixFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNYLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0tBQzFCO0lBRUQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0NBQ3BCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vblwiXG5pbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIE91dHB1dCwgSW5wdXQsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIGZyb21FdmVudCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc2tpcCwgZmlsdGVyLCB0YXAsIGRlbGF5LCB0YWtlLCBjb25jYXQsIG1hcCwgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5leHBvcnQgY29uc3QgU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQgPSAyMDA7IC8vIGluIG1pbGxpc2Vjb25kc1xuXG5jb25zdCBJTlZBTElEX1BPU0lUSU9OID0gLTE7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJyxcbiAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJcIiAjbGlzdENvbnRhaW5lciBbbmdDbGFzc109XCJzY3JvbGxiYXJTdHlsZVwiPlxyXG4gICAgPGRpdiBjbGFzcz1cImdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lclwiIFtzdHlsZS5oZWlnaHRdPVwiaG9sZGVySGVpZ2h0SW5QeFwiPlxyXG4gICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cclxuICAgIDwvZGl2PlxyXG48L2Rpdj5cclxuYCxcbiAgICBzdHlsZXM6IFtgLmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcntvdmVyZmxvdy15OmF1dG87b3ZlcmZsb3cteDpoaWRkZW47cG9zaXRpb246cmVsYXRpdmU7Y29udGFpbjpsYXlvdXQ7LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6dG91Y2h9LmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lciAuZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLWhvbGRlcnt3aWR0aDoxMDAlO3Bvc2l0aW9uOnJlbGF0aXZlfS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIubm9ybWFse3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCV9LmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci5oaWRlLXNjcm9sbGJhcntwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7Ym90dG9tOjA7cmlnaHQ6MH1gXVxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBwcml2YXRlIF9ob2xkZXJIZWlnaHQ6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfY29udGFpbmVyV2lkdGg6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfY29udGFpbmVySGVpZ2h0OiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG5cbiAgICBwcml2YXRlIF9zY3JvbGxTdGF0ZUNoYW5nZTogQmVoYXZpb3JTdWJqZWN0PFNDUk9MTF9TVEFURT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFNDUk9MTF9TVEFURS5JRExFKTtcbiAgICBwcml2YXRlIF9zY3JvbGxQb3NpdGlvbjogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KDApO1xuICAgIHByaXZhdGUgX3NpemVDaGFuZ2U6IEJlaGF2aW9yU3ViamVjdDxudW1iZXJbXT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFswLCAwXSk7XG5cbiAgICBwcml2YXRlIGlnbm9yZVNjcm9sbEV2ZW50ID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9pbml0aWFsU2Nyb2xsVG9wID0gSU5WQUxJRF9QT1NJVElPTjtcblxuICAgIGN1cnJlbnRTY3JvbGxTdGF0ZTogU0NST0xMX1NUQVRFID0gU0NST0xMX1NUQVRFLklETEU7XG5cbiAgICBAVmlld0NoaWxkKCdsaXN0Q29udGFpbmVyJykgbGlzdENvbnRhaW5lcjogRWxlbWVudFJlZjtcblxuICAgIHNjcm9sbGJhclN0eWxlOiBzdHJpbmc7XG4gICAgc2Nyb2xsYmFyV2lkdGg6IG51bWJlcjtcblxuICAgIHNldCBob2xkZXJIZWlnaHQoaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoZWlnaHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLl9ob2xkZXJIZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5faG9sZGVySGVpZ2h0ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdoZW4gaW5pdGlhbGl6YXRpb24sIHRoZSBsaXN0LWhvbGRlciBkb2Vzbid0IG5vdCBoYXZlIGl0cyBoZWlnaHQuIFNvIHRoZSBzY3JvbGxUb3Agc2hvdWxkIGJlIGRlbGF5ZWQgZm9yIHdhaXRpbmdcbiAgICAgICAgICAgIC8vIHRoZSBsaXN0LWhvbGRlciByZW5kZXJlZCBiaWdnZXIgdGhhbiB0aGUgbGlzdC1jb250YWluZXIuXG4gICAgICAgICAgICBpZiAodGhpcy5faW5pdGlhbFNjcm9sbFRvcCAhPT0gSU5WQUxJRF9QT1NJVElPTiAmJiB0aGlzLl9ob2xkZXJIZWlnaHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID0gdGhpcy5faW5pdGlhbFNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFRvcCA9IElOVkFMSURfUE9TSVRJT047XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaG9sZGVySGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob2xkZXJIZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0IGhvbGRlckhlaWdodEluUHgoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuaG9sZGVySGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ob2xkZXJIZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnMTAwJSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xsIHN0YXRlIGNoYW5nZVxuICAgICAqL1xuICAgIGdldCBzY3JvbGxTdGF0ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPFNDUk9MTF9TVEFURT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAgICovXG4gICAgQE91dHB1dCgpXG4gICAgZ2V0IHNjcm9sbFBvc2l0aW9uKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxQb3NpdGlvbi5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBsaXN0IGNvbnRhaW5lciB3aWR0aCBhbmQgaGVpZ2h0LlxuICAgICAqL1xuICAgIGdldCBzaXplQ2hhbmdlKCk6IE9ic2VydmFibGU8bnVtYmVyW10+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpemVDaGFuZ2UuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgQElucHV0KCkgc2V0IHJvd0hlaWdodChyb3dIZWlnaHQ6IHN0cmluZykge1xuICAgICAgICBpZihyb3dIZWlnaHQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAocm93SGVpZ2h0ICE9IFwiYXV0b1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcm93SGVpZ2h0ID0gTnVtYmVyKHJvd0hlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5faGVpZ2h0QXV0b0NvbXB1dGVkID0gdGhpcy5fYXV0b0hlaWdodCA9ICBmYWxzZTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRvSGVpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0gXG5cbiAgICBfcm93SGVpZ2h0OiBudW1iZXIgPSAxMDA7XG4gICAgX2F1dG9IZWlnaHQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBfaGVpZ2h0QXV0b0NvbXB1dGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBuZXdTY3JvbGxQb3NpdGlvbihwOiBudW1iZXIpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3AnLCBwKTtcbiAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID0gcDtcbiAgICAgICAgLy8gaWYgbGlzdC1ob2xkZXIgaGFzIG5vIGhlaWdodCBhdCB0aGUgY2VydGFpbiB0aW1lLiBzY3JvbGxUb3Agd2lsbCBub3QgYmUgc2V0LlxuICAgICAgICBpZiAoIXRoaXMuaG9sZGVySGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wID0gcDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zY3JvbGxQb3NpdGlvbi5uZXh0KHApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVJVGltZWxpbmVNZXRlciBpcyBvcHRpb25hbCBpbmplY3Rpb24uIHdoZW4gdGhpcyBjb21wb25lbnQgdXNlZCBpbnNpZGUgYSBVSVRpbWVsaW5lTWV0ZXIuXG4gICAgICogaXQgaXMgcmVzcG9uc2libGUgdG8gdXBkYXRlIHRoZSBzY3JvbGxZXG4gICAgICogQHBhcmFtIF90aW1lbGluZU1ldGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyU3R5bGUgPSAnbm9ybWFsJztcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJXaWR0aCA9IGdldFNjcm9sbEJhcldpZHRoKCk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxiYXJTdHlsZSA9PT0gJ2hpZGUtc2Nyb2xsYmFyJykge1xuICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucmlnaHQgPSAoMCAtIHRoaXMuc2Nyb2xsYmFyV2lkdGgpICsgJ3B4JztcbiAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IHRoaXMuc2Nyb2xsYmFyV2lkdGggKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdykge1xuICAgICAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChmcm9tRXZlbnQod2luZG93LCAncmVzaXplJylcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgZnJvbUV2ZW50KHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LCAnc2Nyb2xsJylcbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlnbm9yZVNjcm9sbEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pZ25vcmVTY3JvbGxFdmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbWFwKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKHNjcm9sbFk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGxQb3NpdGlvbi5uZXh0KHNjcm9sbFkpO1xuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgdGhpcy5zY3JvbGxQb3NpdGlvblxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICB0YXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFNjcm9sbFN0YXRlID09PSBTQ1JPTExfU1RBVEUuSURMRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjcm9sbFN0YXRlID0gU0NST0xMX1NUQVRFLlNDUk9MTElORztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGxTdGF0ZUNoYW5nZS5uZXh0KHRoaXMuY3VycmVudFNjcm9sbFN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGRlYm91bmNlVGltZShTQ1JPTExfU1RPUF9USU1FX1RIUkVTSE9MRClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFNjcm9sbFN0YXRlID09PSBTQ1JPTExfU1RBVEUuU0NST0xMSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPSBTQ1JPTExfU1RBVEUuSURMRTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGxTdGF0ZUNoYW5nZS5uZXh0KHRoaXMuY3VycmVudFNjcm9sbFN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuXG4gICAgbWVhc3VyZSgpOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0ge1xuICAgICAgICBpZiAodGhpcy5saXN0Q29udGFpbmVyICYmIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICAvLyBsZXQgbWVhc3VyZWRXaWR0aCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICAgICAgLy8gbGV0IG1lYXN1cmVkSGVpZ2h0ID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gcmVjdC53aWR0aCAtIHRoaXMuc2Nyb2xsYmFyV2lkdGg7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSByZWN0LmhlaWdodDtcbiAgICAgICAgICAgIHJldHVybiB7IHdpZHRoOiB0aGlzLl9jb250YWluZXJXaWR0aCwgaGVpZ2h0OiB0aGlzLl9jb250YWluZXJIZWlnaHQgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG4gICAgfVxuXG4gICAgcmVxdWVzdE1lYXN1cmUoKSB7XG4gICAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMubWVhc3VyZSgpO1xuICAgICAgICB0aGlzLl9zaXplQ2hhbmdlLm5leHQoW3dpZHRoLCBoZWlnaHRdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBlbnVtIFNDUk9MTF9TVEFURSB7XG4gICAgU0NST0xMSU5HLFxuICAgIElETEVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNjcm9sbEJhcldpZHRoKCkge1xuICAgIGxldCBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBpbm5lci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xuICAgIGlubmVyLnN0eWxlLmhlaWdodCA9IFwiMjAwcHhcIjtcblxuICAgIGxldCBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG91dGVyLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIG91dGVyLnN0eWxlLnRvcCA9IFwiMHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUubGVmdCA9IFwiMHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgb3V0ZXIuc3R5bGUud2lkdGggPSBcIjIwMHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUuaGVpZ2h0ID0gXCIxNTBweFwiO1xuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIjtcbiAgICBvdXRlci5hcHBlbmRDaGlsZChpbm5lcik7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcbiAgICBsZXQgdzEgPSBpbm5lci5vZmZzZXRXaWR0aDtcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9ICdzY3JvbGwnO1xuICAgIGxldCB3MiA9IGlubmVyLm9mZnNldFdpZHRoO1xuXG4gICAgaWYgKHcxID09IHcyKSB7XG4gICAgICAgIHcyID0gb3V0ZXIuY2xpZW50V2lkdGg7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChvdXRlcik7XG5cbiAgICByZXR1cm4gKHcxIC0gdzIpO1xufVxuXG4iXX0=