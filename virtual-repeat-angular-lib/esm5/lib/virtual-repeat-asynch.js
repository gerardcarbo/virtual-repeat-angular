/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Directive, Input, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { map, first } from 'rxjs/operators';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
/**
 * @record
 */
export function IAsynchCollection() { }
function IAsynchCollection_tsickle_Closure_declarations() {
    /** @type {?} */
    IAsynchCollection.prototype.getLength;
    /** @type {?} */
    IAsynchCollection.prototype.getItem;
}
/**
 * @template T
 */
var VirtualRepeatAsynch = /** @class */ (function (_super) {
    tslib_1.__extends(VirtualRepeatAsynch, _super);
    function VirtualRepeatAsynch(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
        return _super.call(this, _virtualRepeatContainer, _differs, _template, _viewContainerRef) || this;
    }
    Object.defineProperty(VirtualRepeatAsynch.prototype, "virtualRepeatAsynchForTrackBy", {
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
    Object.defineProperty(VirtualRepeatAsynch.prototype, "virtualRepeatAsynchForTemplate", {
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
    VirtualRepeatAsynch.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if ('virtualRepeatAsynchOf' in changes) {
            // React on virtualRepeatAsynchOf only once all inputs have been initialized
            var /** @type {?} */ value = changes['virtualRepeatAsynchOf'].currentValue;
            this._collection = value;
            this._virtualRepeatContainer._heightAutoComputed = false;
            this.requestMeasure();
        }
    };
    /**
     * @return {?}
     */
    VirtualRepeatAsynch.prototype.measure = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._collection)
            return;
        this._isInMeasure = true;
        this._collection.getLength().pipe(first()).subscribe(function (length) {
            _this._virtualRepeatContainer.holderHeight = _this._virtualRepeatContainer._rowHeight * length;
            // calculate a approximate number of which a view can contain
            // calculate a approximate number of which a view can contain
            _this.calculateScrapViewsLimit();
            _this._isInMeasure = false;
            _this._invalidate = true;
            _this.requestLayout();
        });
    };
    /**
     * @return {?}
     */
    VirtualRepeatAsynch.prototype.layout = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._isInLayout) {
            return;
        }
        // console.log('on layout');
        this._isInLayout = true;
        var _a = this._virtualRepeatContainer.measure(), width = _a.width, height = _a.height;
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection) {
            // detach all views without recycle them.
            return this.detachAllViews();
        }
        this._collection.getLength().pipe(first()).subscribe(function (length) {
            if (length == 0) {
                return _this.detachAllViews();
            }
            _this.findPositionInRange(length);
            for (var /** @type {?} */ i = 0; i < _this._viewContainerRef.length; i++) {
                var /** @type {?} */ child = /** @type {?} */ (_this._viewContainerRef.get(i));
                // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
                // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
                _this._viewContainerRef.detach(i);
                _this._recycler.recycleView(child.context.index, child);
                i--;
                // }
            }
            _this.insertViews(length);
            _this._recycler.pruneScrapViews();
            _this._isInLayout = false;
            _this._invalidate = false;
        });
    };
    /**
     * @param {?} collection_length
     * @return {?}
     */
    VirtualRepeatAsynch.prototype.insertViews = /**
     * @param {?} collection_length
     * @return {?}
     */
    function (collection_length) {
        var _this = this;
        if (this._viewContainerRef.length > 0) {
            var /** @type {?} */ firstChild = /** @type {?} */ (this._viewContainerRef.get(0));
            var /** @type {?} */ lastChild = /** @type {?} */ (this._viewContainerRef.get(this._viewContainerRef.length - 1));
            var _loop_1 = function (i) {
                this_1.getView(collection_length, i).subscribe(function (view) {
                    _this.dispatchLayout(i, view, true);
                });
            };
            var this_1 = this;
            for (var /** @type {?} */ i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                _loop_1(i);
            }
            var _loop_2 = function (i) {
                var /** @type {?} */ view = this_2.getView(collection_length, i).subscribe(function (view) {
                    _this.dispatchLayout(i, view, false);
                });
            };
            var this_2 = this;
            for (var /** @type {?} */ i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                _loop_2(i);
            }
        }
        else {
            var _loop_3 = function (i) {
                this_3.getView(collection_length, i).subscribe(function (view) {
                    _this.dispatchLayout(i, view, false);
                });
            };
            var this_3 = this;
            for (var /** @type {?} */ i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                _loop_3(i);
            }
        }
    };
    /**
     * @param {?} collection_length
     * @param {?} position
     * @return {?}
     */
    VirtualRepeatAsynch.prototype.getView = /**
     * @param {?} collection_length
     * @param {?} position
     * @return {?}
     */
    function (collection_length, position) {
        var _this = this;
        var /** @type {?} */ view = this._recycler.getView(position);
        return this._collection.getItem(position)
            .pipe(first(), map(function (item) {
            if (!view) {
                view = _this._template.createEmbeddedView(new VirtualRepeatRow(item, position, collection_length));
            }
            else {
                (/** @type {?} */ (view)).context.$implicit = item;
                (/** @type {?} */ (view)).context.index = position;
                (/** @type {?} */ (view)).context.count = collection_length;
            }
            return view;
        }));
    };
    VirtualRepeatAsynch.decorators = [
        { type: Directive, args: [{
                    selector: '[virtualRepeatAsynch]'
                },] },
    ];
    /** @nocollapse */
    VirtualRepeatAsynch.ctorParameters = function () { return [
        { type: VirtualRepeatContainer },
        { type: IterableDiffers },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ]; };
    VirtualRepeatAsynch.propDecorators = {
        virtualRepeatAsynchOf: [{ type: Input }],
        virtualRepeatAsynchForTrackBy: [{ type: Input }],
        virtualRepeatAsynchForTemplate: [{ type: Input }]
    };
    return VirtualRepeatAsynch;
}(VirtualRepeatBase));
export { VirtualRepeatAsynch };
function VirtualRepeatAsynch_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeatAsynch.prototype._collection;
    /** @type {?} */
    VirtualRepeatAsynch.prototype.virtualRepeatAsynchOf;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYXN5bmNoLmpzIiwic291cmNlUm9vdCI6Im5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvIiwic291cmNlcyI6WyJsaWIvdmlydHVhbC1yZXBlYXQtYXN5bmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFFVCxLQUFLLEVBQ0wsU0FBUyxFQUNULGVBQWUsRUFNZixXQUFXLEVBRVgsZ0JBQWdCLEVBRW5CLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7Ozs7Ozs7Ozs7Ozs7OztJQVV6RCwrQ0FBb0I7SUE2QjVELDZCQUFZLHVCQUErQyxFQUN2RCxRQUF5QixFQUN6QixTQUF3QyxFQUN4QyxpQkFBbUM7ZUFDbkMsa0JBQU0sdUJBQXVCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQztLQUN6RTtJQTVCRCxzQkFDSSw4REFBNkI7Ozs7UUFXakM7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUMxQjs7Ozs7UUFkRCxVQUNrQyxFQUFzQjtZQUNwRCxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELEVBQUUsQ0FBQyxDQUFDLGtCQUFLLE9BQU8sdUJBQVMsT0FBTyxDQUFDLElBQUksR0FBRSxDQUFDO29CQUNwQyxPQUFPLENBQUMsSUFBSSxDQUNSLDhDQUE0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFJO3dCQUNsRSx3SEFBd0gsQ0FBQyxDQUFDO2lC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LENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDckc7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixtQkFBQyxJQUF5QyxFQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3JFLG1CQUFDLElBQXlDLEVBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDckUsbUJBQUMsSUFBeUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUM7YUFDakY7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ2YsQ0FBQyxDQUNMLENBQUM7S0FDVDs7Z0JBMUlKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsdUJBQXVCO2lCQUNwQzs7OztnQkFYUSxzQkFBc0I7Z0JBZjNCLGVBQWU7Z0JBTWYsV0FBVztnQkFFWCxnQkFBZ0I7Ozt3Q0F1QmYsS0FBSztnREFFTCxLQUFLO2lEQWdCTCxLQUFLOzs4QkF0RFY7RUFnQzRDLGlCQUFpQjtTQUFoRCxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gICAgRGlyZWN0aXZlLFxyXG4gICAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gICAgSW5wdXQsXHJcbiAgICBpc0Rldk1vZGUsXHJcbiAgICBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICBOZ0l0ZXJhYmxlLFxyXG4gICAgT25DaGFuZ2VzLFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgT25Jbml0LFxyXG4gICAgU2ltcGxlQ2hhbmdlcyxcclxuICAgIFRlbXBsYXRlUmVmLFxyXG4gICAgVHJhY2tCeUZ1bmN0aW9uLFxyXG4gICAgVmlld0NvbnRhaW5lclJlZixcclxuICAgIFZpZXdSZWZcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgbWFwLCBmaXJzdCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XHJcbi8vaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdFJvdywgVmlydHVhbFJlcGVhdEJhc2UgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC5iYXNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFzeW5jaENvbGxlY3Rpb24ge1xyXG4gICAgZ2V0TGVuZ3RoKCk6IE9ic2VydmFibGU8bnVtYmVyPjtcclxuICAgIGdldEl0ZW0oaTogbnVtYmVyKTogT2JzZXJ2YWJsZTxhbnk+O1xyXG59XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiAnW3ZpcnR1YWxSZXBlYXRBc3luY2hdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdEFzeW5jaDxUPiBleHRlbmRzIFZpcnR1YWxSZXBlYXRCYXNlPFQ+IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9jb2xsZWN0aW9uOiBJQXN5bmNoQ29sbGVjdGlvbjtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0QXN5bmNoT2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpcnR1YWxSZXBlYXRBc3luY2hGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRBc3luY2hGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgICAgICBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+LFxyXG4gICAgICAgIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICAgICAgc3VwZXIoX3ZpcnR1YWxSZXBlYXRDb250YWluZXIsIF9kaWZmZXJzLCBfdGVtcGxhdGUsIF92aWV3Q29udGFpbmVyUmVmKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCd2aXJ0dWFsUmVwZWF0QXN5bmNoT2YnIGluIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy8gUmVhY3Qgb24gdmlydHVhbFJlcGVhdEFzeW5jaE9mIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoYW5nZXNbJ3ZpcnR1YWxSZXBlYXRBc3luY2hPZiddLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbiA9IHZhbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5faGVpZ2h0QXV0b0NvbXB1dGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBtZWFzdXJlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fY29sbGVjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5nZXRMZW5ndGgoKS5waXBlKGZpcnN0KCkpLnN1YnNjcmliZSgobGVuZ3RoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuaG9sZGVySGVpZ2h0ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0ICogbGVuZ3RoO1xyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgYSBhcHByb3hpbWF0ZSBudW1iZXIgb2Ygd2hpY2ggYSB2aWV3IGNhbiBjb250YWluXHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5b3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ29uIGxheW91dCcpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSB0cnVlO1xyXG4gICAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIubWVhc3VyZSgpO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIGlmICghdGhpcy5fY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICAvLyBkZXRhY2ggYWxsIHZpZXdzIHdpdGhvdXQgcmVjeWNsZSB0aGVtLlxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZXRhY2hBbGxWaWV3cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLmdldExlbmd0aCgpLnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKChsZW5ndGgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXRhY2hBbGxWaWV3cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZmluZFBvc2l0aW9uSW5SYW5nZShsZW5ndGgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoY2hpbGQuY29udGV4dC5pbmRleCA8IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uIHx8IGNoaWxkLmNvbnRleHQuaW5kZXggPiB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uIHx8IHRoaXMuX2ludmFsaWRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjeWNsZXIucmVjeWNsZVZpZXcoY2hpbGQuY29udGV4dC5pbmRleCwgY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0Vmlld3MobGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVjeWNsZXIucHJ1bmVTY3JhcFZpZXdzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBpbnNlcnRWaWV3cyhjb2xsZWN0aW9uX2xlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgZmlyc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoMCk7XHJcbiAgICAgICAgICAgIGxldCBsYXN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBmaXJzdENoaWxkLmNvbnRleHQuaW5kZXggLSAxOyBpID49IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlldyhjb2xsZWN0aW9uX2xlbmd0aCwgaSkuc3Vic2NyaWJlKCh2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBsYXN0Q2hpbGQuY29udGV4dC5pbmRleCArIDE7IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0Vmlldyhjb2xsZWN0aW9uX2xlbmd0aCwgaSkuc3Vic2NyaWJlKCh2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Vmlldyhjb2xsZWN0aW9uX2xlbmd0aCwgaSkuc3Vic2NyaWJlKCh2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Vmlldyhjb2xsZWN0aW9uX2xlbmd0aDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKTogT2JzZXJ2YWJsZTxWaWV3UmVmPiB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSB0aGlzLl9yZWN5Y2xlci5nZXRWaWV3KHBvc2l0aW9uKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5nZXRJdGVtKHBvc2l0aW9uKVxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICAgIGZpcnN0KCksXHJcbiAgICAgICAgICAgICAgICBtYXAoKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IHRoaXMuX3RlbXBsYXRlLmNyZWF0ZUVtYmVkZGVkVmlldyhuZXcgVmlydHVhbFJlcGVhdFJvdyhpdGVtLCBwb3NpdGlvbiwgY29sbGVjdGlvbl9sZW5ndGgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuJGltcGxpY2l0ID0gaXRlbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LmluZGV4ID0gcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5jb3VudCA9IGNvbGxlY3Rpb25fbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmlldztcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdfQ==