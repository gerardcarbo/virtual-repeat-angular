/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Directive, Input, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
/**
 * @template T
 */
var VirtualRepeat = /** @class */ (function (_super) {
    tslib_1.__extends(VirtualRepeat, _super);
    function VirtualRepeat(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
        return _super.call(this, _virtualRepeatContainer, _differs, _template, _viewContainerRef) || this;
    }
    Object.defineProperty(VirtualRepeat.prototype, "virtualRepeatForTrackBy", {
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
    Object.defineProperty(VirtualRepeat.prototype, "virtualRepeatForTemplate", {
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
    VirtualRepeat.prototype.measure = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ collectionNumber = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * collectionNumber;
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
        this._isInLayout = true;
        var _a = this._virtualRepeatContainer.measure(), width = _a.width, height = _a.height;
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection || this._collection.length === 0) {
            // detach all views without recycle them.
            for (var /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
                var /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
                this._viewContainerRef.detach(i);
                i--;
            }
            this._isInLayout = false;
            this._invalidate = false;
            return;
        }
        this.findPositionInRange(this._collection.length);
        for (var /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
            var /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
            this._viewContainerRef.detach(i);
            this._recycler.recycleView(child.context.index, child);
            i--;
        }
        this.insertViews();
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
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
            view = this._template.createEmbeddedView(new VirtualRepeatRow(item, position, count));
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
                    selector: '[virtualRepeat]'
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
        virtualRepeatForTrackBy: [{ type: Input }],
        virtualRepeatForTemplate: [{ type: Input }]
    };
    return VirtualRepeat;
}(VirtualRepeatBase));
export { VirtualRepeat };
function VirtualRepeat_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeat.prototype._collection;
    /** @type {?} */
    VirtualRepeat.prototype.virtualRepeatOf;
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi8iLCJzb3VyY2VzIjpbImxpYi92aXJ0dWFsLXJlcGVhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBR1QsS0FBSyxFQUNMLFNBQVMsRUFHVCxlQUFlLEVBTWYsV0FBVyxFQUVYLGdCQUFnQixFQUVuQixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUM3RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQzs7Ozs7SUFLL0QseUNBQW9CO0lBNkJ0RCx1QkFBWSx1QkFBK0MsRUFDdkQsUUFBeUIsRUFDekIsU0FBd0MsRUFDeEMsaUJBQW1DO2VBQ25DLGtCQUFNLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUM7S0FDekU7SUE1QkQsc0JBQ0ksa0RBQXVCOzs7O1FBVzNCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDMUI7Ozs7O1FBZEQsVUFDNEIsRUFBc0I7WUFDOUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxPQUFPLEVBQUUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxFQUFFLENBQUMsQ0FBQyxrQkFBSyxPQUFPLHVCQUFTLE9BQU8sQ0FBQyxJQUFJLEdBQUUsQ0FBQztvQkFDcEMsT0FBTyxDQUFDLElBQUksQ0FDUiw4Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBSTt3QkFDbEUsd0hBQXdILENBQUMsQ0FBQztpQkFDakk7YUFDSjtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ3hCOzs7T0FBQTtJQU1ELHNCQUNJLG1EQUF3Qjs7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O2tDQWVmLEtBQUs7MENBRUwsS0FBSzsyQ0FnQkwsS0FBSzs7d0JBakRWO0VBMkJzQyxpQkFBaUI7U0FBMUMsYUFBYTs7Ozs7Ozs7Ozs7QUFtTDFCLE1BQU0sa0NBQWtDLElBQVM7SUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQztDQUN0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBEb0NoZWNrLFxyXG4gICAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gICAgSW5wdXQsXHJcbiAgICBpc0Rldk1vZGUsXHJcbiAgICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlcyxcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLy9pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWInO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdFJvdywgVmlydHVhbFJlcGVhdEJhc2UgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC5iYXNlJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0PFQ+IGV4dGVuZHMgVmlydHVhbFJlcGVhdEJhc2U8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcml2YXRlIF9jb2xsZWN0aW9uOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0T2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0Rm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpcnR1YWxSZXBlYXRGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgICAgICBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+LFxyXG4gICAgICAgIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICAgICAgc3VwZXIoX3ZpcnR1YWxSZXBlYXRDb250YWluZXIsIF9kaWZmZXJzLCBfdGVtcGxhdGUsIF92aWV3Q29udGFpbmVyUmVmKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCd2aXJ0dWFsUmVwZWF0T2YnIGluIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy8gUmVhY3Qgb24gdmlydHVhbFJlcGVhdE9mIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoYW5nZXNbJ3ZpcnR1YWxSZXBlYXRPZiddLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5fdHJhY2tCeUZuKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0RvQ2hlY2soKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpZmZlcikge1xyXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy52aXJ0dWFsUmVwZWF0T2YpO1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseUNoYW5nZXMoY2hhbmdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIG5ldyBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbmV3IGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCBpdGVtLml0ZW0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbW92ZSBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZlIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSlbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uW3JlY29yZC5jdXJyZW50SW5kZXhdID0gcmVjb3JkLml0ZW07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChpc01lYXN1cmVtZW50UmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuY2xlYW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbWVhc3VyZSgpIHtcclxuICAgICAgICBsZXQgY29sbGVjdGlvbk51bWJlciA9ICF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwID8gMCA6IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodCAqIGNvbGxlY3Rpb25OdW1iZXI7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCk7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5b3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IHRydWU7XHJcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5tZWFzdXJlKCk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgdmlld3Mgd2l0aG91dCByZWN5Y2xlIHRoZW0uXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZmluZFBvc2l0aW9uSW5SYW5nZSh0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgIGktLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnNlcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluc2VydFZpZXdzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RDaGlsZC5jb250ZXh0LmluZGV4IC0gMTsgaSA+PSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxhc3RDaGlsZC5jb250ZXh0LmluZGV4ICsgMTsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRWaWV3KHBvc2l0aW9uOiBudW1iZXIpOiBWaWV3UmVmIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3JlY3ljbGVyLmdldFZpZXcocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5fY29sbGVjdGlvbltwb3NpdGlvbl07XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLl90ZW1wbGF0ZS5jcmVhdGVFbWJlZGRlZFZpZXcobmV3IFZpcnR1YWxSZXBlYXRSb3coaXRlbSwgcG9zaXRpb24sIGNvdW50KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LiRpbXBsaWNpdCA9IGl0ZW07XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5pbmRleCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuY291bnQgPSBjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XHJcbn1cclxuIl19