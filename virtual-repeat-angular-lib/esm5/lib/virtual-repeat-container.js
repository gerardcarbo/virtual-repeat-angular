/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Component, ViewChild, ElementRef, Output, Input } from '@angular/core';
import { Subscription, BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, tap, map, debounceTime } from 'rxjs/operators';
export var /** @type {?} */ SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
var /** @type {?} */ INVALID_POSITION = -1;
var VirtualRepeatContainer = /** @class */ (function () {
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    function VirtualRepeatContainer() {
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
    Object.defineProperty(VirtualRepeatContainer.prototype, "holderHeight", {
        get: /**
         * @return {?}
         */
        function () {
            return this._holderHeight;
        },
        set: /**
         * @param {?} height
         * @return {?}
         */
        function (height) {
            var _this = this;
            if (typeof height !== 'undefined') {
                this._holderHeight = height;
                if (this._holderHeight === 0) {
                    this.listContainer.nativeElement.scrollTop = 0;
                }
                // When initialization, the list-holder doesn't not have its height. So the scrollTop should be delayed for waiting
                // the list-holder rendered bigger than the list-container.
                if (this._initialScrollTop !== INVALID_POSITION && this._holderHeight !== 0) {
                    setTimeout(function () {
                        _this.listContainer.nativeElement.scrollTop = _this._initialScrollTop;
                        _this._initialScrollTop = INVALID_POSITION;
                    });
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer.prototype, "holderHeightInPx", {
        get: /**
         * @return {?}
         */
        function () {
            if (this.holderHeight) {
                return this.holderHeight + 'px';
            }
            return '100%';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer.prototype, "scrollStateChange", {
        /**
         * scroll state change
         */
        get: /**
         * scroll state change
         * @return {?}
         */
        function () {
            return this._scrollStateChange.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer.prototype, "scrollPosition", {
        /**
         * current scroll position.
         */
        get: /**
         * current scroll position.
         * @return {?}
         */
        function () {
            return this._scrollPosition.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer.prototype, "sizeChange", {
        /**
         * list container width and height.
         */
        get: /**
         * list container width and height.
         * @return {?}
         */
        function () {
            return this._sizeChange.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer.prototype, "rowHeight", {
        set: /**
         * @param {?} rowHeight
         * @return {?}
         */
        function (rowHeight) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer.prototype, "newScrollPosition", {
        set: /**
         * @param {?} p
         * @return {?}
         */
        function (p) {
            // console.log('p', p);
            this.listContainer.nativeElement.scrollTop = p;
            // if list-holder has no height at the certain time. scrollTop will not be set.
            if (!this.holderHeight) {
                this._initialScrollTop = p;
            }
            this._scrollPosition.next(p);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    VirtualRepeatContainer.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.scrollbarStyle === 'hide-scrollbar') {
            this.listContainer.nativeElement.style.right = (0 - this.scrollbarWidth) + 'px';
            this.listContainer.nativeElement.style.paddingRight = this.scrollbarWidth + 'px';
        }
        if (window) {
            this._subscription.add(fromEvent(window, 'resize')
                .subscribe(function () {
                _this.requestMeasure();
            }));
        }
        this._subscription.add(fromEvent(this.listContainer.nativeElement, 'scroll')
            .pipe(filter(function () {
            if (_this.ignoreScrollEvent) {
                _this.ignoreScrollEvent = false;
                return false;
            }
            return true;
        }), map(function () {
            return _this.listContainer.nativeElement.scrollTop;
        }))
            .subscribe(function (scrollY) {
            _this._scrollPosition.next(scrollY);
        }));
        this._subscription.add(this.scrollPosition
            .pipe(tap(function () {
            if (_this.currentScrollState === SCROLL_STATE.IDLE) {
                _this.currentScrollState = SCROLL_STATE.SCROLLING;
                _this._scrollStateChange.next(_this.currentScrollState);
            }
        }), debounceTime(SCROLL_STOP_TIME_THRESHOLD))
            .subscribe(function () {
            if (_this.currentScrollState === SCROLL_STATE.SCROLLING) {
                _this.currentScrollState = SCROLL_STATE.IDLE;
                _this._scrollStateChange.next(_this.currentScrollState);
            }
        }));
        setTimeout(function () {
            _this.requestMeasure();
        });
    };
    /**
     * @return {?}
     */
    VirtualRepeatContainer.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._subscription.unsubscribe();
    };
    /**
     * @return {?}
     */
    VirtualRepeatContainer.prototype.measure = /**
     * @return {?}
     */
    function () {
        if (this.listContainer && this.listContainer.nativeElement) {
            // let measuredWidth = this.listContainer.nativeElement.clientWidth;
            // let measuredHeight = this.listContainer.nativeElement.clientHeight;
            var /** @type {?} */ rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return { width: this._containerWidth, height: this._containerHeight };
        }
        return { width: 0, height: 0 };
    };
    /**
     * @return {?}
     */
    VirtualRepeatContainer.prototype.requestMeasure = /**
     * @return {?}
     */
    function () {
        var _a = this.measure(), width = _a.width, height = _a.height;
        this._sizeChange.next([width, height]);
    };
    VirtualRepeatContainer.decorators = [
        { type: Component, args: [{
                    selector: 'gc-virtual-repeat-container',
                    template: "<div class=\"gc-virtual-repeat-container\" #listContainer [ngClass]=\"scrollbarStyle\">\n    <div class=\"gc-virtual-repeat-container\" [style.height]=\"holderHeightInPx\">\n        <ng-content></ng-content>\n    </div>\n</div>\n",
                    styles: [".gc-virtual-repeat-container{overflow-y:auto;overflow-x:hidden;position:relative;contain:layout;-webkit-overflow-scrolling:touch}.gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%;position:relative}.gc-virtual-repeat-container.normal{width:100%;height:100%}.gc-virtual-repeat-container.hide-scrollbar{position:absolute;top:0;left:0;bottom:0;right:0}"]
                },] },
    ];
    /** @nocollapse */
    VirtualRepeatContainer.ctorParameters = function () { return []; };
    VirtualRepeatContainer.propDecorators = {
        listContainer: [{ type: ViewChild, args: ['listContainer',] }],
        scrollPosition: [{ type: Output }],
        rowHeight: [{ type: Input }],
        newScrollPosition: [{ type: Input }]
    };
    return VirtualRepeatContainer;
}());
export { VirtualRepeatContainer };
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
var SCROLL_STATE = {
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
    var /** @type {?} */ inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";
    var /** @type {?} */ outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var /** @type {?} */ w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var /** @type {?} */ w2 = inner.offsetWidth;
    if (w1 == w2) {
        w2 = outer.clientWidth;
    }
    document.body.removeChild(outer);
    return (w1 - w2);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvIiwic291cmNlcyI6WyJsaWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFVLFNBQVMsRUFBRSxVQUFVLEVBQTRCLE1BQU0sRUFBRSxLQUFLLEVBQTRCLE1BQU0sZUFBZSxDQUFDO0FBQzVJLE9BQU8sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUUsT0FBTyxFQUFRLE1BQU0sRUFBRSxHQUFHLEVBQXVCLEdBQUcsRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzRixNQUFNLENBQUMscUJBQU0sMEJBQTBCLEdBQUcsR0FBRyxDQUFDO0FBRTlDLHFCQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDOztJQWdIeEI7Ozs7T0FJRztJQUNIOzZCQXhHZ0MsQ0FBQzsrQkFDQyxDQUFDO2dDQUNBLENBQUM7NkJBRUUsSUFBSSxZQUFZLEVBQUU7a0NBRUksSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQzsrQkFDL0MsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDOzJCQUN4QixJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQ0FFaEQsS0FBSztpQ0FFTCxnQkFBZ0I7a0NBRVQsWUFBWSxDQUFDLElBQUk7MEJBc0UvQixHQUFHOzJCQUNELEtBQUs7bUNBQ0csS0FBSztRQW1CaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO0tBQzdDO0lBdEZELHNCQUFJLGdEQUFZOzs7O1FBaUJoQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENB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T0FBTyxDQUFDO0lBQzVCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztJQUM3QixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDaEMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV6QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxxQkFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUMzQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDaEMscUJBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFFM0IsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDWCxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztLQUMxQjtJQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztDQUNwQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIlxuaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBPdXRwdXQsIElucHV0LCBTaW1wbGVDaGFuZ2VzLCBPbkNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBmcm9tRXZlbnQgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHNraXAsIGZpbHRlciwgdGFwLCBkZWxheSwgdGFrZSwgY29uY2F0LCBtYXAsIGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuZXhwb3J0IGNvbnN0IFNDUk9MTF9TVE9QX1RJTUVfVEhSRVNIT0xEID0gMjAwOyAvLyBpbiBtaWxsaXNlY29uZHNcblxuY29uc3QgSU5WQUxJRF9QT1NJVElPTiA9IC0xO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2djLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcicsXG4gICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgI2xpc3RDb250YWluZXIgW25nQ2xhc3NdPVwic2Nyb2xsYmFyU3R5bGVcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJcIiBbc3R5bGUuaGVpZ2h0XT1cImhvbGRlckhlaWdodEluUHhcIj5cclxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+XHJcbmAsXG4gICAgc3R5bGVzOiBbYC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJ7b3ZlcmZsb3cteTphdXRvO292ZXJmbG93LXg6aGlkZGVuO3Bvc2l0aW9uOnJlbGF0aXZlO2NvbnRhaW46bGF5b3V0Oy13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOnRvdWNofS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIgLmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci1ob2xkZXJ7d2lkdGg6MTAwJTtwb3NpdGlvbjpyZWxhdGl2ZX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLm5vcm1hbHt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIuaGlkZS1zY3JvbGxiYXJ7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjB9YF1cbn0pXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdENvbnRhaW5lciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSBfaG9sZGVySGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2NvbnRhaW5lcldpZHRoOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2NvbnRhaW5lckhlaWdodDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfc2Nyb2xsU3RhdGVDaGFuZ2U6IEJlaGF2aW9yU3ViamVjdDxTQ1JPTExfU1RBVEU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChTQ1JPTExfU1RBVEUuSURMRSk7XG4gICAgcHJpdmF0ZSBfc2Nyb2xsUG9zaXRpb246IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+ID0gbmV3IEJlaGF2aW9yU3ViamVjdCgwKTtcbiAgICBwcml2YXRlIF9zaXplQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyW10+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChbMCwgMF0pO1xuXG4gICAgcHJpdmF0ZSBpZ25vcmVTY3JvbGxFdmVudCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfaW5pdGlhbFNjcm9sbFRvcCA9IElOVkFMSURfUE9TSVRJT047XG5cbiAgICBjdXJyZW50U2Nyb2xsU3RhdGU6IFNDUk9MTF9TVEFURSA9IFNDUk9MTF9TVEFURS5JRExFO1xuXG4gICAgQFZpZXdDaGlsZCgnbGlzdENvbnRhaW5lcicpIGxpc3RDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgICBzY3JvbGxiYXJTdHlsZTogc3RyaW5nO1xuICAgIHNjcm9sbGJhcldpZHRoOiBudW1iZXI7XG5cbiAgICBzZXQgaG9sZGVySGVpZ2h0KGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5faG9sZGVySGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hvbGRlckhlaWdodCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXaGVuIGluaXRpYWxpemF0aW9uLCB0aGUgbGlzdC1ob2xkZXIgZG9lc24ndCBub3QgaGF2ZSBpdHMgaGVpZ2h0LiBTbyB0aGUgc2Nyb2xsVG9wIHNob3VsZCBiZSBkZWxheWVkIGZvciB3YWl0aW5nXG4gICAgICAgICAgICAvLyB0aGUgbGlzdC1ob2xkZXIgcmVuZGVyZWQgYmlnZ2VyIHRoYW4gdGhlIGxpc3QtY29udGFpbmVyLlxuICAgICAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgIT09IElOVkFMSURfUE9TSVRJT04gJiYgdGhpcy5faG9sZGVySGVpZ2h0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuX2luaXRpYWxTY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGhvbGRlckhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5faG9sZGVySGVpZ2h0O1xuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHRJblB4KCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLmhvbGRlckhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9sZGVySGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzEwMCUnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbCBzdGF0ZSBjaGFuZ2VcbiAgICAgKi9cbiAgICBnZXQgc2Nyb2xsU3RhdGVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxTQ1JPTExfU1RBVEU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKVxuICAgIGdldCBzY3JvbGxQb3NpdGlvbigpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsUG9zaXRpb24uYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbGlzdCBjb250YWluZXIgd2lkdGggYW5kIGhlaWdodC5cbiAgICAgKi9cbiAgICBnZXQgc2l6ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPG51bWJlcltdPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIEBJbnB1dCgpIHNldCByb3dIZWlnaHQocm93SGVpZ2h0OiBzdHJpbmcpIHtcbiAgICAgICAgaWYocm93SGVpZ2h0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHJvd0hlaWdodCAhPSBcImF1dG9cIikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jvd0hlaWdodCA9IE51bWJlcihyb3dIZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodEF1dG9Db21wdXRlZCA9IHRoaXMuX2F1dG9IZWlnaHQgPSAgZmFsc2U7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGVpZ2h0QXV0b0NvbXB1dGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXV0b0hlaWdodCA9IHRydWU7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9IFxuXG4gICAgX3Jvd0hlaWdodDogbnVtYmVyID0gMTAwO1xuICAgIF9hdXRvSGVpZ2h0OiBib29sZWFuID0gZmFsc2U7XG4gICAgX2hlaWdodEF1dG9Db21wdXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBzZXQgbmV3U2Nyb2xsUG9zaXRpb24ocDogbnVtYmVyKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwJywgcCk7XG4gICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHA7XG4gICAgICAgIC8vIGlmIGxpc3QtaG9sZGVyIGhhcyBubyBoZWlnaHQgYXQgdGhlIGNlcnRhaW4gdGltZS4gc2Nyb2xsVG9wIHdpbGwgbm90IGJlIHNldC5cbiAgICAgICAgaWYgKCF0aGlzLmhvbGRlckhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFRvcCA9IHA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVSVRpbWVsaW5lTWV0ZXIgaXMgb3B0aW9uYWwgaW5qZWN0aW9uLiB3aGVuIHRoaXMgY29tcG9uZW50IHVzZWQgaW5zaWRlIGEgVUlUaW1lbGluZU1ldGVyLlxuICAgICAqIGl0IGlzIHJlc3BvbnNpYmxlIHRvIHVwZGF0ZSB0aGUgc2Nyb2xsWVxuICAgICAqIEBwYXJhbSBfdGltZWxpbmVNZXRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnNjcm9sbGJhclN0eWxlID0gJ25vcm1hbCc7XG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSBnZXRTY3JvbGxCYXJXaWR0aCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsYmFyU3R5bGUgPT09ICdoaWRlLXNjcm9sbGJhcicpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnN0eWxlLnJpZ2h0ID0gKDAgLSB0aGlzLnNjcm9sbGJhcldpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSB0aGlzLnNjcm9sbGJhcldpZHRoICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIGZyb21FdmVudCh0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pZ25vcmVTY3JvbGxFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChzY3JvbGxZOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChzY3JvbGxZKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUG9zaXRpb25cbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgdGFwKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLklETEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5TQ1JPTExJTkc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLlNDUk9MTElORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjcm9sbFN0YXRlID0gU0NST0xMX1NUQVRFLklETEU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIG1lYXN1cmUoKTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9IHtcbiAgICAgICAgaWYgKHRoaXMubGlzdENvbnRhaW5lciAmJiB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgLy8gbGV0IG1lYXN1cmVkV2lkdGggPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZEhlaWdodCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGxldCByZWN0ID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHJlY3Qud2lkdGggLSB0aGlzLnNjcm9sbGJhcldpZHRoO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4geyB3aWR0aDogdGhpcy5fY29udGFpbmVyV2lkdGgsIGhlaWdodDogdGhpcy5fY29udGFpbmVySGVpZ2h0IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuICAgIH1cblxuICAgIHJlcXVlc3RNZWFzdXJlKCkge1xuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLm1lYXN1cmUoKTtcbiAgICAgICAgdGhpcy5fc2l6ZUNoYW5nZS5uZXh0KFt3aWR0aCwgaGVpZ2h0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBTQ1JPTExfU1RBVEUge1xuICAgIFNDUk9MTElORyxcbiAgICBJRExFXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JvbGxCYXJXaWR0aCgpIHtcbiAgICBsZXQgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgaW5uZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICBpbm5lci5zdHlsZS5oZWlnaHQgPSBcIjIwMHB4XCI7XG5cbiAgICBsZXQgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdXRlci5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBvdXRlci5zdHlsZS50b3AgPSBcIjBweFwiO1xuICAgIG91dGVyLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgIG91dGVyLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLnN0eWxlLndpZHRoID0gXCIyMDBweFwiO1xuICAgIG91dGVyLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XG4gICAgbGV0IHcxID0gaW5uZXIub2Zmc2V0V2lkdGg7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSAnc2Nyb2xsJztcbiAgICBsZXQgdzIgPSBpbm5lci5vZmZzZXRXaWR0aDtcblxuICAgIGlmICh3MSA9PSB3Mikge1xuICAgICAgICB3MiA9IG91dGVyLmNsaWVudFdpZHRoO1xuICAgIH1cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3V0ZXIpO1xuXG4gICAgcmV0dXJuICh3MSAtIHcyKTtcbn1cblxuIl19