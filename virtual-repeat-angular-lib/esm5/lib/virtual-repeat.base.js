/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Input, isDevMode, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
var Recycler = /** @class */ (function () {
    function Recycler() {
        this.limit = 0;
        this._scrapViews = new Map();
    }
    /**
     * @param {?} position
     * @return {?}
     */
    Recycler.prototype.getView = /**
     * @param {?} position
     * @return {?}
     */
    function (position) {
        var /** @type {?} */ view = this._scrapViews.get(position);
        if (!view && this._scrapViews.size > 0) {
            position = this._scrapViews.keys().next().value;
            view = this._scrapViews.get(position);
        }
        if (view) {
            this._scrapViews.delete(position);
        }
        return view || null;
    };
    /**
     * @param {?} position
     * @param {?} view
     * @return {?}
     */
    Recycler.prototype.recycleView = /**
     * @param {?} position
     * @param {?} view
     * @return {?}
     */
    function (position, view) {
        view.detach();
        this._scrapViews.set(position, view);
    };
    /**
     * scrap view count should not exceed the number of current attached views.
     */
    /**
     * scrap view count should not exceed the number of current attached views.
     * @return {?}
     */
    Recycler.prototype.pruneScrapViews = /**
     * scrap view count should not exceed the number of current attached views.
     * @return {?}
     */
    function () {
        if (this.limit <= 1) {
            return;
        }
        var /** @type {?} */ keyIterator = this._scrapViews.keys();
        var /** @type {?} */ key;
        while (this._scrapViews.size > this.limit) {
            key = keyIterator.next().value;
            this._scrapViews.get(key).destroy();
            this._scrapViews.delete(key);
        }
    };
    /**
     * @param {?} limit
     * @return {?}
     */
    Recycler.prototype.setScrapViewsLimit = /**
     * @param {?} limit
     * @return {?}
     */
    function (limit) {
        this.limit = limit;
        this.pruneScrapViews();
    };
    /**
     * @return {?}
     */
    Recycler.prototype.clean = /**
     * @return {?}
     */
    function () {
        this._scrapViews.forEach(function (view) {
            view.destroy();
        });
        this._scrapViews.clear();
    };
    return Recycler;
}());
export { Recycler };
function Recycler_tsickle_Closure_declarations() {
    /** @type {?} */
    Recycler.prototype.limit;
    /** @type {?} */
    Recycler.prototype._scrapViews;
}
var VirtualRepeatRow = /** @class */ (function () {
    function VirtualRepeatRow($implicit, index, count) {
        this.$implicit = $implicit;
        this.index = index;
        this.count = count;
    }
    Object.defineProperty(VirtualRepeatRow.prototype, "first", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatRow.prototype, "last", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index === this.count - 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatRow.prototype, "even", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index % 2 === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatRow.prototype, "odd", {
        get: /**
         * @return {?}
         */
        function () {
            return !this.even;
        },
        enumerable: true,
        configurable: true
    });
    return VirtualRepeatRow;
}());
export { VirtualRepeatRow };
function VirtualRepeatRow_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeatRow.prototype.$implicit;
    /** @type {?} */
    VirtualRepeatRow.prototype.index;
    /** @type {?} */
    VirtualRepeatRow.prototype.count;
}
/**
 * @abstract
 * @template T
 */
var VirtualRepeatBase = /** @class */ (function () {
    function VirtualRepeatBase(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
        this._virtualRepeatContainer = _virtualRepeatContainer;
        this._differs = _differs;
        this._template = _template;
        this._viewContainerRef = _viewContainerRef;
        this._subscription = new Subscription();
        /**
         * scroll offset of y-axis in pixel
         */
        this._scrollY = 0;
        /**
         * when this value is true, a full clean layout is required, every element must be reposition
         */
        this._invalidate = true;
        /**
         * when this value is true, a layout is in process
         */
        this._isInLayout = false;
        this._isInMeasure = false;
        this._recycler = new Recycler();
    }
    Object.defineProperty(VirtualRepeatBase.prototype, "virtualRepeatAsynchForTrackBy", {
        get: /**
         * @return {?}
         */
        function () {
            return this._trackByFn;
        },
        set: /**
         * @param {?} fn
         * @return {?}
         */
        function (fn) {
            if (isDevMode() && fn != null && typeof fn !== 'function') {
                if (/** @type {?} */ (console) && /** @type {?} */ (console.warn)) {
                    console.warn("trackBy must be a function, but received " + JSON.stringify(fn) + ". " +
                        "See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.");
                }
            }
            this._trackByFn = fn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatBase.prototype, "virtualRepeatAsynchForTemplate", {
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (value) {
                this._template = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    VirtualRepeatBase.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this._subscription.add(this._virtualRepeatContainer.scrollPosition
            .pipe(filter(function (scrollY) {
            return Math.abs(scrollY - _this._scrollY) >= _this._virtualRepeatContainer._rowHeight;
        }), debounceTime(60))
            .subscribe(function (scrollY) {
            _this._scrollY = scrollY;
            _this.requestLayout();
        }));
        this._subscription.add(this._virtualRepeatContainer.sizeChange.subscribe(function (_a) {
            var _b = tslib_1.__read(_a, 2), width = _b[0], height = _b[1];
            // console.log('sizeChange: ', width, height);
            // console.log('sizeChange: ', width, height);
            _this._containerWidth = width;
            _this._containerHeight = height;
            _this.requestMeasure();
        }));
    };
    /**
     * @return {?}
     */
    VirtualRepeatBase.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._subscription.unsubscribe();
        this._recycler.clean();
    };
    /**
     * @return {?}
     */
    VirtualRepeatBase.prototype.requestMeasure = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._isInMeasure || this._isInLayout) {
            clearTimeout(this._pendingMeasurement);
            this._pendingMeasurement = window.setTimeout(function () {
                _this.requestMeasure();
            }, 60);
            return;
        }
        this.measure();
    };
    /**
     * @return {?}
     */
    VirtualRepeatBase.prototype.requestLayout = /**
     * @return {?}
     */
    function () {
        if (!this._isInMeasure) {
            this.layout();
        }
    };
    /**
     * @return {?}
     */
    VirtualRepeatBase.prototype.detachAllViews = /**
     * @return {?}
     */
    function () {
        for (var /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
            var /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
            this._viewContainerRef.detach(i);
            i--;
        }
        this._isInLayout = false;
        this._invalidate = false;
        return;
    };
    /**
     * @return {?}
     */
    VirtualRepeatBase.prototype.calculateScrapViewsLimit = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ limit = (this._containerHeight / this._virtualRepeatContainer._rowHeight) + 5;
        this._recycler.setScrapViewsLimit(limit);
    };
    /**
     * @param {?} viewElement
     * @param {?} y
     * @return {?}
     */
    VirtualRepeatBase.prototype.applyStyles = /**
     * @param {?} viewElement
     * @param {?} y
     * @return {?}
     */
    function (viewElement, y) {
        viewElement.style.transform = "translate3d(0, " + y + "px, 0)";
        viewElement.style.webkitTransform = "translate3d(0, " + y + "px, 0)";
        viewElement.style.width = this._containerWidth + "px";
        viewElement.style.height = this._virtualRepeatContainer._rowHeight + "px";
        viewElement.style.position = 'absolute';
    };
    /**
     * @param {?} position
     * @param {?} view
     * @param {?} addBefore
     * @return {?}
     */
    VirtualRepeatBase.prototype.dispatchLayout = /**
     * @param {?} position
     * @param {?} view
     * @param {?} addBefore
     * @return {?}
     */
    function (position, view, addBefore) {
        var /** @type {?} */ startPosY = position * this._virtualRepeatContainer._rowHeight;
        this.applyStyles((/** @type {?} */ (view)).rootNodes[0], startPosY);
        if (addBefore) {
            this._viewContainerRef.insert(view, 0);
        }
        else {
            this._viewContainerRef.insert(view);
        }
        view.reattach();
        //autoHeight update on first view attached
        if (this._virtualRepeatContainer._autoHeight && !this._virtualRepeatContainer._heightAutoComputed) {
            this._virtualRepeatContainer._rowHeight = (/** @type {?} */ (view)).rootNodes[0].scrollHeight;
            this._virtualRepeatContainer._heightAutoComputed = true;
            this.requestMeasure();
        }
    };
    /**
     * @param {?} collection_length
     * @return {?}
     */
    VirtualRepeatBase.prototype.findPositionInRange = /**
     * @param {?} collection_length
     * @return {?}
     */
    function (collection_length) {
        var /** @type {?} */ scrollY = this._scrollY;
        var /** @type {?} */ firstPosition = Math.floor(scrollY / this._virtualRepeatContainer._rowHeight);
        var /** @type {?} */ firstPositionOffset = scrollY - firstPosition * this._virtualRepeatContainer._rowHeight;
        var /** @type {?} */ lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer._rowHeight) + firstPosition;
        this._firstItemPosition = Math.max(firstPosition - 5, 0);
        this._lastItemPosition = Math.min(lastPosition + 5, collection_length - 1);
    };
    VirtualRepeatBase.propDecorators = {
        virtualRepeatAsynchOf: [{ type: Input }],
        virtualRepeatAsynchForTrackBy: [{ type: Input }],
        virtualRepeatAsynchForTemplate: [{ type: Input }]
    };
    return VirtualRepeatBase;
}());
export { VirtualRepeatBase };
function VirtualRepeatBase_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeatBase.prototype._differ;
    /** @type {?} */
    VirtualRepeatBase.prototype._trackByFn;
    /** @type {?} */
    VirtualRepeatBase.prototype._subscription;
    /**
     * scroll offset of y-axis in pixel
     * @type {?}
     */
    VirtualRepeatBase.prototype._scrollY;
    /**
     * first visible item index in collection
     * @type {?}
     */
    VirtualRepeatBase.prototype._firstItemPosition;
    /**
     * last visible item index in collection
     * @type {?}
     */
    VirtualRepeatBase.prototype._lastItemPosition;
    /** @type {?} */
    VirtualRepeatBase.prototype._containerWidth;
    /** @type {?} */
    VirtualRepeatBase.prototype._containerHeight;
    /**
     * when this value is true, a full clean layout is required, every element must be reposition
     * @type {?}
     */
    VirtualRepeatBase.prototype._invalidate;
    /**
     * when this value is true, a layout is in process
     * @type {?}
     */
    VirtualRepeatBase.prototype._isInLayout;
    /** @type {?} */
    VirtualRepeatBase.prototype._isInMeasure;
    /** @type {?} */
    VirtualRepeatBase.prototype._pendingMeasurement;
    /** @type {?} */
    VirtualRepeatBase.prototype._recycler;
    /** @type {?} */
    VirtualRepeatBase.prototype.virtualRepeatAsynchOf;
    /** @type {?} */
    VirtualRepeatBase.prototype._virtualRepeatContainer;
    /** @type {?} */
    VirtualRepeatBase.prototype._differs;
    /** @type {?} */
    VirtualRepeatBase.prototype._template;
    /** @type {?} */
    VirtualRepeatBase.prototype._viewContainerRef;
    /**
     * @abstract
     * @param {?} changes
     * @return {?}
     */
    VirtualRepeatBase.prototype.ngOnChanges = function (changes) { };
    /**
     * @abstract
     * @return {?}
     */
    VirtualRepeatBase.prototype.measure = function () { };
    /**
     * @abstract
     * @return {?}
     */
    VirtualRepeatBase.prototype.layout = function () { };
    /**
     * @abstract
     * @param {?} collection_length
     * @return {?}
     */
    VirtualRepeatBase.prototype.insertViews = function (collection_length) { };
    /**
     * @abstract
     * @param {?} collection_length
     * @param {?} position
     * @return {?}
     */
    VirtualRepeatBase.prototype.getView = function (collection_length, position) { };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuYmFzZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLyIsInNvdXJjZXMiOlsibGliL3ZpcnR1YWwtcmVwZWF0LmJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBSUgsS0FBSyxFQUNMLFNBQVMsRUFVVCxXQUFXLEVBSWQsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFlBQVksRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUNoRCxPQUFPLEVBQUUsTUFBTSxFQUFPLFlBQVksRUFBUyxNQUFNLGdCQUFnQixDQUFDO0FBR2xFLElBQUE7O3FCQUM0QixDQUFDOzJCQUNtQixJQUFJLEdBQUcsRUFBRTs7Ozs7O0lBRXJELDBCQUFPOzs7O0lBQVAsVUFBUSxRQUFnQjtRQUNwQixxQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDaEQsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7S0FDdkI7Ozs7OztJQUVELDhCQUFXOzs7OztJQUFYLFVBQVksUUFBZ0IsRUFBRSxJQUFhO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN4QztJQUVEOztPQUVHOzs7OztJQUNILGtDQUFlOzs7O0lBQWY7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDO1NBQ1Y7UUFDRCxxQkFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQyxxQkFBSSxHQUFXLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDaEM7S0FDSjs7Ozs7SUFFRCxxQ0FBa0I7Ozs7SUFBbEIsVUFBbUIsS0FBYTtRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDMUI7Ozs7SUFFRCx3QkFBSzs7O0lBQUw7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQWE7WUFDbkMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2xCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDNUI7bUJBeEVMO0lBeUVDLENBQUE7QUFoREQsb0JBZ0RDOzs7Ozs7O0FBRUQsSUFBQTtJQUNJLDBCQUFtQixTQUFjLEVBQVMsS0FBYSxFQUFTLEtBQWE7UUFBMUQsY0FBUyxHQUFULFNBQVMsQ0FBSztRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO0tBQzVFO0lBRUQsc0JBQUksbUNBQUs7Ozs7UUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztTQUMzQjs7O09BQUE7SUFFRCxzQkFBSSxrQ0FBSTs7OztRQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDeEM7OztPQUFBO0lBRUQsc0JBQUksa0NBQUk7Ozs7UUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7OztPQUFBO0lBRUQsc0JBQUksaUNBQUc7Ozs7UUFBUDtZQUNJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDckI7OztPQUFBOzJCQTdGTDtJQThGQyxDQUFBO0FBbkJELDRCQW1CQzs7Ozs7Ozs7Ozs7Ozs7SUErREcsMkJBQXNCLHVCQUErQyxFQUN2RCxRQUF5QixFQUN6QixTQUF3QyxFQUN4QyxpQkFBbUM7UUFIM0IsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF3QjtRQUN2RCxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUN6QixjQUFTLEdBQVQsU0FBUyxDQUErQjtRQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCOzZCQTVEVCxJQUFJLFlBQVksRUFBRTs7Ozt3QkFJN0IsQ0FBQzs7OzsyQkFnQkcsSUFBSTs7OzsyQkFJSixLQUFLOzRCQUVKLEtBQUs7eUJBSVAsSUFBSSxRQUFRLEVBQUU7S0ErQjdDO0lBM0JELHNCQUNJLDREQUE2Qjs7OztRQVdqQztZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQzFCOzs7OztRQWRELFVBQ2tDLEVBQXNCO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDeEQsRUFBRSxDQUFDLENBQUMsa0JBQUssT0FBTyx1QkFBUyxPQUFPLENBQUMsSUFBSSxHQUFFLENBQUM7b0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQ1IsOENBQTRDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQUk7d0JBQ2xFLHdIQUF3SCxDQUFDLENBQUM7aUJBQ2pJO2FBQ0o7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztTQUN4Qjs7O09BQUE7SUFNRCxzQkFDSSw2REFBOEI7Ozs7O1FBRGxDLFVBQ21DLEtBQW9DO1lBQ25FLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7YUFDMUI7U0FDSjs7O09BQUE7Ozs7SUFVRCxvQ0FBUTs7O0lBQVI7UUFBQSxpQkF1QkM7UUF0QkcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWM7YUFDN0QsSUFBSSxDQUNELE1BQU0sQ0FBQyxVQUFDLE9BQU87WUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUM7U0FDdkYsQ0FBQyxFQUNGLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FDbkI7YUFDQSxTQUFTLENBQ04sVUFBQyxPQUFPO1lBQ0osS0FBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCLENBQ0osQ0FBQyxDQUFDO1FBRVAsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQ3BFLFVBQUMsRUFBZTtnQkFBZiwwQkFBZSxFQUFkLGFBQUssRUFBRSxjQUFNOztZQUVYLEFBREEsOENBQThDO1lBQzlDLEtBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7WUFDL0IsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3pCLENBQ0osQ0FBQyxDQUFDO0tBQ047Ozs7SUFFRCx1Q0FBVzs7O0lBQVg7UUFDSSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDMUI7Ozs7SUFFUywwQ0FBYzs7O0lBQXhCO1FBQUEsaUJBU0M7UUFSRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDekMsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3pCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUM7U0FDVjtRQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNsQjs7OztJQUVTLHlDQUFhOzs7SUFBdkI7UUFDSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNqQjtLQUNKOzs7O0lBTVMsMENBQWM7OztJQUF4QjtRQUNJLEdBQUcsQ0FBQyxDQUFDLHFCQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNyRCxxQkFBSSxLQUFLLHFCQUFzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7WUFDN0UsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDLEVBQUUsQ0FBQztTQUNQO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsTUFBTSxDQUFDO0tBQ1Y7Ozs7SUFFUyxvREFBd0I7OztJQUFsQztRQUNJLHFCQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDNUM7Ozs7OztJQUlTLHVDQUFXOzs7OztJQUFyQixVQUFzQixXQUF3QixFQUFFLENBQVM7UUFDckQsV0FBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsb0JBQWtCLENBQUMsV0FBUSxDQUFDO1FBQzFELFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLG9CQUFrQixDQUFDLFdBQVEsQ0FBQztRQUNoRSxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBTSxJQUFJLENBQUMsZUFBZSxPQUFJLENBQUM7UUFDdEQsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsT0FBSSxDQUFDO1FBQzFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztLQUMzQzs7Ozs7OztJQUVTLDBDQUFjOzs7Ozs7SUFBeEIsVUFBeUIsUUFBZ0IsRUFBRSxJQUFhLEVBQUUsU0FBa0I7UUFDeEUscUJBQUksU0FBUyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDO1FBQ25FLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQUMsSUFBeUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN0RixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDMUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkM7UUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7O1FBR2hCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsQ0FDakcsQ0FBQztZQUNHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLEdBQUcsbUJBQU0sSUFBSSxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUNoRixJQUFJLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQ3hELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN6QjtLQUNKOzs7OztJQUVTLCtDQUFtQjs7OztJQUE3QixVQUE4QixpQkFBeUI7UUFDbkQscUJBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDNUIscUJBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsRixxQkFBSSxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUM7UUFDNUYscUJBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLEdBQUcsYUFBYSxDQUFDO1FBQ3RJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUM5RTs7d0NBeElBLEtBQUs7Z0RBRUwsS0FBSztpREFnQkwsS0FBSzs7NEJBdEpWOztTQWdHc0IsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIERpcmVjdGl2ZSxcclxuICAgIERvQ2hlY2ssXHJcbiAgICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgICBJbnB1dCxcclxuICAgIGlzRGV2TW9kZSxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLFxyXG4gICAgSXRlcmFibGVDaGFuZ2VzLFxyXG4gICAgSXRlcmFibGVEaWZmZXIsXHJcbiAgICBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICBOZ0l0ZXJhYmxlLFxyXG4gICAgT25DaGFuZ2VzLFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgT25Jbml0LFxyXG4gICAgU2ltcGxlQ2hhbmdlcyxcclxuICAgIFRlbXBsYXRlUmVmLFxyXG4gICAgVHJhY2tCeUZ1bmN0aW9uLFxyXG4gICAgVmlld0NvbnRhaW5lclJlZixcclxuICAgIFZpZXdSZWZcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaWx0ZXIsIG1hcCwgZGVib3VuY2VUaW1lLCBmaXJzdCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVjeWNsZXIge1xyXG4gICAgcHJpdmF0ZSBsaW1pdDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX3NjcmFwVmlld3M6IE1hcDxudW1iZXIsIFZpZXdSZWY+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGdldFZpZXcocG9zaXRpb246IG51bWJlcik6IFZpZXdSZWYgfCBudWxsIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3NjcmFwVmlld3MuZ2V0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoIXZpZXcgJiYgdGhpcy5fc2NyYXBWaWV3cy5zaXplID4gMCkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX3NjcmFwVmlld3Mua2V5cygpLm5leHQoKS52YWx1ZTtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3NjcmFwVmlld3MuZ2V0KHBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZXcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5kZWxldGUocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldyB8fCBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3ljbGVWaWV3KHBvc2l0aW9uOiBudW1iZXIsIHZpZXc6IFZpZXdSZWYpIHtcclxuICAgICAgICB2aWV3LmRldGFjaCgpO1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3Muc2V0KHBvc2l0aW9uLCB2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmFwIHZpZXcgY291bnQgc2hvdWxkIG5vdCBleGNlZWQgdGhlIG51bWJlciBvZiBjdXJyZW50IGF0dGFjaGVkIHZpZXdzLlxyXG4gICAgICovXHJcbiAgICBwcnVuZVNjcmFwVmlld3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGltaXQgPD0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXlJdGVyYXRvciA9IHRoaXMuX3NjcmFwVmlld3Mua2V5cygpO1xyXG4gICAgICAgIGxldCBrZXk6IG51bWJlcjtcclxuICAgICAgICB3aGlsZSAodGhpcy5fc2NyYXBWaWV3cy5zaXplID4gdGhpcy5saW1pdCkge1xyXG4gICAgICAgICAgICBrZXkgPSBrZXlJdGVyYXRvci5uZXh0KCkudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZ2V0KGtleSkuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTY3JhcFZpZXdzTGltaXQobGltaXQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGltaXQgPSBsaW1pdDtcclxuICAgICAgICB0aGlzLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFuKCkge1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZm9yRWFjaCgodmlldzogVmlld1JlZikgPT4ge1xyXG4gICAgICAgICAgICB2aWV3LmRlc3Ryb3koKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0Um93IHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyAkaW1wbGljaXQ6IGFueSwgcHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBjb3VudDogbnVtYmVyKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4ID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsYXN0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXZlbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9kZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuZXZlbjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpcnR1YWxSZXBlYXRCYXNlPFQ+IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPjtcclxuICAgIHByb3RlY3RlZCBfdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248VD47XHJcbiAgICBwcm90ZWN0ZWQgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JvbGwgb2Zmc2V0IG9mIHktYXhpcyBpbiBwaXhlbFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX3Njcm9sbFk6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIGZpcnN0IHZpc2libGUgaXRlbSBpbmRleCBpbiBjb2xsZWN0aW9uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfZmlyc3RJdGVtUG9zaXRpb246IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICogbGFzdCB2aXNpYmxlIGl0ZW0gaW5kZXggaW4gY29sbGVjdGlvblxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgX2xhc3RJdGVtUG9zaXRpb246IG51bWJlcjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lcldpZHRoOiBudW1iZXI7XHJcbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lckhlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hlbiB0aGlzIHZhbHVlIGlzIHRydWUsIGEgZnVsbCBjbGVhbiBsYXlvdXQgaXMgcmVxdWlyZWQsIGV2ZXJ5IGVsZW1lbnQgbXVzdCBiZSByZXBvc2l0aW9uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaW52YWxpZGF0ZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAvKipcclxuICAgICAqIHdoZW4gdGhpcyB2YWx1ZSBpcyB0cnVlLCBhIGxheW91dCBpcyBpbiBwcm9jZXNzXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfaXNJbkxheW91dDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByb3RlY3RlZCBfaXNJbk1lYXN1cmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX3BlbmRpbmdNZWFzdXJlbWVudDogbnVtYmVyO1xyXG5cclxuICAgIHByb3RlY3RlZCBfcmVjeWNsZXI6IFJlY3ljbGVyID0gbmV3IFJlY3ljbGVyKCk7XHJcblxyXG4gICAgQElucHV0KCkgdmlydHVhbFJlcGVhdEFzeW5jaE9mOiBOZ0l0ZXJhYmxlPFQ+O1xyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfdmlydHVhbFJlcGVhdENvbnRhaW5lcjogVmlydHVhbFJlcGVhdENvbnRhaW5lcixcclxuICAgICAgICBwcm90ZWN0ZWQgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgICAgICBwcm90ZWN0ZWQgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcclxuICAgICAgICBwcm90ZWN0ZWQgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcclxuICAgIH1cclxuXHJcbiAgICBhYnN0cmFjdCBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTtcclxuXHJcbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuc2Nyb2xsUG9zaXRpb25cclxuICAgICAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIoKHNjcm9sbFkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoc2Nyb2xsWSAtIHRoaXMuX3Njcm9sbFkpID49IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodDtcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKDYwKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgICAgICAoc2Nyb2xsWSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFkgPSBzY3JvbGxZO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZCh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnNpemVDaGFuZ2Uuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAoW3dpZHRoLCBoZWlnaHRdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc2l6ZUNoYW5nZTogJywgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuY2xlYW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgcmVxdWVzdE1lYXN1cmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5NZWFzdXJlIHx8IHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3BlbmRpbmdNZWFzdXJlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdNZWFzdXJlbWVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICAgICAgfSwgNjApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWVhc3VyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCByZXF1ZXN0TGF5b3V0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbk1lYXN1cmUpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXlvdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IG1lYXN1cmUoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgbGF5b3V0KCk7XHJcblxyXG4gICAgcHJvdGVjdGVkIGRldGFjaEFsbFZpZXdzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCkge1xyXG4gICAgICAgIGxldCBsaW1pdCA9ICh0aGlzLl9jb250YWluZXJIZWlnaHQgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQpICsgNTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5zZXRTY3JhcFZpZXdzTGltaXQobGltaXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBpbnNlcnRWaWV3cyhjb2xsZWN0aW9uX2xlbmd0aDogbnVtYmVyKVxyXG5cclxuICAgIHByb3RlY3RlZCBhcHBseVN0eWxlcyh2aWV3RWxlbWVudDogSFRNTEVsZW1lbnQsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgwLCAke3l9cHgsIDApYDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoMCwgJHt5fXB4LCAwKWA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUud2lkdGggPSBgJHt0aGlzLl9jb250YWluZXJXaWR0aH1weGA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0fXB4YDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGRpc3BhdGNoTGF5b3V0KHBvc2l0aW9uOiBudW1iZXIsIHZpZXc6IFZpZXdSZWYsIGFkZEJlZm9yZTogYm9vbGVhbikge1xyXG4gICAgICAgIGxldCBzdGFydFBvc1kgPSBwb3NpdGlvbiAqIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodDtcclxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKCh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pikucm9vdE5vZGVzWzBdLCBzdGFydFBvc1kpO1xyXG4gICAgICAgIGlmIChhZGRCZWZvcmUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldywgMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZpZXcucmVhdHRhY2goKTtcclxuXHJcbiAgICAgICAgLy9hdXRvSGVpZ2h0IHVwZGF0ZSBvbiBmaXJzdCB2aWV3IGF0dGFjaGVkXHJcbiAgICAgICAgaWYodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodCAmJiAhdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5faGVpZ2h0QXV0b0NvbXB1dGVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0ID0gKDxhbnk+dmlldykucm9vdE5vZGVzWzBdLnNjcm9sbEhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5faGVpZ2h0QXV0b0NvbXB1dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZmluZFBvc2l0aW9uSW5SYW5nZShjb2xsZWN0aW9uX2xlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHNjcm9sbFkgPSB0aGlzLl9zY3JvbGxZO1xyXG4gICAgICAgIGxldCBmaXJzdFBvc2l0aW9uID0gTWF0aC5mbG9vcihzY3JvbGxZIC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0KTtcclxuICAgICAgICBsZXQgZmlyc3RQb3NpdGlvbk9mZnNldCA9IHNjcm9sbFkgLSBmaXJzdFBvc2l0aW9uICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0O1xyXG4gICAgICAgIGxldCBsYXN0UG9zaXRpb24gPSBNYXRoLmNlaWwoKHRoaXMuX2NvbnRhaW5lckhlaWdodCArIGZpcnN0UG9zaXRpb25PZmZzZXQpIC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0KSArIGZpcnN0UG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gPSBNYXRoLm1heChmaXJzdFBvc2l0aW9uIC0gNSwgMCk7XHJcbiAgICAgICAgdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbiA9IE1hdGgubWluKGxhc3RQb3NpdGlvbiArIDUsIGNvbGxlY3Rpb25fbGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGg6IG51bWJlciwgcG9zaXRpb246IG51bWJlcilcclxufSJdfQ==