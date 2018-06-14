/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Directive, Input, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
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
export class InfiniteRow {
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
export class VirtualRepeat {
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
    set infiniteForTrackBy(fn) {
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
    get infiniteForTrackBy() {
        return this._trackByFn;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set infiniteForTemplate(value) {
        if (value) {
            this._template = value;
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if ('virtualRepeatOf' in changes) {
            // React on virtualRepeatOf only once all inputs have been initialized
            const /** @type {?} */ value = changes['virtualRepeatOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this._trackByFn);
                }
                catch (/** @type {?} */ e) {
                    throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this._differ) {
            const /** @type {?} */ changes = this._differ.diff(this.virtualRepeatOf);
            if (changes) {
                this.applyChanges(changes);
            }
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    applyChanges(changes) {
        if (!this._collection) {
            this._collection = [];
        }
        let /** @type {?} */ isMeasurementRequired = false;
        changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                // new item
                // console.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(currentIndex, 0, item.item);
            }
            else if (currentIndex == null) {
                // remove item
                // console.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            }
            else {
                // move item
                // console.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });
        changes.forEachIdentityChange((record) => {
            this._collection[record.currentIndex] = record.item;
        });
        if (isMeasurementRequired) {
            this.requestMeasure();
        }
        this.requestLayout();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._subscription.add(this._virtualRepeatContainer.scrollPosition
            .pipe(filter((scrollY) => {
            return Math.abs(scrollY - this._scrollY) >= this._virtualRepeatContainer.rowHeight;
        }))
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
        // console.log('requestLayout', this._virtualRepeatContainer.rowHeight, this._containerHeight, this._collection.length);
        if (!this._isInMeasure && this._virtualRepeatContainer.rowHeight) {
            this.layout();
        }
    }
    /**
     * @return {?}
     */
    measure() {
        let /** @type {?} */ collectionNumber = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer.rowHeight * collectionNumber;
        // calculate a approximate number of which a view can contain
        this.calculateScrapViewsLimit();
        this._isInMeasure = false;
        this._invalidate = true;
        this.requestLayout();
    }
    /**
     * @return {?}
     */
    layout() {
        if (this._isInLayout) {
            return;
        }
        // console.log('on layout');
        this._isInLayout = true;
        let { width, height } = this._virtualRepeatContainer.measure();
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection || this._collection.length === 0) {
            // detach all views without recycle them.
            for (let /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
                let /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
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
        for (let /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
            let /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
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
    }
    /**
     * @return {?}
     */
    calculateScrapViewsLimit() {
        let /** @type {?} */ limit = this._containerHeight / this._virtualRepeatContainer.rowHeight + 2;
        this._recycler.setScrapViewsLimit(limit);
    }
    /**
     * @return {?}
     */
    insertViews() {
        if (this._viewContainerRef.length > 0) {
            let /** @type {?} */ firstChild = /** @type {?} */ (this._viewContainerRef.get(0));
            let /** @type {?} */ lastChild = /** @type {?} */ (this._viewContainerRef.get(this._viewContainerRef.length - 1));
            for (let /** @type {?} */ i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                let /** @type {?} */ view = this.getView(i);
                this.dispatchLayout(i, view, true);
            }
            for (let /** @type {?} */ i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                let /** @type {?} */ view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        }
        else {
            for (let /** @type {?} */ i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                let /** @type {?} */ view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        }
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
        viewElement.style.height = `${this._virtualRepeatContainer.rowHeight}px`;
        viewElement.style.position = 'absolute';
    }
    /**
     * @param {?} position
     * @param {?} view
     * @param {?} addBefore
     * @return {?}
     */
    dispatchLayout(position, view, addBefore) {
        let /** @type {?} */ startPosY = position * this._virtualRepeatContainer.rowHeight;
        this.applyStyles((/** @type {?} */ (view)).rootNodes[0], startPosY);
        if (addBefore) {
            this._viewContainerRef.insert(view, 0);
        }
        else {
            this._viewContainerRef.insert(view);
        }
        view.reattach();
    }
    /**
     * @return {?}
     */
    findPositionInRange() {
        let /** @type {?} */ scrollY = this._scrollY;
        let /** @type {?} */ firstPosition = Math.floor(scrollY / this._virtualRepeatContainer.rowHeight);
        let /** @type {?} */ firstPositionOffset = scrollY - firstPosition * this._virtualRepeatContainer.rowHeight;
        let /** @type {?} */ lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) / this._virtualRepeatContainer.rowHeight) + firstPosition;
        this._firstItemPosition = Math.max(firstPosition - 1, 0);
        this._lastItemPosition = Math.min(lastPosition + 1, this._collection.length - 1);
    }
    /**
     * @param {?} position
     * @return {?}
     */
    getView(position) {
        let /** @type {?} */ view = this._recycler.getView(position);
        let /** @type {?} */ item = this._collection[position];
        let /** @type {?} */ count = this._collection.length;
        if (!view) {
            view = this._template.createEmbeddedView(new InfiniteRow(item, position, count));
        }
        else {
            (/** @type {?} */ (view)).context.$implicit = item;
            (/** @type {?} */ (view)).context.index = position;
            (/** @type {?} */ (view)).context.count = count;
        }
        return view;
    }
}
VirtualRepeat.decorators = [
    { type: Directive, args: [{
                selector: '[virtualRepeat][virtualRepeatOf]'
            },] },
];
/** @nocollapse */
VirtualRepeat.ctorParameters = () => [
    { type: VirtualRepeatContainer },
    { type: IterableDiffers },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
VirtualRepeat.propDecorators = {
    virtualRepeatOf: [{ type: Input }],
    infiniteForTrackBy: [{ type: Input }],
    infiniteForTemplate: [{ type: Input }]
};
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi8iLCJzb3VyY2VzIjpbImxpYi92aXJ0dWFsLXJlcGVhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFHVCxLQUFLLEVBQ0wsU0FBUyxFQUlULGVBQWUsRUFNZixXQUFXLEVBRVgsZ0JBQWdCLEVBRW5CLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3hDLE1BQU07O3FCQUNzQixDQUFDOzJCQUNtQixJQUFJLEdBQUcsRUFBRTs7Ozs7O0lBRXJELE9BQU8sQ0FBQyxRQUFnQjtRQUNwQixxQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDaEQsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7S0FDdkI7Ozs7OztJQUVELFdBQVcsQ0FBQyxR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LElBQUksQ0FBQztDQUN0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBEb0NoZWNrLFxyXG4gICAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gICAgSW5wdXQsXHJcbiAgICBpc0Rldk1vZGUsXHJcbiAgICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlcyxcclxuICAgIEl0ZXJhYmxlRGlmZmVyLFxyXG4gICAgSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgTmdJdGVyYWJsZSxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIE9uRGVzdHJveSxcclxuICAgIE9uSW5pdCxcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIFRyYWNrQnlGdW5jdGlvbixcclxuICAgIFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xyXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG4vL2ltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYic7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVjeWNsZXIge1xyXG4gICAgcHJpdmF0ZSBsaW1pdDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX3NjcmFwVmlld3M6IE1hcDxudW1iZXIsIFZpZXdSZWY+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGdldFZpZXcocG9zaXRpb246IG51bWJlcik6IFZpZXdSZWYgfCBudWxsIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3NjcmFwVmlld3MuZ2V0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoIXZpZXcgJiYgdGhpcy5fc2NyYXBWaWV3cy5zaXplID4gMCkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX3NjcmFwVmlld3Mua2V5cygpLm5leHQoKS52YWx1ZTtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3NjcmFwVmlld3MuZ2V0KHBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZXcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5kZWxldGUocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldyB8fCBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3ljbGVWaWV3KHBvc2l0aW9uOiBudW1iZXIsIHZpZXc6IFZpZXdSZWYpIHtcclxuICAgICAgICB2aWV3LmRldGFjaCgpO1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3Muc2V0KHBvc2l0aW9uLCB2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmFwIHZpZXcgY291bnQgc2hvdWxkIG5vdCBleGNlZWQgdGhlIG51bWJlciBvZiBjdXJyZW50IGF0dGFjaGVkIHZpZXdzLlxyXG4gICAgICovXHJcbiAgICBwcnVuZVNjcmFwVmlld3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGltaXQgPD0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXlJdGVyYXRvciA9IHRoaXMuX3NjcmFwVmlld3Mua2V5cygpO1xyXG4gICAgICAgIGxldCBrZXk6IG51bWJlcjtcclxuICAgICAgICB3aGlsZSAodGhpcy5fc2NyYXBWaWV3cy5zaXplID4gdGhpcy5saW1pdCkge1xyXG4gICAgICAgICAgICBrZXkgPSBrZXlJdGVyYXRvci5uZXh0KCkudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZ2V0KGtleSkuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTY3JhcFZpZXdzTGltaXQobGltaXQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGltaXQgPSBsaW1pdDtcclxuICAgICAgICB0aGlzLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFuKCkge1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZm9yRWFjaCgodmlldzogVmlld1JlZikgPT4ge1xyXG4gICAgICAgICAgICB2aWV3LmRlc3Ryb3koKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbmZpbml0ZVJvdyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgJGltcGxpY2l0OiBhbnksIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY291bnQ6IG51bWJlcikge1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBmaXJzdCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbGFzdCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleCA9PT0gdGhpcy5jb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGV2ZW4oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvZGQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmV2ZW47XHJcbiAgICB9XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdF1bdmlydHVhbFJlcGVhdE9mXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXQ8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcml2YXRlIF9kaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+O1xyXG4gICAgcHJpdmF0ZSBfdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248VD47XHJcbiAgICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcclxuICAgIC8qKlxyXG4gICAgICogc2Nyb2xsIG9mZnNldCBvZiB5LWF4aXMgaW4gcGl4ZWxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2Nyb2xsWTogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICogZmlyc3QgdmlzaWJsZSBpdGVtIGluZGV4IGluIGNvbGxlY3Rpb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZmlyc3RJdGVtUG9zaXRpb246IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICogbGFzdCB2aXNpYmxlIGl0ZW0gaW5kZXggaW4gY29sbGVjdGlvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9sYXN0SXRlbVBvc2l0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBfY29udGFpbmVyV2lkdGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX2NvbnRhaW5lckhlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hlbiB0aGlzIHZhbHVlIGlzIHRydWUsIGEgZnVsbCBjbGVhbiBsYXlvdXQgaXMgcmVxdWlyZWQsIGV2ZXJ5IGVsZW1lbnQgbXVzdCBiZSByZXBvc2l0aW9uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ludmFsaWRhdGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLyoqXHJcbiAgICAgKiB3aGVuIHRoaXMgdmFsdWUgaXMgdHJ1ZSwgYSBsYXlvdXQgaXMgaW4gcHJvY2Vzc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pc0luTGF5b3V0OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNJbk1lYXN1cmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIF9wZW5kaW5nTWVhc3VyZW1lbnQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIF9jb2xsZWN0aW9uOiBhbnlbXTtcclxuXHJcbiAgICBwcml2YXRlIF9yZWN5Y2xlcjogUmVjeWNsZXIgPSBuZXcgUmVjeWNsZXIoKTtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0T2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCBpbmZpbml0ZUZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpbmZpbml0ZUZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgaW5maW5pdGVGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8SW5maW5pdGVSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgICAgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICAgIHByaXZhdGUgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJbmZpbml0ZVJvdz4sXHJcbiAgICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgICAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRPZicgaW4gY2hhbmdlcykge1xyXG4gICAgICAgICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0T2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLl90cmFja0J5Rm4pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzIHN1Y2ggYXMgQXJyYXlzLmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nRG9DaGVjaygpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fZGlmZmVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLnZpcnR1YWxSZXBlYXRPZik7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbiA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbigoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55PiwgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXIsIGN1cnJlbnRJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gbmV3IGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCduZXcgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIGl0ZW0uaXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmVtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoYWRqdXN0ZWRQcmV2aW91c0luZGV4LCAxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdmUgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGN1cnJlbnRJbmRleCwgMCwgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoYWRqdXN0ZWRQcmV2aW91c0luZGV4LCAxKVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbltyZWNvcmQuY3VycmVudEluZGV4XSA9IHJlY29yZC5pdGVtO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoaXNNZWFzdXJlbWVudFJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5zY3JvbGxQb3NpdGlvblxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICAgIGZpbHRlcigoc2Nyb2xsWSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhzY3JvbGxZIC0gdGhpcy5fc2Nyb2xsWSkgPj0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgICAgICAoc2Nyb2xsWSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFkgPSBzY3JvbGxZO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZCh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnNpemVDaGFuZ2Uuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAoW3dpZHRoLCBoZWlnaHRdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc2l6ZUNoYW5nZTogJywgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuY2xlYW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlcXVlc3RNZWFzdXJlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTWVhc3VyZSB8fCB0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wZW5kaW5nTWVhc3VyZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9wZW5kaW5nTWVhc3VyZW1lbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgICAgIH0sIDYwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1lYXN1cmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlcXVlc3RMYXlvdXQoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlcXVlc3RMYXlvdXQnLCB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCwgdGhpcy5fY29udGFpbmVySGVpZ2h0LCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0luTWVhc3VyZSAmJiB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1lYXN1cmUoKSB7XHJcbiAgICAgICAgbGV0IGNvbGxlY3Rpb25OdW1iZXIgPSAhdGhpcy5fY29sbGVjdGlvbiB8fCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCA/IDAgOiB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5ob2xkZXJIZWlnaHQgPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCAqIGNvbGxlY3Rpb25OdW1iZXI7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCk7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGxheW91dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdvbiBsYXlvdXQnKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gdHJ1ZTtcclxuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLm1lYXN1cmUoKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24gfHwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gZGV0YWNoIGFsbCB2aWV3cyB3aXRob3V0IHJlY3ljbGUgdGhlbS5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjaGlsZC5jb250ZXh0LmluZGV4IDwgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gfHwgY2hpbGQuY29udGV4dC5pbmRleCA+IHRoaXMuX2xhc3RJdGVtUG9zaXRpb24gfHwgdGhpcy5faW52YWxpZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5maW5kUG9zaXRpb25JblJhbmdlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICAvLyBpZiAoY2hpbGQuY29udGV4dC5pbmRleCA8IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uIHx8IGNoaWxkLmNvbnRleHQuaW5kZXggPiB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uIHx8IHRoaXMuX2ludmFsaWRhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KGNoaWxkLmNvbnRleHQuaW5kZXgsIGNoaWxkKTtcclxuICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5zZXJ0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5wcnVuZVNjcmFwVmlld3MoKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCkge1xyXG4gICAgICAgIGxldCBsaW1pdCA9IHRoaXMuX2NvbnRhaW5lckhlaWdodCAvIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0ICsgMjtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5zZXRTY3JhcFZpZXdzTGltaXQobGltaXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5zZXJ0Vmlld3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgZmlyc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGZpcnN0Q2hpbGQuY29udGV4dC5pbmRleCAtIDE7IGkgPj0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGktLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBsYXN0Q2hpbGQuY29udGV4dC5pbmRleCArIDE7IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL25vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXHJcbiAgICBwcml2YXRlIGFwcGx5U3R5bGVzKHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKDAsICR7eX1weCwgMClgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgwLCAke3l9cHgsIDApYDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3RoaXMuX2NvbnRhaW5lcldpZHRofXB4YDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodH1weGA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGlzcGF0Y2hMYXlvdXQocG9zaXRpb246IG51bWJlciwgdmlldzogVmlld1JlZiwgYWRkQmVmb3JlOiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IHN0YXJ0UG9zWSA9IHBvc2l0aW9uICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcygodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+KS5yb290Tm9kZXNbMF0sIHN0YXJ0UG9zWSk7XHJcbiAgICAgICAgaWYgKGFkZEJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlldy5yZWF0dGFjaCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZFBvc2l0aW9uSW5SYW5nZSgpIHtcclxuICAgICAgICBsZXQgc2Nyb2xsWSA9IHRoaXMuX3Njcm9sbFk7XHJcbiAgICAgICAgbGV0IGZpcnN0UG9zaXRpb24gPSBNYXRoLmZsb29yKHNjcm9sbFkgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCk7XHJcbiAgICAgICAgbGV0IGZpcnN0UG9zaXRpb25PZmZzZXQgPSBzY3JvbGxZIC0gZmlyc3RQb3NpdGlvbiAqIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0O1xyXG4gICAgICAgIGxldCBsYXN0UG9zaXRpb24gPSBNYXRoLmNlaWwoKHRoaXMuX2NvbnRhaW5lckhlaWdodCArIGZpcnN0UG9zaXRpb25PZmZzZXQpIC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQpICsgZmlyc3RQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiA9IE1hdGgubWF4KGZpcnN0UG9zaXRpb24gLSAxLCAwKTtcclxuICAgICAgICB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uID0gTWF0aC5taW4obGFzdFBvc2l0aW9uICsgMSwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFZpZXcocG9zaXRpb246IG51bWJlcik6IFZpZXdSZWYge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fcmVjeWNsZXIuZ2V0Vmlldyhwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLl9jb2xsZWN0aW9uW3Bvc2l0aW9uXTtcclxuICAgICAgICBsZXQgY291bnQgPSB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3RlbXBsYXRlLmNyZWF0ZUVtYmVkZGVkVmlldyhuZXcgSW5maW5pdGVSb3coaXRlbSwgcG9zaXRpb24sIGNvdW50KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93PikuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+KS5jb250ZXh0LmluZGV4ID0gcG9zaXRpb247XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4pLmNvbnRleHQuY291bnQgPSBjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XHJcbn1cclxuIl19