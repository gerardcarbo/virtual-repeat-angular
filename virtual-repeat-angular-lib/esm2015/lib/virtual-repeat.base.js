/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Input, isDevMode, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
export class Recycler {
    constructor() {
        this.limit = 0;
        this._scrapViews = new Map();
    }
    /**
     * @param {?} position
     * @return {?}
     */
    getView(position) {
        let /** @type {?} */ view = this._scrapViews.get(position);
        if (!view && this._scrapViews.size > 0) {
            position = this._scrapViews.keys().next().value;
            view = this._scrapViews.get(position);
        }
        if (view) {
            this._scrapViews.delete(position);
        }
        return view || null;
    }
    /**
     * @param {?} position
     * @param {?} view
     * @return {?}
     */
    recycleView(position, view) {
        view.detach();
        this._scrapViews.set(position, view);
    }
    /**
     * scrap view count should not exceed the number of current attached views.
     * @return {?}
     */
    pruneScrapViews() {
        if (this.limit <= 1) {
            return;
        }
        let /** @type {?} */ keyIterator = this._scrapViews.keys();
        let /** @type {?} */ key;
        while (this._scrapViews.size > this.limit) {
            key = keyIterator.next().value;
            this._scrapViews.get(key).destroy();
            this._scrapViews.delete(key);
        }
    }
    /**
     * @param {?} limit
     * @return {?}
     */
    setScrapViewsLimit(limit) {
        this.limit = limit;
        this.pruneScrapViews();
    }
    /**
     * @return {?}
     */
    clean() {
        this._scrapViews.forEach((view) => {
            view.destroy();
        });
        this._scrapViews.clear();
    }
}
function Recycler_tsickle_Closure_declarations() {
    /** @type {?} */
    Recycler.prototype.limit;
    /** @type {?} */
    Recycler.prototype._scrapViews;
}
export class VirtualRepeatRow {
    /**
     * @param {?} $implicit
     * @param {?} index
     * @param {?} count
     */
    constructor($implicit, index, count) {
        this.$implicit = $implicit;
        this.index = index;
        this.count = count;
    }
    /**
     * @return {?}
     */
    get first() {
        return this.index === 0;
    }
    /**
     * @return {?}
     */
    get last() {
        return this.index === this.count - 1;
    }
    /**
     * @return {?}
     */
    get even() {
        return this.index % 2 === 0;
    }
    /**
     * @return {?}
     */
    get odd() {
        return !this.even;
    }
}
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
export class VirtualRepeatBase {
    /**
     * @param {?} _virtualRepeatContainer
     * @param {?} _differs
     * @param {?} _template
     * @param {?} _viewContainerRef
     */
    constructor(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
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
    /**
     * @param {?} fn
     * @return {?}
     */
    set virtualRepeatAsynchForTrackBy(fn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (/** @type {?} */ (console) && /** @type {?} */ (console.warn)) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    /**
     * @return {?}
     */
    get virtualRepeatAsynchForTrackBy() {
        return this._trackByFn;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set virtualRepeatAsynchForTemplate(value) {
        if (value) {
            this._template = value;
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._subscription.add(this._virtualRepeatContainer.scrollPosition
            .pipe(filter((scrollY) => {
            return Math.abs(scrollY - this._scrollY) >= this._virtualRepeatContainer._rowHeight;
        }), debounceTime(60))
            .subscribe((scrollY) => {
            this._scrollY = scrollY;
            this.requestLayout();
        }));
        this._subscription.add(this._virtualRepeatContainer.sizeChange.subscribe(([width, height]) => {
            // console.log('sizeChange: ', width, height);
            this._containerWidth = width;
            this._containerHeight = height;
            this.requestMeasure();
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }
    /**
     * @return {?}
     */
    requestMeasure() {
        if (this._isInMeasure || this._isInLayout) {
            clearTimeout(this._pendingMeasurement);
            this._pendingMeasurement = window.setTimeout(() => {
                this.requestMeasure();
            }, 60);
            return;
        }
        this.measure();
    }
    /**
     * @return {?}
     */
    requestLayout() {
        if (!this._isInMeasure) {
            this.layout();
        }
    }
    /**
     * @return {?}
     */
    detachAllViews() {
        for (let /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
            let /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
            this._viewContainerRef.detach(i);
            i--;
        }
        this._isInLayout = false;
        this._invalidate = false;
        return;
    }
    /**
     * @return {?}
     */
    calculateScrapViewsLimit() {
        let /** @type {?} */ limit = (this._containerHeight / this._virtualRepeatContainer._rowHeight) + 5;
        this._recycler.setScrapViewsLimit(limit);
    }
    /**
     * @param {?} viewElement
     * @param {?} y
     * @return {?}
     */
    applyStyles(viewElement, y) {
        viewElement.style.transform = `translate3d(0, ${y}px, 0)`;
        viewElement.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
        viewElement.style.width = `${this._containerWidth}px`;
        viewElement.style.height = `${this._virtualRepeatContainer._rowHeight}px`;
        viewElement.style.position = 'absolute';
    }
    /**
     * @param {?} position
     * @param {?} view
     * @param {?} addBefore
     * @return {?}
     */
    dispatchLayout(position, view, addBefore) {
        let /** @type {?} */ startPosY = position * this._virtualRepeatContainer._rowHeight;
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
    }
    /**
     * @param {?} collection_length
     * @return {?}
     */
    findPositionInRange(collection_length) {
        let /** @type {?} */ scrollY = this._scrollY;
        let /** @type {?} */ firstPosition = Math.floor(scrollY / this._virtualRepeatContainer._rowHeight);
        let /** @type {?} */ firstPositionOffset = scrollY - firstPosition * this._virtualRepeatContainer._rowHeight;
        let /** @type {?} */ lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer._rowHeight) + firstPosition;
        this._firstItemPosition = Math.max(firstPosition - 5, 0);
        this._lastItemPosition = Math.min(lastPosition + 5, collection_length - 1);
    }
}
VirtualRepeatBase.propDecorators = {
    virtualRepeatAsynchOf: [{ type: Input }],
    virtualRepeatAsynchForTrackBy: [{ type: Input }],
    virtualRepeatAsynchForTemplate: [{ type: Input }]
};
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuYmFzZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLyIsInNvdXJjZXMiOlsibGliL3ZpcnR1YWwtcmVwZWF0LmJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFJSCxLQUFLLEVBQ0wsU0FBUyxFQVVULFdBQVcsRUFJZCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsWUFBWSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxNQUFNLEVBQU8sWUFBWSxFQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFHbEUsTUFBTTs7cUJBQ3NCLENBQUM7MkJBQ21CLElBQUksR0FBRyxFQUFFOzs7Ozs7SUFFckQsT0FBTyxDQUFDLFFBQWdCO1FBQ3BCLHFCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNoRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckM7UUFDRCxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztLQUN2Qjs7Ozs7O0lBRUQsV0FBVyxDQUFDLFFBQWdCLEVBQUUsSUFBYTtRQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENB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IEVtYmVkZGVkVmlld1JlZixcclxuICAgIElucHV0LFxyXG4gICAgaXNEZXZNb2RlLFxyXG4gICAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXHJcbiAgICBJdGVyYWJsZUNoYW5nZXMsXHJcbiAgICBJdGVyYWJsZURpZmZlcixcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGZpbHRlciwgbWFwLCBkZWJvdW5jZVRpbWUsIGZpcnN0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZWN5Y2xlciB7XHJcbiAgICBwcml2YXRlIGxpbWl0OiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBfc2NyYXBWaWV3czogTWFwPG51bWJlciwgVmlld1JlZj4gPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgZ2V0Vmlldyhwb3NpdGlvbjogbnVtYmVyKTogVmlld1JlZiB8IG51bGwge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fc2NyYXBWaWV3cy5nZXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghdmlldyAmJiB0aGlzLl9zY3JhcFZpZXdzLnNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fc2NyYXBWaWV3cy5rZXlzKCkubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgICAgICB2aWV3ID0gdGhpcy5fc2NyYXBWaWV3cy5nZXQocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlldykge1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmRlbGV0ZShwb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3IHx8IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjeWNsZVZpZXcocG9zaXRpb246IG51bWJlciwgdmlldzogVmlld1JlZikge1xyXG4gICAgICAgIHZpZXcuZGV0YWNoKCk7XHJcbiAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5zZXQocG9zaXRpb24sIHZpZXcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyYXAgdmlldyBjb3VudCBzaG91bGQgbm90IGV4Y2VlZCB0aGUgbnVtYmVyIG9mIGN1cnJlbnQgYXR0YWNoZWQgdmlld3MuXHJcbiAgICAgKi9cclxuICAgIHBydW5lU2NyYXBWaWV3cygpIHtcclxuICAgICAgICBpZiAodGhpcy5saW1pdCA8PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleUl0ZXJhdG9yID0gdGhpcy5fc2NyYXBWaWV3cy5rZXlzKCk7XHJcbiAgICAgICAgbGV0IGtleTogbnVtYmVyO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLl9zY3JhcFZpZXdzLnNpemUgPiB0aGlzLmxpbWl0KSB7XHJcbiAgICAgICAgICAgIGtleSA9IGtleUl0ZXJhdG9yLm5leHQoKS52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5nZXQoa2V5KS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFNjcmFwVmlld3NMaW1pdChsaW1pdDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5saW1pdCA9IGxpbWl0O1xyXG4gICAgICAgIHRoaXMucHJ1bmVTY3JhcFZpZXdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYW4oKSB7XHJcbiAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5mb3JFYWNoKCh2aWV3OiBWaWV3UmVmKSA9PiB7XHJcbiAgICAgICAgICAgIHZpZXcuZGVzdHJveSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3MuY2xlYXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRSb3cge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljICRpbXBsaWNpdDogYW55LCBwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGNvdW50OiBudW1iZXIpIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IHRoaXMuY291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBldmVuKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4ICUgMiA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb2RkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5ldmVuO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlydHVhbFJlcGVhdEJhc2U8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIF9kaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+O1xyXG4gICAgcHJvdGVjdGVkIF90cmFja0J5Rm46IFRyYWNrQnlGdW5jdGlvbjxUPjtcclxuICAgIHByb3RlY3RlZCBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XHJcbiAgICAvKipcclxuICAgICAqIHNjcm9sbCBvZmZzZXQgb2YgeS1heGlzIGluIHBpeGVsXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfc2Nyb2xsWTogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICogZmlyc3QgdmlzaWJsZSBpdGVtIGluZGV4IGluIGNvbGxlY3Rpb25cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9maXJzdEl0ZW1Qb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiBsYXN0IHZpc2libGUgaXRlbSBpbmRleCBpbiBjb2xsZWN0aW9uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbGFzdEl0ZW1Qb3NpdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIHByb3RlY3RlZCBfY29udGFpbmVyV2lkdGg6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBfY29udGFpbmVySGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGVuIHRoaXMgdmFsdWUgaXMgdHJ1ZSwgYSBmdWxsIGNsZWFuIGxheW91dCBpcyByZXF1aXJlZCwgZXZlcnkgZWxlbWVudCBtdXN0IGJlIHJlcG9zaXRpb25cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pbnZhbGlkYXRlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIC8qKlxyXG4gICAgICogd2hlbiB0aGlzIHZhbHVlIGlzIHRydWUsIGEgbGF5b3V0IGlzIGluIHByb2Nlc3NcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9pc0luTGF5b3V0OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9pc0luTWVhc3VyZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByb3RlY3RlZCBfcGVuZGluZ01lYXN1cmVtZW50OiBudW1iZXI7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9yZWN5Y2xlcjogUmVjeWNsZXIgPSBuZXcgUmVjeWNsZXIoKTtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0QXN5bmNoT2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpcnR1YWxSZXBlYXRBc3luY2hGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRBc3luY2hGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvdGVjdGVkIF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyOiBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxyXG4gICAgICAgIHByb3RlY3RlZCBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICAgIHByb3RlY3RlZCBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+LFxyXG4gICAgICAgIHByb3RlY3RlZCBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgfVxyXG5cclxuICAgIGFic3RyYWN0IG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpO1xyXG5cclxuICAgIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5zY3JvbGxQb3NpdGlvblxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICAgIGZpbHRlcigoc2Nyb2xsWSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhzY3JvbGxZIC0gdGhpcy5fc2Nyb2xsWSkgPj0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoNjApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAgICAgICAgIChzY3JvbGxZKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsWSA9IHNjcm9sbFk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuc2l6ZUNoYW5nZS5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgIChbd2lkdGgsIGhlaWdodF0pID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzaXplQ2hhbmdlOiAnLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5jbGVhbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCByZXF1ZXN0TWVhc3VyZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbk1lYXN1cmUgfHwgdGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcGVuZGluZ01lYXN1cmVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ01lYXN1cmVtZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgICAgICB9LCA2MCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tZWFzdXJlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHJlcXVlc3RMYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0luTWVhc3VyZSkge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgbWVhc3VyZSgpO1xyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBsYXlvdXQoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgZGV0YWNoQWxsVmlld3MoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICBpLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjYWxjdWxhdGVTY3JhcFZpZXdzTGltaXQoKSB7XHJcbiAgICAgICAgbGV0IGxpbWl0ID0gKHRoaXMuX2NvbnRhaW5lckhlaWdodCAvIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodCkgKyA1O1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLnNldFNjcmFwVmlld3NMaW1pdChsaW1pdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGluc2VydFZpZXdzKGNvbGxlY3Rpb25fbGVuZ3RoOiBudW1iZXIpXHJcblxyXG4gICAgcHJvdGVjdGVkIGFwcGx5U3R5bGVzKHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKDAsICR7eX1weCwgMClgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgwLCAke3l9cHgsIDApYDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3RoaXMuX2NvbnRhaW5lcldpZHRofXB4YDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHR9cHhgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2hMYXlvdXQocG9zaXRpb246IG51bWJlciwgdmlldzogVmlld1JlZiwgYWRkQmVmb3JlOiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IHN0YXJ0UG9zWSA9IHBvc2l0aW9uICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXMoKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5yb290Tm9kZXNbMF0sIHN0YXJ0UG9zWSk7XHJcbiAgICAgICAgaWYgKGFkZEJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlldy5yZWF0dGFjaCgpO1xyXG5cclxuICAgICAgICAvL2F1dG9IZWlnaHQgdXBkYXRlIG9uIGZpcnN0IHZpZXcgYXR0YWNoZWRcclxuICAgICAgICBpZih0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9hdXRvSGVpZ2h0ICYmICF0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9oZWlnaHRBdXRvQ29tcHV0ZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQgPSAoPGFueT52aWV3KS5yb290Tm9kZXNbMF0uc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBmaW5kUG9zaXRpb25JblJhbmdlKGNvbGxlY3Rpb25fbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgc2Nyb2xsWSA9IHRoaXMuX3Njcm9sbFk7XHJcbiAgICAgICAgbGV0IGZpcnN0UG9zaXRpb24gPSBNYXRoLmZsb29yKHNjcm9sbFkgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQpO1xyXG4gICAgICAgIGxldCBmaXJzdFBvc2l0aW9uT2Zmc2V0ID0gc2Nyb2xsWSAtIGZpcnN0UG9zaXRpb24gKiB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQ7XHJcbiAgICAgICAgbGV0IGxhc3RQb3NpdGlvbiA9IE1hdGguY2VpbCgodGhpcy5fY29udGFpbmVySGVpZ2h0ICsgZmlyc3RQb3NpdGlvbk9mZnNldCkgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQpICsgZmlyc3RQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiA9IE1hdGgubWF4KGZpcnN0UG9zaXRpb24gLSA1LCAwKTtcclxuICAgICAgICB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uID0gTWF0aC5taW4obGFzdFBvc2l0aW9uICsgNSwgY29sbGVjdGlvbl9sZW5ndGggLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0Vmlldyhjb2xsZWN0aW9uX2xlbmd0aDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKVxyXG59Il19