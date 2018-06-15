/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
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
export class VirtualRepeatAsynch extends VirtualRepeatBase {
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
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if ('virtualRepeatAsynchOf' in changes) {
            // React on virtualRepeatAsynchOf only once all inputs have been initialized
            const /** @type {?} */ value = changes['virtualRepeatAsynchOf'].currentValue;
            this._collection = value;
            this._virtualRepeatContainer._heightAutoComputed = false;
            this.requestMeasure();
        }
    }
    /**
     * @return {?}
     */
    measure() {
        if (!this._collection)
            return;
        this._isInMeasure = true;
        this._collection.getLength().pipe(first()).subscribe((length) => {
            this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * length;
            // calculate a approximate number of which a view can contain
            this.calculateScrapViewsLimit();
            this._isInMeasure = false;
            this._invalidate = true;
            this.requestLayout();
        });
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
        if (!this._collection) {
            // detach all views without recycle them.
            return this.detachAllViews();
        }
        this._collection.getLength().pipe(first()).subscribe((length) => {
            if (length == 0) {
                return this.detachAllViews();
            }
            this.findPositionInRange(length);
            for (let /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
                let /** @type {?} */ child = /** @type {?} */ (this._viewContainerRef.get(i));
                // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
                this._viewContainerRef.detach(i);
                this._recycler.recycleView(child.context.index, child);
                i--;
                // }
            }
            this.insertViews(length);
            this._recycler.pruneScrapViews();
            this._isInLayout = false;
            this._invalidate = false;
        });
    }
    /**
     * @param {?} collection_length
     * @return {?}
     */
    insertViews(collection_length) {
        if (this._viewContainerRef.length > 0) {
            let /** @type {?} */ firstChild = /** @type {?} */ (this._viewContainerRef.get(0));
            let /** @type {?} */ lastChild = /** @type {?} */ (this._viewContainerRef.get(this._viewContainerRef.length - 1));
            for (let /** @type {?} */ i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                this.getView(collection_length, i).subscribe((view) => {
                    this.dispatchLayout(i, view, true);
                });
            }
            for (let /** @type {?} */ i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                let /** @type {?} */ view = this.getView(collection_length, i).subscribe((view) => {
                    this.dispatchLayout(i, view, false);
                });
            }
        }
        else {
            for (let /** @type {?} */ i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                this.getView(collection_length, i).subscribe((view) => {
                    this.dispatchLayout(i, view, false);
                });
            }
        }
    }
    /**
     * @param {?} collection_length
     * @param {?} position
     * @return {?}
     */
    getView(collection_length, position) {
        let /** @type {?} */ view = this._recycler.getView(position);
        return this._collection.getItem(position)
            .pipe(first(), map((item) => {
            if (!view) {
                view = this._template.createEmbeddedView(new VirtualRepeatRow(item, position, collection_length));
            }
            else {
                (/** @type {?} */ (view)).context.$implicit = item;
                (/** @type {?} */ (view)).context.index = position;
                (/** @type {?} */ (view)).context.count = collection_length;
            }
            return view;
        }));
    }
}
VirtualRepeatAsynch.decorators = [
    { type: Directive, args: [{
                selector: '[virtualRepeatAsynch]'
            },] },
];
/** @nocollapse */
VirtualRepeatAsynch.ctorParameters = () => [
    { type: VirtualRepeatContainer },
    { type: IterableDiffers },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
VirtualRepeatAsynch.propDecorators = {
    virtualRepeatAsynchOf: [{ type: Input }],
    virtualRepeatAsynchForTrackBy: [{ type: Input }],
    virtualRepeatAsynchForTemplate: [{ type: Input }]
};
function VirtualRepeatAsynch_tsickle_Closure_declarations() {
    /** @type {?} */
    VirtualRepeatAsynch.prototype._collection;
    /** @type {?} */
    VirtualRepeatAsynch.prototype.virtualRepeatAsynchOf;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYXN5bmNoLmpzIiwic291cmNlUm9vdCI6Im5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvIiwic291cmNlcyI6WyJsaWIvdmlydHVhbC1yZXBlYXQtYXN5bmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUVULEtBQUssRUFDTCxTQUFTLEVBQ1QsZUFBZSxFQU1mLFdBQVcsRUFFWCxnQkFBZ0IsRUFFbkIsTUFBTSxlQUFlLENBQUM7QUFHdkIsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUVwRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFVckcsTUFBTSwwQkFBOEIsU0FBUSxpQkFBb0I7Ozs7Ozs7SUE2QjVELFlBQVksdUJBQStDLEVBQ3ZELFFBQXlCLEVBQ3pCLFNBQXdDLEVBQ3hDLGlCQUFtQztRQUNuQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO0tBQ3pFOzs7OztJQTVCRCxJQUNJLDZCQUE2QixDQUFDLEVBQXNCO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN4RCxFQUFFLENBQUMsQ0FBQyxrQkFBSyxPQUFPLHVCQUFTLE9BQU8sQ0FBQyxJQUFJLEdBQUUsQ0FBQztnQkFDcEMsT0FBTyxDQUFDLElBQUksQ0FDUiw0Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSTtvQkFDbEUsd0hBQXdILENBQUMsQ0FBQzthQUNqSTtTQUNKO1FBQ0QsSUFBSSxDQUFDLFVBQVUs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QUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDckc7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixtQkFBQyxJQUF5QyxFQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3JFLG1CQUFDLElBQXlDLEVBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDckUsbUJBQUMsSUFBeUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUM7YUFDakY7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ2YsQ0FBQyxDQUNMLENBQUM7S0FDVDs7O1lBMUlKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsdUJBQXVCO2FBQ3BDOzs7O1lBWFEsc0JBQXNCO1lBZjNCLGVBQWU7WUFNZixXQUFXO1lBRVgsZ0JBQWdCOzs7b0NBdUJmLEtBQUs7NENBRUwsS0FBSzs2Q0FnQkwsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgICBJbnB1dCxcclxuICAgIGlzRGV2TW9kZSxcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtYXAsIGZpcnN0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuLy9pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWInO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Um93LCBWaXJ0dWFsUmVwZWF0QmFzZSB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3ZpcnR1YWwtcmVwZWF0LmJhc2UnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQXN5bmNoQ29sbGVjdGlvbiB7XHJcbiAgICBnZXRMZW5ndGgoKTogT2JzZXJ2YWJsZTxudW1iZXI+O1xyXG4gICAgZ2V0SXRlbShpOiBudW1iZXIpOiBPYnNlcnZhYmxlPGFueT47XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdEFzeW5jaF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0QXN5bmNoPFQ+IGV4dGVuZHMgVmlydHVhbFJlcGVhdEJhc2U8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2NvbGxlY3Rpb246IElBc3luY2hDb2xsZWN0aW9uO1xyXG5cclxuICAgIEBJbnB1dCgpIHZpcnR1YWxSZXBlYXRBc3luY2hPZjogTmdJdGVyYWJsZTxUPjtcclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRBc3luY2hGb3JUcmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcclxuICAgICAgICBpZiAoaXNEZXZNb2RlKCkgJiYgZm4gIT0gbnVsbCAmJiB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgaWYgKDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXHJcbiAgICAgICAgICAgICAgICAgICAgYFNlZSBodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpL2NvbW1vbi9pbmRleC9OZ0Zvci1kaXJlY3RpdmUuaHRtbCMhI2NoYW5nZS1wcm9wYWdhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93Pikge1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfdmlydHVhbFJlcGVhdENvbnRhaW5lcjogVmlydHVhbFJlcGVhdENvbnRhaW5lcixcclxuICAgICAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICAgIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4sXHJcbiAgICAgICAgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcclxuICAgICAgICBzdXBlcihfdmlydHVhbFJlcGVhdENvbnRhaW5lciwgX2RpZmZlcnMsIF90ZW1wbGF0ZSwgX3ZpZXdDb250YWluZXJSZWYpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgICAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRBc3luY2hPZicgaW4gY2hhbmdlcykge1xyXG4gICAgICAgICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0QXN5bmNoT2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdEFzeW5jaE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uID0gdmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG1lYXN1cmUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLmdldExlbmd0aCgpLnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKChsZW5ndGgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5ob2xkZXJIZWlnaHQgPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQgKiBsZW5ndGg7XHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBhIGFwcHJveGltYXRlIG51bWJlciBvZiB3aGljaCBhIHZpZXcgY2FuIGNvbnRhaW5cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVTY3JhcFZpZXdzTGltaXQoKTtcclxuICAgICAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBsYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnb24gbGF5b3V0Jyk7XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IHRydWU7XHJcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5tZWFzdXJlKCk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgdmlld3Mgd2l0aG91dCByZWN5Y2xlIHRoZW0uXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRldGFjaEFsbFZpZXdzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uZ2V0TGVuZ3RoKCkucGlwZShmaXJzdCgpKS5zdWJzY3JpYmUoKGxlbmd0aCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRldGFjaEFsbFZpZXdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5maW5kUG9zaXRpb25JblJhbmdlKGxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjaGlsZC5jb250ZXh0LmluZGV4IDwgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gfHwgY2hpbGQuY29udGV4dC5pbmRleCA+IHRoaXMuX2xhc3RJdGVtUG9zaXRpb24gfHwgdGhpcy5faW52YWxpZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pbnNlcnRWaWV3cyhsZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5wcnVuZVNjcmFwVmlld3MoKTtcclxuICAgICAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluc2VydFZpZXdzKGNvbGxlY3Rpb25fbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCgwKTtcclxuICAgICAgICAgICAgbGV0IGxhc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGZpcnN0Q2hpbGQuY29udGV4dC5pbmRleCAtIDE7IGkgPj0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGktLSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoLCBpKS5zdWJzY3JpYmUoKHZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxhc3RDaGlsZC5jb250ZXh0LmluZGV4ICsgMTsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoLCBpKS5zdWJzY3JpYmUoKHZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoLCBpKS5zdWJzY3JpYmUoKHZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoOiBudW1iZXIsIHBvc2l0aW9uOiBudW1iZXIpOiBPYnNlcnZhYmxlPFZpZXdSZWY+IHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3JlY3ljbGVyLmdldFZpZXcocG9zaXRpb24pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmdldEl0ZW0ocG9zaXRpb24pXHJcbiAgICAgICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgICAgICAgZmlyc3QoKSxcclxuICAgICAgICAgICAgICAgIG1hcCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gdGhpcy5fdGVtcGxhdGUuY3JlYXRlRW1iZWRkZWRWaWV3KG5ldyBWaXJ0dWFsUmVwZWF0Um93KGl0ZW0sIHBvc2l0aW9uLCBjb2xsZWN0aW9uX2xlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuaW5kZXggPSBwb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LmNvdW50ID0gY29sbGVjdGlvbl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuIl19