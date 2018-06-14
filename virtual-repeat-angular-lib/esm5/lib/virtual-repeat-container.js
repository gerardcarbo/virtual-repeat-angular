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
        this.rowHeight = 100;
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
        /*this._subscription.add(
                    this.scrollPosition
                        .pipe(
                            skip(1)
                        )
                        .subscribe((scrollY) => {
                        })
                );*/
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
    VirtualRepeatContainer.prototype.rowHeight;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvIiwic291cmNlcyI6WyJsaWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFVLFNBQVMsRUFBRSxVQUFVLEVBQTRCLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEgsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RSxPQUFPLEVBQVEsTUFBTSxFQUFFLEdBQUcsRUFBdUIsR0FBRyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNGLE1BQU0sQ0FBQyxxQkFBTSwwQkFBMEIsR0FBRyxHQUFHLENBQUM7QUFFOUMscUJBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0lBaUd4Qjs7OztPQUlHO0lBQ0g7NkJBekZnQyxDQUFDOytCQUNDLENBQUM7Z0NBQ0EsQ0FBQzs2QkFFRSxJQUFJLFlBQVksRUFBRTtrQ0FFSSxJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDOytCQUMvQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUM7MkJBQ3hCLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lDQUVoRCxLQUFLO2lDQUVMLGdCQUFnQjtrQ0FFVCxZQUFZLENBQUMsSUFBSTt5QkF5RHZCLEdBQUc7UUFtQjVCLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztLQUM3QztJQXZFRCxzQkFBSSxnREFBWTs7OztRQWlCaEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUM3Qjs7Ozs7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V0FBVyxDQUFDO0tBQzFCO0lBRUQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0NBQ3BCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vblwiXG5pbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIE91dHB1dCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBmcm9tRXZlbnQgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHNraXAsIGZpbHRlciwgdGFwLCBkZWxheSwgdGFrZSwgY29uY2F0LCBtYXAsIGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuZXhwb3J0IGNvbnN0IFNDUk9MTF9TVE9QX1RJTUVfVEhSRVNIT0xEID0gMjAwOyAvLyBpbiBtaWxsaXNlY29uZHNcblxuY29uc3QgSU5WQUxJRF9QT1NJVElPTiA9IC0xO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2djLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcicsIFxuICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lclwiICNsaXN0Q29udGFpbmVyIFtuZ0NsYXNzXT1cInNjcm9sbGJhclN0eWxlXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgW3N0eWxlLmhlaWdodF09XCJob2xkZXJIZWlnaHRJblB4XCI+XHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgPC9kaXY+XHJcbjwvZGl2PlxyXG5gLFxuICAgIHN0eWxlczogW2AuZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVye292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjtwb3NpdGlvbjpyZWxhdGl2ZTtjb250YWluOmxheW91dDstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyIC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXItaG9sZGVye3dpZHRoOjEwMCU7cG9zaXRpb246cmVsYXRpdmV9LmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci5ub3JtYWx7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmhpZGUtc2Nyb2xsYmFye3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowfWBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRDb250YWluZXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHByaXZhdGUgX2hvbGRlckhlaWdodDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJXaWR0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJIZWlnaHQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICAgIHByaXZhdGUgX3Njcm9sbFN0YXRlQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8U0NST0xMX1NUQVRFPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoU0NST0xMX1NUQVRFLklETEUpO1xuICAgIHByaXZhdGUgX3Njcm9sbFBvc2l0aW9uOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoMCk7XG4gICAgcHJpdmF0ZSBfc2l6ZUNoYW5nZTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcltdPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoWzAsIDBdKTtcblxuICAgIHByaXZhdGUgaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuXG4gICAgY3VycmVudFNjcm9sbFN0YXRlOiBTQ1JPTExfU1RBVEUgPSBTQ1JPTExfU1RBVEUuSURMRTtcblxuICAgIEBWaWV3Q2hpbGQoJ2xpc3RDb250YWluZXInKSBsaXN0Q29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gICAgc2Nyb2xsYmFyU3R5bGU6IHN0cmluZztcbiAgICBzY3JvbGxiYXJXaWR0aDogbnVtYmVyO1xuXG4gICAgc2V0IGhvbGRlckhlaWdodChoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBpZiAodHlwZW9mIGhlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvbGRlckhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ob2xkZXJIZWlnaHQgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2hlbiBpbml0aWFsaXphdGlvbiwgdGhlIGxpc3QtaG9sZGVyIGRvZXNuJ3Qgbm90IGhhdmUgaXRzIGhlaWdodC4gU28gdGhlIHNjcm9sbFRvcCBzaG91bGQgYmUgZGVsYXllZCBmb3Igd2FpdGluZ1xuICAgICAgICAgICAgLy8gdGhlIGxpc3QtaG9sZGVyIHJlbmRlcmVkIGJpZ2dlciB0aGFuIHRoZSBsaXN0LWNvbnRhaW5lci5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pbml0aWFsU2Nyb2xsVG9wICE9PSBJTlZBTElEX1BPU0lUSU9OICYmIHRoaXMuX2hvbGRlckhlaWdodCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wID0gSU5WQUxJRF9QT1NJVElPTjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvbGRlckhlaWdodDtcbiAgICB9XG5cbiAgICBnZXQgaG9sZGVySGVpZ2h0SW5QeCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhvbGRlckhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcxMDAlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGwgc3RhdGUgY2hhbmdlXG4gICAgICovXG4gICAgZ2V0IHNjcm9sbFN0YXRlQ2hhbmdlKCk6IE9ic2VydmFibGU8U0NST0xMX1NUQVRFPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxTdGF0ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KClcbiAgICBnZXQgc2Nyb2xsUG9zaXRpb24oKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBvc2l0aW9uLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxpc3QgY29udGFpbmVyIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICovXG4gICAgZ2V0IHNpemVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxudW1iZXJbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBASW5wdXQoKSByb3dIZWlnaHQ6IG51bWJlciA9IDEwMDtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IG5ld1Njcm9sbFBvc2l0aW9uKHA6IG51bWJlcikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncCcsIHApO1xuICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSBwO1xuICAgICAgICAvLyBpZiBsaXN0LWhvbGRlciBoYXMgbm8gaGVpZ2h0IGF0IHRoZSBjZXJ0YWluIHRpbWUuIHNjcm9sbFRvcCB3aWxsIG5vdCBiZSBzZXQuXG4gICAgICAgIGlmICghdGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQocCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVUlUaW1lbGluZU1ldGVyIGlzIG9wdGlvbmFsIGluamVjdGlvbi4gd2hlbiB0aGlzIGNvbXBvbmVudCB1c2VkIGluc2lkZSBhIFVJVGltZWxpbmVNZXRlci5cbiAgICAgKiBpdCBpcyByZXNwb25zaWJsZSB0byB1cGRhdGUgdGhlIHNjcm9sbFlcbiAgICAgKiBAcGFyYW0gX3RpbWVsaW5lTWV0ZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJTdHlsZSA9ICdub3JtYWwnO1xuICAgICAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gZ2V0U2Nyb2xsQmFyV2lkdGgoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbGJhclN0eWxlID09PSAnaGlkZS1zY3JvbGxiYXInKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5yaWdodCA9ICgwIC0gdGhpcy5zY3JvbGxiYXJXaWR0aCkgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gdGhpcy5zY3JvbGxiYXJXaWR0aCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdzY3JvbGwnKVxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlnbm9yZVNjcm9sbEV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoc2Nyb2xsWTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQoc2Nyb2xsWSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIC8qdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUG9zaXRpb25cbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgc2tpcCgxKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChzY3JvbGxZKSA9PiB7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgKTsqL1xuXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFBvc2l0aW9uXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5JRExFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPSBTQ1JPTExfU1RBVEUuU0NST0xMSU5HO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKFNDUk9MTF9TVE9QX1RJTUVfVEhSRVNIT0xEKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5TQ1JPTExJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5JRExFO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICBtZWFzdXJlKCk6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RDb250YWluZXIgJiYgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZFdpZHRoID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAvLyBsZXQgbWVhc3VyZWRIZWlnaHQgPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBsZXQgcmVjdCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSByZWN0LndpZHRoIC0gdGhpcy5zY3JvbGxiYXJXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgcmV0dXJuIHsgd2lkdGg6IHRoaXMuX2NvbnRhaW5lcldpZHRoLCBoZWlnaHQ6IHRoaXMuX2NvbnRhaW5lckhlaWdodCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB9XG5cbiAgICByZXF1ZXN0TWVhc3VyZSgpIHtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5tZWFzdXJlKCk7XG4gICAgICAgIHRoaXMuX3NpemVDaGFuZ2UubmV4dChbd2lkdGgsIGhlaWdodF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0NST0xMX1NUQVRFIHtcbiAgICBTQ1JPTExJTkcsXG4gICAgSURMRVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Nyb2xsQmFyV2lkdGgoKSB7XG4gICAgbGV0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgaW5uZXIuc3R5bGUuaGVpZ2h0ID0gXCIyMDBweFwiO1xuXG4gICAgbGV0IG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3V0ZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgb3V0ZXIuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMjAwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5oZWlnaHQgPSBcIjE1MHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xuICAgIGxldCB3MSA9IGlubmVyLm9mZnNldFdpZHRoO1xuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XG4gICAgbGV0IHcyID0gaW5uZXIub2Zmc2V0V2lkdGg7XG5cbiAgICBpZiAodzEgPT0gdzIpIHtcbiAgICAgICAgdzIgPSBvdXRlci5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcblxuICAgIHJldHVybiAodzEgLSB3Mik7XG59XG5cbiJdfQ==