import { Component, ViewChild, Output, Input, Directive, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef, NgModule } from '@angular/core';
import { Subscription, BehaviorSubject, fromEvent } from 'rxjs';
import { filter, tap, map, debounceTime, first } from 'rxjs/operators';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatAsynch } from 'virtual-repeat-angular-lib/virtual-repeat-asynch';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
const /** @type {?} */ INVALID_POSITION = -1;
class VirtualRepeatContainer$1 {
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     */
    constructor() {
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
    /**
     * @param {?} height
     * @return {?}
     */
    set holderHeight(height) {
        if (typeof height !== 'undefined') {
            this._holderHeight = height;
            if (this._holderHeight === 0) {
                this.listContainer.nativeElement.scrollTop = 0;
            }
            // When initialization, the list-holder doesn't not have its height. So the scrollTop should be delayed for waiting
            // the list-holder rendered bigger than the list-container.
            if (this._initialScrollTop !== INVALID_POSITION && this._holderHeight !== 0) {
                setTimeout(() => {
                    this.listContainer.nativeElement.scrollTop = this._initialScrollTop;
                    this._initialScrollTop = INVALID_POSITION;
                });
            }
        }
    }
    /**
     * @return {?}
     */
    get holderHeight() {
        return this._holderHeight;
    }
    /**
     * @return {?}
     */
    get holderHeightInPx() {
        if (this.holderHeight) {
            return this.holderHeight + 'px';
        }
        return '100%';
    }
    /**
     * scroll state change
     * @return {?}
     */
    get scrollStateChange() {
        return this._scrollStateChange.asObservable();
    }
    /**
     * current scroll position.
     * @return {?}
     */
    get scrollPosition() {
        return this._scrollPosition.asObservable();
    }
    /**
     * list container width and height.
     * @return {?}
     */
    get sizeChange() {
        return this._sizeChange.asObservable();
    }
    /**
     * @param {?} rowHeight
     * @return {?}
     */
    set rowHeight(rowHeight) {
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
    }
    /**
     * @param {?} p
     * @return {?}
     */
    set newScrollPosition(p) {
        // console.log('p', p);
        this.listContainer.nativeElement.scrollTop = p;
        // if list-holder has no height at the certain time. scrollTop will not be set.
        if (!this.holderHeight) {
            this._initialScrollTop = p;
        }
        this._scrollPosition.next(p);
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this.scrollbarStyle === 'hide-scrollbar') {
            this.listContainer.nativeElement.style.right = (0 - this.scrollbarWidth) + 'px';
            this.listContainer.nativeElement.style.paddingRight = this.scrollbarWidth + 'px';
        }
        if (window) {
            this._subscription.add(fromEvent(window, 'resize')
                .subscribe(() => {
                this.requestMeasure();
            }));
        }
        this._subscription.add(fromEvent(this.listContainer.nativeElement, 'scroll')
            .pipe(filter(() => {
            if (this.ignoreScrollEvent) {
                this.ignoreScrollEvent = false;
                return false;
            }
            return true;
        }), map(() => {
            return this.listContainer.nativeElement.scrollTop;
        }))
            .subscribe((scrollY) => {
            this._scrollPosition.next(scrollY);
        }));
        this._subscription.add(this.scrollPosition
            .pipe(tap(() => {
            if (this.currentScrollState === SCROLL_STATE.IDLE) {
                this.currentScrollState = SCROLL_STATE.SCROLLING;
                this._scrollStateChange.next(this.currentScrollState);
            }
        }), debounceTime(SCROLL_STOP_TIME_THRESHOLD))
            .subscribe(() => {
            if (this.currentScrollState === SCROLL_STATE.SCROLLING) {
                this.currentScrollState = SCROLL_STATE.IDLE;
                this._scrollStateChange.next(this.currentScrollState);
            }
        }));
        setTimeout(() => {
            this.requestMeasure();
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
    /**
     * @return {?}
     */
    measure() {
        if (this.listContainer && this.listContainer.nativeElement) {
            // let measuredWidth = this.listContainer.nativeElement.clientWidth;
            // let measuredHeight = this.listContainer.nativeElement.clientHeight;
            let /** @type {?} */ rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return { width: this._containerWidth, height: this._containerHeight };
        }
        return { width: 0, height: 0 };
    }
    /**
     * @return {?}
     */
    requestMeasure() {
        let { width, height } = this.measure();
        this._sizeChange.next([width, height]);
    }
}
VirtualRepeatContainer$1.decorators = [
    { type: Component, args: [{
                selector: 'gc-virtual-repeat-container',
                template: `<div class="gc-virtual-repeat-container" #listContainer [ngClass]="scrollbarStyle">
    <div class="gc-virtual-repeat-container" [style.height]="holderHeightInPx">
        <ng-content></ng-content>
    </div>
</div>
`,
                styles: [`.gc-virtual-repeat-container{overflow-y:auto;overflow-x:hidden;position:relative;contain:layout;-webkit-overflow-scrolling:touch}.gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%;position:relative}.gc-virtual-repeat-container.normal{width:100%;height:100%}.gc-virtual-repeat-container.hide-scrollbar{position:absolute;top:0;left:0;bottom:0;right:0}`]
            },] },
];
/** @nocollapse */
VirtualRepeatContainer$1.ctorParameters = () => [];
VirtualRepeatContainer$1.propDecorators = {
    listContainer: [{ type: ViewChild, args: ['listContainer',] }],
    scrollPosition: [{ type: Output }],
    rowHeight: [{ type: Input }],
    newScrollPosition: [{ type: Input }]
};
/** @enum {number} */
const SCROLL_STATE = {
    SCROLLING: 0,
    IDLE: 1,
};
SCROLL_STATE[SCROLL_STATE.SCROLLING] = "SCROLLING";
SCROLL_STATE[SCROLL_STATE.IDLE] = "IDLE";
/**
 * @return {?}
 */
function getScrollBarWidth() {
    let /** @type {?} */ inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";
    let /** @type {?} */ outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);
    document.body.appendChild(outer);
    let /** @type {?} */ w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let /** @type {?} */ w2 = inner.offsetWidth;
    if (w1 == w2) {
        w2 = outer.clientWidth;
    }
    document.body.removeChild(outer);
    return (w1 - w2);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @template T
 */
class VirtualRepeat extends VirtualRepeatBase {
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
/**
 * @param {?} type
 * @return {?}
 */
function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @template T
 */
class VirtualRepeatAsynch$1 extends VirtualRepeatBase {
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
VirtualRepeatAsynch$1.decorators = [
    { type: Directive, args: [{
                selector: '[virtualRepeatAsynch]'
            },] },
];
/** @nocollapse */
VirtualRepeatAsynch$1.ctorParameters = () => [
    { type: VirtualRepeatContainer$1 },
    { type: IterableDiffers },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
VirtualRepeatAsynch$1.propDecorators = {
    virtualRepeatAsynchOf: [{ type: Input }],
    virtualRepeatAsynchForTrackBy: [{ type: Input }],
    virtualRepeatAsynchForTemplate: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class VirtualRepeatAngularLibModule {
}
VirtualRepeatAngularLibModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    BrowserModule
                ],
                declarations: [
                    VirtualRepeatContainer$1,
                    VirtualRepeat,
                    VirtualRepeatAsynch
                ],
                exports: [
                    VirtualRepeatContainer$1,
                    VirtualRepeat,
                    VirtualRepeatAsynch
                ]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { SCROLL_STOP_TIME_THRESHOLD, VirtualRepeatContainer$1 as VirtualRepeatContainer, SCROLL_STATE, getScrollBarWidth, VirtualRepeat, getTypeNameForDebugging, VirtualRepeatAsynch$1 as VirtualRepeatAsynch, VirtualRepeatAngularLibModule };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIuanMubWFwIiwic291cmNlcyI6WyJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXIudHMiLCJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFzeW5jaC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCJcbmltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT3V0cHV0LCBJbnB1dCwgU2ltcGxlQ2hhbmdlcywgT25DaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24sIEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgZnJvbUV2ZW50IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBza2lwLCBmaWx0ZXIsIHRhcCwgZGVsYXksIHRha2UsIGNvbmNhdCwgbWFwLCBkZWJvdW5jZVRpbWUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBTQ1JPTExfU1RPUF9USU1FX1RIUkVTSE9MRCA9IDIwMDsgLy8gaW4gbWlsbGlzZWNvbmRzXG5cbmNvbnN0IElOVkFMSURfUE9TSVRJT04gPSAtMTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXInLFxuICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lclwiICNsaXN0Q29udGFpbmVyIFtuZ0NsYXNzXT1cInNjcm9sbGJhclN0eWxlXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgW3N0eWxlLmhlaWdodF09XCJob2xkZXJIZWlnaHRJblB4XCI+XHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgPC9kaXY+XHJcbjwvZGl2PlxyXG5gLFxuICAgIHN0eWxlczogW2AuZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVye292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjtwb3NpdGlvbjpyZWxhdGl2ZTtjb250YWluOmxheW91dDstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyIC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXItaG9sZGVye3dpZHRoOjEwMCU7cG9zaXRpb246cmVsYXRpdmV9LmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci5ub3JtYWx7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmhpZGUtc2Nyb2xsYmFye3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowfWBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRDb250YWluZXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHByaXZhdGUgX2hvbGRlckhlaWdodDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJXaWR0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJIZWlnaHQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICAgIHByaXZhdGUgX3Njcm9sbFN0YXRlQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8U0NST0xMX1NUQVRFPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoU0NST0xMX1NUQVRFLklETEUpO1xuICAgIHByaXZhdGUgX3Njcm9sbFBvc2l0aW9uOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoMCk7XG4gICAgcHJpdmF0ZSBfc2l6ZUNoYW5nZTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcltdPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoWzAsIDBdKTtcblxuICAgIHByaXZhdGUgaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuXG4gICAgY3VycmVudFNjcm9sbFN0YXRlOiBTQ1JPTExfU1RBVEUgPSBTQ1JPTExfU1RBVEUuSURMRTtcblxuICAgIEBWaWV3Q2hpbGQoJ2xpc3RDb250YWluZXInKSBsaXN0Q29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gICAgc2Nyb2xsYmFyU3R5bGU6IHN0cmluZztcbiAgICBzY3JvbGxiYXJXaWR0aDogbnVtYmVyO1xuXG4gICAgc2V0IGhvbGRlckhlaWdodChoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBpZiAodHlwZW9mIGhlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvbGRlckhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ob2xkZXJIZWlnaHQgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2hlbiBpbml0aWFsaXphdGlvbiwgdGhlIGxpc3QtaG9sZGVyIGRvZXNuJ3Qgbm90IGhhdmUgaXRzIGhlaWdodC4gU28gdGhlIHNjcm9sbFRvcCBzaG91bGQgYmUgZGVsYXllZCBmb3Igd2FpdGluZ1xuICAgICAgICAgICAgLy8gdGhlIGxpc3QtaG9sZGVyIHJlbmRlcmVkIGJpZ2dlciB0aGFuIHRoZSBsaXN0LWNvbnRhaW5lci5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pbml0aWFsU2Nyb2xsVG9wICE9PSBJTlZBTElEX1BPU0lUSU9OICYmIHRoaXMuX2hvbGRlckhlaWdodCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wID0gSU5WQUxJRF9QT1NJVElPTjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvbGRlckhlaWdodDtcbiAgICB9XG5cbiAgICBnZXQgaG9sZGVySGVpZ2h0SW5QeCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhvbGRlckhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcxMDAlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGwgc3RhdGUgY2hhbmdlXG4gICAgICovXG4gICAgZ2V0IHNjcm9sbFN0YXRlQ2hhbmdlKCk6IE9ic2VydmFibGU8U0NST0xMX1NUQVRFPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxTdGF0ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KClcbiAgICBnZXQgc2Nyb2xsUG9zaXRpb24oKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBvc2l0aW9uLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxpc3QgY29udGFpbmVyIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICovXG4gICAgZ2V0IHNpemVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxudW1iZXJbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBASW5wdXQoKSBzZXQgcm93SGVpZ2h0KHJvd0hlaWdodDogc3RyaW5nKSB7XG4gICAgICAgIGlmKHJvd0hlaWdodCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChyb3dIZWlnaHQgIT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yb3dIZWlnaHQgPSBOdW1iZXIocm93SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSB0aGlzLl9hdXRvSGVpZ2h0ID0gIGZhbHNlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodEF1dG9Db21wdXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9IZWlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSBcblxuICAgIF9yb3dIZWlnaHQ6IG51bWJlciA9IDEwMDtcbiAgICBfYXV0b0hlaWdodDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIF9oZWlnaHRBdXRvQ29tcHV0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IG5ld1Njcm9sbFBvc2l0aW9uKHA6IG51bWJlcikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncCcsIHApO1xuICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSBwO1xuICAgICAgICAvLyBpZiBsaXN0LWhvbGRlciBoYXMgbm8gaGVpZ2h0IGF0IHRoZSBjZXJ0YWluIHRpbWUuIHNjcm9sbFRvcCB3aWxsIG5vdCBiZSBzZXQuXG4gICAgICAgIGlmICghdGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQocCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVUlUaW1lbGluZU1ldGVyIGlzIG9wdGlvbmFsIGluamVjdGlvbi4gd2hlbiB0aGlzIGNvbXBvbmVudCB1c2VkIGluc2lkZSBhIFVJVGltZWxpbmVNZXRlci5cbiAgICAgKiBpdCBpcyByZXNwb25zaWJsZSB0byB1cGRhdGUgdGhlIHNjcm9sbFlcbiAgICAgKiBAcGFyYW0gX3RpbWVsaW5lTWV0ZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJTdHlsZSA9ICdub3JtYWwnO1xuICAgICAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gZ2V0U2Nyb2xsQmFyV2lkdGgoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbGJhclN0eWxlID09PSAnaGlkZS1zY3JvbGxiYXInKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5yaWdodCA9ICgwIC0gdGhpcy5zY3JvbGxiYXJXaWR0aCkgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gdGhpcy5zY3JvbGxiYXJXaWR0aCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdzY3JvbGwnKVxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlnbm9yZVNjcm9sbEV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoc2Nyb2xsWTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQoc2Nyb2xsWSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFBvc2l0aW9uXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5JRExFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPSBTQ1JPTExfU1RBVEUuU0NST0xMSU5HO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKFNDUk9MTF9TVE9QX1RJTUVfVEhSRVNIT0xEKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5TQ1JPTExJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5JRExFO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICBtZWFzdXJlKCk6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RDb250YWluZXIgJiYgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZFdpZHRoID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAvLyBsZXQgbWVhc3VyZWRIZWlnaHQgPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBsZXQgcmVjdCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSByZWN0LndpZHRoIC0gdGhpcy5zY3JvbGxiYXJXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgcmV0dXJuIHsgd2lkdGg6IHRoaXMuX2NvbnRhaW5lcldpZHRoLCBoZWlnaHQ6IHRoaXMuX2NvbnRhaW5lckhlaWdodCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB9XG5cbiAgICByZXF1ZXN0TWVhc3VyZSgpIHtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5tZWFzdXJlKCk7XG4gICAgICAgIHRoaXMuX3NpemVDaGFuZ2UubmV4dChbd2lkdGgsIGhlaWdodF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0NST0xMX1NUQVRFIHtcbiAgICBTQ1JPTExJTkcsXG4gICAgSURMRVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Nyb2xsQmFyV2lkdGgoKSB7XG4gICAgbGV0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgaW5uZXIuc3R5bGUuaGVpZ2h0ID0gXCIyMDBweFwiO1xuXG4gICAgbGV0IG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3V0ZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgb3V0ZXIuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMjAwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5oZWlnaHQgPSBcIjE1MHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xuICAgIGxldCB3MSA9IGlubmVyLm9mZnNldFdpZHRoO1xuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XG4gICAgbGV0IHcyID0gaW5uZXIub2Zmc2V0V2lkdGg7XG5cbiAgICBpZiAodzEgPT0gdzIpIHtcbiAgICAgICAgdzIgPSBvdXRlci5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcblxuICAgIHJldHVybiAodzEgLSB3Mik7XG59XG5cbiIsImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBEb0NoZWNrLFxyXG4gICAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gICAgSW5wdXQsXHJcbiAgICBpc0Rldk1vZGUsXHJcbiAgICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlcyxcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLy9pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWInO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdFJvdywgVmlydHVhbFJlcGVhdEJhc2UgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC5iYXNlJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0PFQ+IGV4dGVuZHMgVmlydHVhbFJlcGVhdEJhc2U8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcml2YXRlIF9jb2xsZWN0aW9uOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0T2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0Rm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpcnR1YWxSZXBlYXRGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgICAgICBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+LFxyXG4gICAgICAgIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICAgICAgc3VwZXIoX3ZpcnR1YWxSZXBlYXRDb250YWluZXIsIF9kaWZmZXJzLCBfdGVtcGxhdGUsIF92aWV3Q29udGFpbmVyUmVmKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCd2aXJ0dWFsUmVwZWF0T2YnIGluIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy8gUmVhY3Qgb24gdmlydHVhbFJlcGVhdE9mIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoYW5nZXNbJ3ZpcnR1YWxSZXBlYXRPZiddLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5fdHJhY2tCeUZuKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0RvQ2hlY2soKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpZmZlcikge1xyXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy52aXJ0dWFsUmVwZWF0T2YpO1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseUNoYW5nZXMoY2hhbmdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIG5ldyBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbmV3IGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCBpdGVtLml0ZW0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbW92ZSBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZlIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSlbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uW3JlY29yZC5jdXJyZW50SW5kZXhdID0gcmVjb3JkLml0ZW07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChpc01lYXN1cmVtZW50UmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuY2xlYW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbWVhc3VyZSgpIHtcclxuICAgICAgICBsZXQgY29sbGVjdGlvbk51bWJlciA9ICF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwID8gMCA6IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodCAqIGNvbGxlY3Rpb25OdW1iZXI7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCk7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5b3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IHRydWU7XHJcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5tZWFzdXJlKCk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgdmlld3Mgd2l0aG91dCByZWN5Y2xlIHRoZW0uXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZmluZFBvc2l0aW9uSW5SYW5nZSh0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgIGktLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnNlcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluc2VydFZpZXdzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RDaGlsZC5jb250ZXh0LmluZGV4IC0gMTsgaSA+PSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxhc3RDaGlsZC5jb250ZXh0LmluZGV4ICsgMTsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRWaWV3KHBvc2l0aW9uOiBudW1iZXIpOiBWaWV3UmVmIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3JlY3ljbGVyLmdldFZpZXcocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5fY29sbGVjdGlvbltwb3NpdGlvbl07XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLl90ZW1wbGF0ZS5jcmVhdGVFbWJlZGRlZFZpZXcobmV3IFZpcnR1YWxSZXBlYXRSb3coaXRlbSwgcG9zaXRpb24sIGNvdW50KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LiRpbXBsaWNpdCA9IGl0ZW07XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5pbmRleCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuY291bnQgPSBjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIERpcmVjdGl2ZSxcclxuICAgIEVtYmVkZGVkVmlld1JlZixcclxuICAgIElucHV0LFxyXG4gICAgaXNEZXZNb2RlLFxyXG4gICAgSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgTmdJdGVyYWJsZSxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIE9uRGVzdHJveSxcclxuICAgIE9uSW5pdCxcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIFRyYWNrQnlGdW5jdGlvbixcclxuICAgIFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IG1hcCwgZmlyc3QgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xyXG4vL2ltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYic7XHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRSb3csIFZpcnR1YWxSZXBlYXRCYXNlIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQuYmFzZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBc3luY2hDb2xsZWN0aW9uIHtcclxuICAgIGdldExlbmd0aCgpOiBPYnNlcnZhYmxlPG51bWJlcj47XHJcbiAgICBnZXRJdGVtKGk6IG51bWJlcik6IE9ic2VydmFibGU8YW55PjtcclxufVxyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ1t2aXJ0dWFsUmVwZWF0QXN5bmNoXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRBc3luY2g8VD4gZXh0ZW5kcyBWaXJ0dWFsUmVwZWF0QmFzZTxUPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICAgIHByb3RlY3RlZCBfY29sbGVjdGlvbjogSUFzeW5jaENvbGxlY3Rpb247XHJcblxyXG4gICAgQElucHV0KCkgdmlydHVhbFJlcGVhdEFzeW5jaE9mOiBOZ0l0ZXJhYmxlPFQ+O1xyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyOiBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxyXG4gICAgICAgIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICAgICAgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcclxuICAgICAgICBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgICAgIHN1cGVyKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLCBfZGlmZmVycywgX3RlbXBsYXRlLCBfdmlld0NvbnRhaW5lclJlZilcclxuICAgIH1cclxuXHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG4gICAgICAgIGlmICgndmlydHVhbFJlcGVhdEFzeW5jaE9mJyBpbiBjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vIFJlYWN0IG9uIHZpcnR1YWxSZXBlYXRBc3luY2hPZiBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjaGFuZ2VzWyd2aXJ0dWFsUmVwZWF0QXN5bmNoT2YnXS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2hlaWdodEF1dG9Db21wdXRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbWVhc3VyZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uZ2V0TGVuZ3RoKCkucGlwZShmaXJzdCgpKS5zdWJzY3JpYmUoKGxlbmd0aCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodCAqIGxlbmd0aDtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVNjcmFwVmlld3NMaW1pdCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGxheW91dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdvbiBsYXlvdXQnKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gdHJ1ZTtcclxuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLm1lYXN1cmUoKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgLy8gZGV0YWNoIGFsbCB2aWV3cyB3aXRob3V0IHJlY3ljbGUgdGhlbS5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV0YWNoQWxsVmlld3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5nZXRMZW5ndGgoKS5waXBlKGZpcnN0KCkpLnN1YnNjcmliZSgobGVuZ3RoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChsZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV0YWNoQWxsVmlld3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmZpbmRQb3NpdGlvbkluUmFuZ2UobGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNoaWxkLmNvbnRleHQuaW5kZXggPCB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiB8fCBjaGlsZC5jb250ZXh0LmluZGV4ID4gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbiB8fCB0aGlzLl9pbnZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KGNoaWxkLmNvbnRleHQuaW5kZXgsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmluc2VydFZpZXdzKGxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaW5zZXJ0Vmlld3MoY29sbGVjdGlvbl9sZW5ndGg6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RDaGlsZC5jb250ZXh0LmluZGV4IC0gMTsgaSA+PSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGgsIGkpLnN1YnNjcmliZSgodmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbGFzdENoaWxkLmNvbnRleHQuaW5kZXggKyAxOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGgsIGkpLnN1YnNjcmliZSgodmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGgsIGkpLnN1YnNjcmliZSgodmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGg6IG51bWJlciwgcG9zaXRpb246IG51bWJlcik6IE9ic2VydmFibGU8Vmlld1JlZj4ge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fcmVjeWNsZXIuZ2V0Vmlldyhwb3NpdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZ2V0SXRlbShwb3NpdGlvbilcclxuICAgICAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICAgICAgICBmaXJzdCgpLFxyXG4gICAgICAgICAgICAgICAgbWFwKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSB0aGlzLl90ZW1wbGF0ZS5jcmVhdGVFbWJlZGRlZFZpZXcobmV3IFZpcnR1YWxSZXBlYXRSb3coaXRlbSwgcG9zaXRpb24sIGNvbGxlY3Rpb25fbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LiRpbXBsaWNpdCA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5pbmRleCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuY291bnQgPSBjb2xsZWN0aW9uX2xlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXQgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0JztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRBc3luY2ggfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC1hc3luY2gnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQnJvd3Nlck1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxuICAgIFZpcnR1YWxSZXBlYXQsXG4gICAgVmlydHVhbFJlcGVhdEFzeW5jaFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgVmlydHVhbFJlcGVhdENvbnRhaW5lcixcbiAgICBWaXJ0dWFsUmVwZWF0LFxuICAgIFZpcnR1YWxSZXBlYXRBc3luY2hcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0QW5ndWxhckxpYk1vZHVsZSB7IH1cbiJdLCJuYW1lcyI6WyJWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSx1QkFJYSwwQkFBMEIsR0FBRyxHQUFHLENBQUM7QUFFOUMsdUJBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFZNUI7Ozs7O0lBeUdJOzZCQXhHZ0MsQ0FBQzsrQkFDQyxDQUFDO2dDQUNBLENBQUM7NkJBRUUsSUFBSSxZQUFZLEVBQUU7a0NBRUksSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQzsrQkFDL0MsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDOzJCQUN4QixJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQ0FFaEQsS0FBSztpQ0FFTCxnQkFBZ0I7a0NBRVQsWUFBWSxDQUFDLElBQUk7MEJBc0UvQixHQUFHOzJCQUNELEtBQUs7bUNBQ0csS0FBSztRQW1CaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO0tBQzdDOzs7OztJQXRGRCxJQUFJLFlBQVksQ0FBQyxNQUFjO1FBQzNCLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFF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