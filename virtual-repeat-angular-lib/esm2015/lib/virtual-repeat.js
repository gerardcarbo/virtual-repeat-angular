/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Directive, Input, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef } from '@angular/core';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
/**
 * @template T
 */
export class VirtualRepeat extends VirtualRepeatBase {
    /**
     * @param {?} _virtualRepeatContainer
     * @param {?} _differs
     * @param {?} _template
     * @param {?} _viewContainerRef
     */
    constructor(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
        super(_virtualRepeatContainer, _differs, _template, _viewContainerRef);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    set virtualRepeatForTrackBy(fn) {
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
    get virtualRepeatForTrackBy() {
        return this._trackByFn;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set virtualRepeatForTemplate(value) {
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
    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }
    /**
     * @return {?}
     */
    measure() {
        let /** @type {?} */ collectionNumber = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * collectionNumber;
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
        this._isInLayout = true;
        let { width, height } = this._virtualRepeatContainer.measure();
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection || this._collection.length === 0) {
            // detach all views without recycle them.
            for (let /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
                let /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
                this._viewContainerRef.detach(i);
                i--;
            }
            this._isInLayout = false;
            this._invalidate = false;
            return;
        }
        this.findPositionInRange(this._collection.length);
        for (let /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
            let /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
            this._viewContainerRef.detach(i);
            this._recycler.recycleView(child.context.index, child);
            i--;
        }
        this.insertViews();
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
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
     * @param {?} position
     * @return {?}
     */
    getView(position) {
        let /** @type {?} */ view = this._recycler.getView(position);
        let /** @type {?} */ item = this._collection[position];
        let /** @type {?} */ count = this._collection.length;
        if (!view) {
            view = this._template.createEmbeddedView(new VirtualRepeatRow(item, position, count));
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
                selector: '[virtualRepeat]'
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
    virtualRepeatForTrackBy: [{ type: Input }],
    virtualRepeatForTemplate: [{ type: Input }]
};
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi8iLCJzb3VyY2VzIjpbImxpYi92aXJ0dWFsLXJlcGVhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFHVCxLQUFLLEVBQ0wsU0FBUyxFQUdULGVBQWUsRUFNZixXQUFXLEVBRVgsZ0JBQWdCLEVBRW5CLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDOzs7O0FBS3JHLE1BQU0sb0JBQXdCLFNBQVEsaUJBQW9COzs7Ozs7O0lBNkJ0RCxZQUFZLHVCQUErQyxFQUN2RCxRQUF5QixFQUN6QixTQUF3QyxFQUN4QyxpQkFBbUM7UUFDbkMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtLQUN6RTs7Ozs7SUE1QkQsSUFDSSx1QkFBdUIsQ0FBQyxFQUFzQjtRQUM5QyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsRUFBRSxDQUFDLENBQUMsa0JBQUssT0FBTyx1QkFBUyxPQUFPLENBQUMsSUFBSSxHQUFFLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQ1IsNENBQTRDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUk7b0JBQ2xFLHdIQUF3SCxDQUFDLENBQUM7YUFDakk7U0FDSjtRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0tBQ3hCOzs7O0lBRUQsSUFBSSx1QkFBdUI7UUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7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QUFLOzs7Ozs7Ozs7Ozs7QUE2SlYsTUFBTSxrQ0FBa0MsSUFBUztJQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0NBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIERpcmVjdGl2ZSxcclxuICAgIERvQ2hlY2ssXHJcbiAgICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgICBJbnB1dCxcclxuICAgIGlzRGV2TW9kZSxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLFxyXG4gICAgSXRlcmFibGVDaGFuZ2VzLFxyXG4gICAgSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgTmdJdGVyYWJsZSxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIE9uRGVzdHJveSxcclxuICAgIE9uSW5pdCxcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIFRyYWNrQnlGdW5jdGlvbixcclxuICAgIFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG4vL2ltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYic7XHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Um93LCBWaXJ0dWFsUmVwZWF0QmFzZSB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3ZpcnR1YWwtcmVwZWF0LmJhc2UnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ1t2aXJ0dWFsUmVwZWF0XSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXQ8VD4gZXh0ZW5kcyBWaXJ0dWFsUmVwZWF0QmFzZTxUPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgRG9DaGVjaywgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICAgIHByaXZhdGUgX2NvbGxlY3Rpb246IGFueVtdO1xyXG5cclxuICAgIEBJbnB1dCgpIHZpcnR1YWxSZXBlYXRPZjogTmdJdGVyYWJsZTxUPjtcclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRGb3JUcmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcclxuICAgICAgICBpZiAoaXNEZXZNb2RlKCkgJiYgZm4gIT0gbnVsbCAmJiB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgaWYgKDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXHJcbiAgICAgICAgICAgICAgICAgICAgYFNlZSBodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpL2NvbW1vbi9pbmRleC9OZ0Zvci1kaXJlY3RpdmUuaHRtbCMhI2NoYW5nZS1wcm9wYWdhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlydHVhbFJlcGVhdEZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93Pikge1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfdmlydHVhbFJlcGVhdENvbnRhaW5lcjogVmlydHVhbFJlcGVhdENvbnRhaW5lcixcclxuICAgICAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICAgIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4sXHJcbiAgICAgICAgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcclxuICAgICAgICBzdXBlcihfdmlydHVhbFJlcGVhdENvbnRhaW5lciwgX2RpZmZlcnMsIF90ZW1wbGF0ZSwgX3ZpZXdDb250YWluZXJSZWYpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgICAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRPZicgaW4gY2hhbmdlcykge1xyXG4gICAgICAgICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0T2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLl90cmFja0J5Rm4pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzIHN1Y2ggYXMgQXJyYXlzLmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nRG9DaGVjaygpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fZGlmZmVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLnZpcnR1YWxSZXBlYXRPZik7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbiA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbigoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55PiwgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXIsIGN1cnJlbnRJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gbmV3IGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCduZXcgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIGl0ZW0uaXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmVtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoYWRqdXN0ZWRQcmV2aW91c0luZGV4LCAxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdmUgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGN1cnJlbnRJbmRleCwgMCwgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoYWRqdXN0ZWRQcmV2aW91c0luZGV4LCAxKVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb25bcmVjb3JkLmN1cnJlbnRJbmRleF0gPSByZWNvcmQuaXRlbTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGlzTWVhc3VyZW1lbnRSZXF1aXJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5jbGVhbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBtZWFzdXJlKCkge1xyXG4gICAgICAgIGxldCBjb2xsZWN0aW9uTnVtYmVyID0gIXRoaXMuX2NvbGxlY3Rpb24gfHwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggPT09IDAgPyAwIDogdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuaG9sZGVySGVpZ2h0ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fcm93SGVpZ2h0ICogY29sbGVjdGlvbk51bWJlcjtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgYSBhcHByb3hpbWF0ZSBudW1iZXIgb2Ygd2hpY2ggYSB2aWV3IGNhbiBjb250YWluXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTY3JhcFZpZXdzTGltaXQoKTtcclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBsYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gdHJ1ZTtcclxuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLm1lYXN1cmUoKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24gfHwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gZGV0YWNoIGFsbCB2aWV3cyB3aXRob3V0IHJlY3ljbGUgdGhlbS5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5maW5kUG9zaXRpb25JblJhbmdlKHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KGNoaWxkLmNvbnRleHQuaW5kZXgsIGNoaWxkKTtcclxuICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluc2VydFZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIucHJ1bmVTY3JhcFZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaW5zZXJ0Vmlld3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgZmlyc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoMCk7XHJcbiAgICAgICAgICAgIGxldCBsYXN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBmaXJzdENoaWxkLmNvbnRleHQuaW5kZXggLSAxOyBpID49IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbGFzdENoaWxkLmNvbnRleHQuaW5kZXggKyAxOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldFZpZXcocG9zaXRpb246IG51bWJlcik6IFZpZXdSZWYge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fcmVjeWNsZXIuZ2V0Vmlldyhwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLl9jb2xsZWN0aW9uW3Bvc2l0aW9uXTtcclxuICAgICAgICBsZXQgY291bnQgPSB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3RlbXBsYXRlLmNyZWF0ZUVtYmVkZGVkVmlldyhuZXcgVmlydHVhbFJlcGVhdFJvdyhpdGVtLCBwb3NpdGlvbiwgY291bnQpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuJGltcGxpY2l0ID0gaXRlbTtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LmluZGV4ID0gcG9zaXRpb247XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5jb3VudCA9IGNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh0eXBlOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHR5cGVbJ25hbWUnXSB8fCB0eXBlb2YgdHlwZTtcclxufVxyXG4iXX0=