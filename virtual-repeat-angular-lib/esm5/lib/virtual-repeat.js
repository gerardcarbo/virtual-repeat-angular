/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Directive, Input, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
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
var InfiniteRow = /** @class */ (function () {
    function InfiniteRow($implicit, index, count) {
        this.$implicit = $implicit;
        this.index = index;
        this.count = count;
    }
    Object.defineProperty(InfiniteRow.prototype, "first", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InfiniteRow.prototype, "last", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index === this.count - 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InfiniteRow.prototype, "even", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index % 2 === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InfiniteRow.prototype, "odd", {
        get: /**
         * @return {?}
         */
        function () {
            return !this.even;
        },
        enumerable: true,
        configurable: true
    });
    return InfiniteRow;
}());
export { InfiniteRow };
function InfiniteRow_tsickle_Closure_declarations() {
    /** @type {?} */
    InfiniteRow.prototype.$implicit;
    /** @type {?} */
    InfiniteRow.prototype.index;
    /** @type {?} */
    InfiniteRow.prototype.count;
}
/**
 * @template T
 */
var VirtualRepeat = /** @class */ (function () {
    function VirtualRepeat(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
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
    Object.defineProperty(VirtualRepeat.prototype, "infiniteForTrackBy", {
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
    Object.defineProperty(VirtualRepeat.prototype, "infiniteForTemplate", {
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
     * @param {?} changes
     * @return {?}
     */
    VirtualRepeat.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if ('virtualRepeatOf' in changes) {
            // React on virtualRepeatOf only once all inputs have been initialized
            var /** @type {?} */ value = changes['virtualRepeatOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this._trackByFn);
                }
                catch (/** @type {?} */ e) {
                    throw new Error("Cannot find a differ supporting object '" + value + "' of type '" + getTypeNameForDebugging(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
                }
            }
        }
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (this._differ) {
            var /** @type {?} */ changes = this._differ.diff(this.virtualRepeatOf);
            if (changes) {
                this.applyChanges(changes);
            }
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    VirtualRepeat.prototype.applyChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        var _this = this;
        if (!this._collection) {
            this._collection = [];
        }
        var /** @type {?} */ isMeasurementRequired = false;
        changes.forEachOperation(function (item, adjustedPreviousIndex, currentIndex) {
            if (item.previousIndex == null) {
                // new item
                // console.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                _this._collection.splice(currentIndex, 0, item.item);
            }
            else if (currentIndex == null) {
                // remove item
                // console.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                _this._collection.splice(adjustedPreviousIndex, 1);
            }
            else {
                // move item
                // console.log('move item', item, adjustedPreviousIndex, currentIndex);
                // move item
                // console.log('move item', item, adjustedPreviousIndex, currentIndex);
                _this._collection.splice(currentIndex, 0, _this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });
        changes.forEachIdentityChange(function (record) {
            _this._collection[record.currentIndex] = record.item;
        });
        if (isMeasurementRequired) {
            this.requestMeasure();
        }
        this.requestLayout();
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this._subscription.add(this._virtualRepeatContainer.scrollPosition
            .pipe(filter(function (scrollY) {
            return Math.abs(scrollY - _this._scrollY) >= _this._virtualRepeatContainer.rowHeight;
        }))
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
    VirtualRepeat.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._subscription.unsubscribe();
        this._recycler.clean();
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.requestMeasure = /**
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
    VirtualRepeat.prototype.requestLayout = /**
     * @return {?}
     */
    function () {
        // console.log('requestLayout', this._virtualRepeatContainer.rowHeight, this._containerHeight, this._collection.length);
        if (!this._isInMeasure && this._virtualRepeatContainer.rowHeight) {
            this.layout();
        }
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.measure = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ collectionNumber = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer.rowHeight * collectionNumber;
        // calculate a approximate number of which a view can contain
        this.calculateScrapViewsLimit();
        this._isInMeasure = false;
        this._invalidate = true;
        this.requestLayout();
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.layout = /**
     * @return {?}
     */
    function () {
        if (this._isInLayout) {
            return;
        }
        // console.log('on layout');
        this._isInLayout = true;
        var _a = this._virtualRepeatContainer.measure(), width = _a.width, height = _a.height;
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection || this._collection.length === 0) {
            // detach all views without recycle them.
            for (var /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
                var /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
                // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
                this._viewContainerRef.detach(i);
                // this._recycler.recycleView(child.context.index, child);
                i--;
                // }
            }
            this._isInLayout = false;
            this._invalidate = false;
            return;
        }
        this.findPositionInRange();
        for (var /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
            var /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
            // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
            this._viewContainerRef.detach(i);
            this._recycler.recycleView(child.context.index, child);
            i--;
            // }
        }
        this.insertViews();
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.calculateScrapViewsLimit = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ limit = this._containerHeight / this._virtualRepeatContainer.rowHeight + 2;
        this._recycler.setScrapViewsLimit(limit);
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.insertViews = /**
     * @return {?}
     */
    function () {
        if (this._viewContainerRef.length > 0) {
            var /** @type {?} */ firstChild = /** @type {?} */ (this._viewContainerRef.get(0));
            var /** @type {?} */ lastChild = /** @type {?} */ (this._viewContainerRef.get(this._viewContainerRef.length - 1));
            for (var /** @type {?} */ i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                var /** @type {?} */ view = this.getView(i);
                this.dispatchLayout(i, view, true);
            }
            for (var /** @type {?} */ i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                var /** @type {?} */ view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        }
        else {
            for (var /** @type {?} */ i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                var /** @type {?} */ view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        }
    };
    /**
     * @param {?} viewElement
     * @param {?} y
     * @return {?}
     */
    VirtualRepeat.prototype.applyStyles = /**
     * @param {?} viewElement
     * @param {?} y
     * @return {?}
     */
    function (viewElement, y) {
        viewElement.style.transform = "translate3d(0, " + y + "px, 0)";
        viewElement.style.webkitTransform = "translate3d(0, " + y + "px, 0)";
        viewElement.style.width = this._containerWidth + "px";
        viewElement.style.height = this._virtualRepeatContainer.rowHeight + "px";
        viewElement.style.position = 'absolute';
    };
    /**
     * @param {?} position
     * @param {?} view
     * @param {?} addBefore
     * @return {?}
     */
    VirtualRepeat.prototype.dispatchLayout = /**
     * @param {?} position
     * @param {?} view
     * @param {?} addBefore
     * @return {?}
     */
    function (position, view, addBefore) {
        var /** @type {?} */ startPosY = position * this._virtualRepeatContainer.rowHeight;
        this.applyStyles((/** @type {?} */ (view)).rootNodes[0], startPosY);
        if (addBefore) {
            this._viewContainerRef.insert(view, 0);
        }
        else {
            this._viewContainerRef.insert(view);
        }
        view.reattach();
    };
    /**
     * @return {?}
     */
    VirtualRepeat.prototype.findPositionInRange = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ scrollY = this._scrollY;
        var /** @type {?} */ firstPosition = Math.floor(scrollY / this._virtualRepeatContainer.rowHeight);
        var /** @type {?} */ firstPositionOffset = scrollY - firstPosition * this._virtualRepeatContainer.rowHeight;
        var /** @type {?} */ lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer.rowHeight) + firstPosition;
        this._firstItemPosition = Math.max(firstPosition - 1, 0);
        this._lastItemPosition = Math.min(lastPosition + 1, this._collection.length - 1);
    };
    /**
     * @param {?} position
     * @return {?}
     */
    VirtualRepeat.prototype.getView = /**
     * @param {?} position
     * @return {?}
     */
    function (position) {
        var /** @type {?} */ view = this._recycler.getView(position);
        var /** @type {?} */ item = this._collection[position];
        var /** @type {?} */ count = this._collection.length;
        if (!view) {
            view = this._template.createEmbeddedView(new InfiniteRow(item, position, count));
        }
        else {
            (/** @type {?} */ (view)).context.$implicit = item;
            (/** @type {?} */ (view)).context.index = position;
            (/** @type {?} */ (view)).context.count = count;
        }
        return view;
    };
    VirtualRepeat.decorators = [
        { type: Directive, args: [{
                    selector: '[virtualRepeat][virtualRepeatOf]'
                },] },
    ];
    /** @nocollapse */
    VirtualRepeat.ctorParameters = function () { return [
        { type: VirtualRepeatContainer },
        { type: IterableDiffers },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ]; };
    VirtualRepeat.propDecorators = {
        virtualRepeatOf: [{ type: Input }],
        infiniteForTrackBy: [{ type: Input }],
        infiniteForTemplate: [{ type: Input }]
    };
    return VirtualRepeat;
}());
export { VirtualRepeat };
function VirtualRepeat_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeat.prototype._differ;
    /** @type {?} */
    VirtualRepeat.prototype._trackByFn;
    /** @type {?} */
    VirtualRepeat.prototype._subscription;
    /**
     * scroll offset of y-axis in pixel
     * @type {?}
     */
    VirtualRepeat.prototype._scrollY;
    /**
     * first visible item index in collection
     * @type {?}
     */
    VirtualRepeat.prototype._firstItemPosition;
    /**
     * last visible item index in collection
     * @type {?}
     */
    VirtualRepeat.prototype._lastItemPosition;
    /** @type {?} */
    VirtualRepeat.prototype._containerWidth;
    /** @type {?} */
    VirtualRepeat.prototype._containerHeight;
    /**
     * when this value is true, a full clean layout is required, every element must be reposition
     * @type {?}
     */
    VirtualRepeat.prototype._invalidate;
    /**
     * when this value is true, a layout is in process
     * @type {?}
     */
    VirtualRepeat.prototype._isInLayout;
    /** @type {?} */
    VirtualRepeat.prototype._isInMeasure;
    /** @type {?} */
    VirtualRepeat.prototype._pendingMeasurement;
    /** @type {?} */
    VirtualRepeat.prototype._collection;
    /** @type {?} */
    VirtualRepeat.prototype._recycler;
    /** @type {?} */
    VirtualRepeat.prototype.virtualRepeatOf;
    /** @type {?} */
    VirtualRepeat.prototype._virtualRepeatContainer;
    /** @type {?} */
    VirtualRepeat.prototype._differs;
    /** @type {?} */
    VirtualRepeat.prototype._template;
    /** @type {?} */
    VirtualRepeat.prototype._viewContainerRef;
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi8iLCJzb3VyY2VzIjpbImxpYi92aXJ0dWFsLXJlcGVhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBR1QsS0FBSyxFQUNMLFNBQVMsRUFJVCxlQUFlLEVBTWYsV0FBVyxFQUVYLGdCQUFnQixFQUVuQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd4QyxJQUFBOztxQkFDNEIsQ0FBQzsyQkFDbUIsSUFBSSxHQUFHLEVBQUU7Ozs7OztJQUVyRCwwQkFBTzs7OztJQUFQLFVBQVEsUUFBZ0I7UUFDcEIscUJBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2hELElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN6QztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyQztRQUNELE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0tBQ3ZCOzs7Ozs7SUFFRCw4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QjtnQkFaM0IsZUFBZTtnQkFNZixXQUFXO2dCQUVYLGdCQUFnQjs7O2tDQXlIZixLQUFLO3FDQUVMLEtBQUs7c0NBZ0JMLEtBQUs7O3dCQTVKVjs7U0FvR2EsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcVMxQixNQUFNLGtDQUFrQyxJQUFTO0lBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUM7Q0FDdEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gICAgRGlyZWN0aXZlLFxyXG4gICAgRG9DaGVjayxcclxuICAgIEVtYmVkZGVkVmlld1JlZixcclxuICAgIElucHV0LFxyXG4gICAgaXNEZXZNb2RlLFxyXG4gICAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXHJcbiAgICBJdGVyYWJsZUNoYW5nZXMsXHJcbiAgICBJdGVyYWJsZURpZmZlcixcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuLy9pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWInO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlY3ljbGVyIHtcclxuICAgIHByaXZhdGUgbGltaXQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9zY3JhcFZpZXdzOiBNYXA8bnVtYmVyLCBWaWV3UmVmPiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBnZXRWaWV3KHBvc2l0aW9uOiBudW1iZXIpOiBWaWV3UmVmIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSB0aGlzLl9zY3JhcFZpZXdzLmdldChwb3NpdGlvbik7XHJcbiAgICAgICAgaWYgKCF2aWV3ICYmIHRoaXMuX3NjcmFwVmlld3Muc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9zY3JhcFZpZXdzLmtleXMoKS5uZXh0KCkudmFsdWU7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLl9zY3JhcFZpZXdzLmdldChwb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2aWV3KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZGVsZXRlKHBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXcgfHwgbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZWN5Y2xlVmlldyhwb3NpdGlvbjogbnVtYmVyLCB2aWV3OiBWaWV3UmVmKSB7XHJcbiAgICAgICAgdmlldy5kZXRhY2goKTtcclxuICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLnNldChwb3NpdGlvbiwgdmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JhcCB2aWV3IGNvdW50IHNob3VsZCBub3QgZXhjZWVkIHRoZSBudW1iZXIgb2YgY3VycmVudCBhdHRhY2hlZCB2aWV3cy5cclxuICAgICAqL1xyXG4gICAgcHJ1bmVTY3JhcFZpZXdzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxpbWl0IDw9IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5SXRlcmF0b3IgPSB0aGlzLl9zY3JhcFZpZXdzLmtleXMoKTtcclxuICAgICAgICBsZXQga2V5OiBudW1iZXI7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuX3NjcmFwVmlld3Muc2l6ZSA+IHRoaXMubGltaXQpIHtcclxuICAgICAgICAgICAga2V5ID0ga2V5SXRlcmF0b3IubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmdldChrZXkpLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5kZWxldGUoa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U2NyYXBWaWV3c0xpbWl0KGxpbWl0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmxpbWl0ID0gbGltaXQ7XHJcbiAgICAgICAgdGhpcy5wcnVuZVNjcmFwVmlld3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhbigpIHtcclxuICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmZvckVhY2goKHZpZXc6IFZpZXdSZWYpID0+IHtcclxuICAgICAgICAgICAgdmlldy5kZXN0cm95KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5jbGVhcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW5maW5pdGVSb3cge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljICRpbXBsaWNpdDogYW55LCBwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGNvdW50OiBudW1iZXIpIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IHRoaXMuY291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBldmVuKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4ICUgMiA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb2RkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5ldmVuO1xyXG4gICAgfVxyXG59XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiAnW3ZpcnR1YWxSZXBlYXRdW3ZpcnR1YWxSZXBlYXRPZl0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0PFQ+IGltcGxlbWVudHMgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPjtcclxuICAgIHByaXZhdGUgX3RyYWNrQnlGbjogVHJhY2tCeUZ1bmN0aW9uPFQ+O1xyXG4gICAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XHJcbiAgICAvKipcclxuICAgICAqIHNjcm9sbCBvZmZzZXQgb2YgeS1heGlzIGluIHBpeGVsXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Njcm9sbFk6IG51bWJlciA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIGZpcnN0IHZpc2libGUgaXRlbSBpbmRleCBpbiBjb2xsZWN0aW9uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ZpcnN0SXRlbVBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIGxhc3QgdmlzaWJsZSBpdGVtIGluZGV4IGluIGNvbGxlY3Rpb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfbGFzdEl0ZW1Qb3NpdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgX2NvbnRhaW5lcldpZHRoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9jb250YWluZXJIZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZW4gdGhpcyB2YWx1ZSBpcyB0cnVlLCBhIGZ1bGwgY2xlYW4gbGF5b3V0IGlzIHJlcXVpcmVkLCBldmVyeSBlbGVtZW50IG11c3QgYmUgcmVwb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pbnZhbGlkYXRlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIC8qKlxyXG4gICAgICogd2hlbiB0aGlzIHZhbHVlIGlzIHRydWUsIGEgbGF5b3V0IGlzIGluIHByb2Nlc3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaXNJbkxheW91dDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgX2lzSW5NZWFzdXJlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBfcGVuZGluZ01lYXN1cmVtZW50OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBfY29sbGVjdGlvbjogYW55W107XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVjeWNsZXI6IFJlY3ljbGVyID0gbmV3IFJlY3ljbGVyKCk7XHJcblxyXG4gICAgQElucHV0KCkgdmlydHVhbFJlcGVhdE9mOiBOZ0l0ZXJhYmxlPFQ+O1xyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgaW5maW5pdGVGb3JUcmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcclxuICAgICAgICBpZiAoaXNEZXZNb2RlKCkgJiYgZm4gIT0gbnVsbCAmJiB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgaWYgKDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXHJcbiAgICAgICAgICAgICAgICAgICAgYFNlZSBodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpL2NvbW1vbi9pbmRleC9OZ0Zvci1kaXJlY3RpdmUuaHRtbCMhI2NoYW5nZS1wcm9wYWdhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaW5maW5pdGVGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IGluZmluaXRlRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPEluZmluaXRlUm93Pikge1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyOiBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxyXG4gICAgICAgIHByaXZhdGUgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgICAgICBwcml2YXRlIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8SW5maW5pdGVSb3c+LFxyXG4gICAgICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCd2aXJ0dWFsUmVwZWF0T2YnIGluIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy8gUmVhY3Qgb24gdmlydHVhbFJlcGVhdE9mIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoYW5nZXNbJ3ZpcnR1YWxSZXBlYXRPZiddLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5fdHJhY2tCeUZuKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0RvQ2hlY2soKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpZmZlcikge1xyXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy52aXJ0dWFsUmVwZWF0T2YpO1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseUNoYW5nZXMoY2hhbmdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIG5ldyBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbmV3IGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCBpdGVtLml0ZW0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbW92ZSBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZlIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSlbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb25bcmVjb3JkLmN1cnJlbnRJbmRleF0gPSByZWNvcmQuaXRlbTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGlzTWVhc3VyZW1lbnRSZXF1aXJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuc2Nyb2xsUG9zaXRpb25cclxuICAgICAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIoKHNjcm9sbFkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoc2Nyb2xsWSAtIHRoaXMuX3Njcm9sbFkpID49IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAgICAgKHNjcm9sbFkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGxZID0gc2Nyb2xsWTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5zaXplQ2hhbmdlLnN1YnNjcmliZShcclxuICAgICAgICAgICAgKFt3aWR0aCwgaGVpZ2h0XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3NpemVDaGFuZ2U6ICcsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICkpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLmNsZWFuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZXF1ZXN0TWVhc3VyZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbk1lYXN1cmUgfHwgdGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcGVuZGluZ01lYXN1cmVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ01lYXN1cmVtZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgICAgICB9LCA2MCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tZWFzdXJlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZXF1ZXN0TGF5b3V0KCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZXF1ZXN0TGF5b3V0JywgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQsIHRoaXMuX2NvbnRhaW5lckhlaWdodCwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGgpO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbk1lYXN1cmUgJiYgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXlvdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtZWFzdXJlKCkge1xyXG4gICAgICAgIGxldCBjb2xsZWN0aW9uTnVtYmVyID0gIXRoaXMuX2NvbGxlY3Rpb24gfHwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggPT09IDAgPyAwIDogdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuaG9sZGVySGVpZ2h0ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQgKiBjb2xsZWN0aW9uTnVtYmVyO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhIGFwcHJveGltYXRlIG51bWJlciBvZiB3aGljaCBhIHZpZXcgY2FuIGNvbnRhaW5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVNjcmFwVmlld3NMaW1pdCgpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBsYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnb24gbGF5b3V0Jyk7XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IHRydWU7XHJcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5tZWFzdXJlKCk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgdmlld3Mgd2l0aG91dCByZWN5Y2xlIHRoZW0uXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoY2hpbGQuY29udGV4dC5pbmRleCA8IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uIHx8IGNoaWxkLmNvbnRleHQuaW5kZXggPiB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uIHx8IHRoaXMuX2ludmFsaWRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5fcmVjeWNsZXIucmVjeWNsZVZpZXcoY2hpbGQuY29udGV4dC5pbmRleCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZmluZFBvc2l0aW9uSW5SYW5nZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgLy8gaWYgKGNoaWxkLmNvbnRleHQuaW5kZXggPCB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiB8fCBjaGlsZC5jb250ZXh0LmluZGV4ID4gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbiB8fCB0aGlzLl9pbnZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluc2VydFZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIucHJ1bmVTY3JhcFZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVNjcmFwVmlld3NMaW1pdCgpIHtcclxuICAgICAgICBsZXQgbGltaXQgPSB0aGlzLl9jb250YWluZXJIZWlnaHQgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCArIDI7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuc2V0U2NyYXBWaWV3c0xpbWl0KGxpbWl0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluc2VydFZpZXdzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCgwKTtcclxuICAgICAgICAgICAgbGV0IGxhc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBmaXJzdENoaWxkLmNvbnRleHQuaW5kZXggLSAxOyBpID49IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbGFzdENoaWxkLmNvbnRleHQuaW5kZXggKyAxOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9ub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xyXG4gICAgcHJpdmF0ZSBhcHBseVN0eWxlcyh2aWV3RWxlbWVudDogSFRNTEVsZW1lbnQsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgwLCAke3l9cHgsIDApYDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoMCwgJHt5fXB4LCAwKWA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUud2lkdGggPSBgJHt0aGlzLl9jb250YWluZXJXaWR0aH1weGA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHR9cHhgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRpc3BhdGNoTGF5b3V0KHBvc2l0aW9uOiBudW1iZXIsIHZpZXc6IFZpZXdSZWYsIGFkZEJlZm9yZTogYm9vbGVhbikge1xyXG4gICAgICAgIGxldCBzdGFydFBvc1kgPSBwb3NpdGlvbiAqIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXMoKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93Pikucm9vdE5vZGVzWzBdLCBzdGFydFBvc1kpO1xyXG4gICAgICAgIGlmIChhZGRCZWZvcmUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldywgMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZpZXcucmVhdHRhY2goKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpbmRQb3NpdGlvbkluUmFuZ2UoKSB7XHJcbiAgICAgICAgbGV0IHNjcm9sbFkgPSB0aGlzLl9zY3JvbGxZO1xyXG4gICAgICAgIGxldCBmaXJzdFBvc2l0aW9uID0gTWF0aC5mbG9vcihzY3JvbGxZIC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQpO1xyXG4gICAgICAgIGxldCBmaXJzdFBvc2l0aW9uT2Zmc2V0ID0gc2Nyb2xsWSAtIGZpcnN0UG9zaXRpb24gKiB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodDtcclxuICAgICAgICBsZXQgbGFzdFBvc2l0aW9uID0gTWF0aC5jZWlsKCh0aGlzLl9jb250YWluZXJIZWlnaHQgKyBmaXJzdFBvc2l0aW9uT2Zmc2V0KSAvIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0KSArIGZpcnN0UG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gPSBNYXRoLm1heChmaXJzdFBvc2l0aW9uIC0gMSwgMCk7XHJcbiAgICAgICAgdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbiA9IE1hdGgubWluKGxhc3RQb3NpdGlvbiArIDEsIHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRWaWV3KHBvc2l0aW9uOiBudW1iZXIpOiBWaWV3UmVmIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3JlY3ljbGVyLmdldFZpZXcocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5fY29sbGVjdGlvbltwb3NpdGlvbl07XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLl90ZW1wbGF0ZS5jcmVhdGVFbWJlZGRlZFZpZXcobmV3IEluZmluaXRlUm93KGl0ZW0sIHBvc2l0aW9uLCBjb3VudCkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4pLmNvbnRleHQuJGltcGxpY2l0ID0gaXRlbTtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93PikuY29udGV4dC5pbmRleCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+KS5jb250ZXh0LmNvdW50ID0gY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nKHR5cGU6IGFueSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xyXG59XHJcbiJdfQ==