import { Component, ViewChild, Output, Input, Directive, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef, NgModule } from '@angular/core';
import { Subscription, BehaviorSubject, fromEvent } from 'rxjs';
import { filter, tap, map, debounceTime } from 'rxjs/operators';
import { BrowserModule } from '@angular/platform-browser';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
const /** @type {?} */ INVALID_POSITION = -1;
class VirtualRepeatContainer {
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
        this.rowHeight = 100;
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
        /*this._subscription.add(
                    this.scrollPosition
                        .pipe(
                            skip(1)
                        )
                        .subscribe((scrollY) => {
                        })
                );*/
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
VirtualRepeatContainer.decorators = [
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
VirtualRepeatContainer.ctorParameters = () => [];
VirtualRepeatContainer.propDecorators = {
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
class Recycler {
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
class InfiniteRow {
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
/**
 * @template T
 */
class VirtualRepeat {
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
class VirtualRepeatAngularLibModule {
}
VirtualRepeatAngularLibModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    BrowserModule
                ],
                declarations: [
                    VirtualRepeatContainer,
                    VirtualRepeat
                ],
                exports: [
                    VirtualRepeatContainer,
                    VirtualRepeat
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

export { SCROLL_STOP_TIME_THRESHOLD, VirtualRepeatContainer, SCROLL_STATE, getScrollBarWidth, Recycler, InfiniteRow, VirtualRepeat, getTypeNameForDebugging, VirtualRepeatAngularLibModule };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIuanMubWFwIiwic291cmNlcyI6WyJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXIudHMiLCJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCJcbmltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT3V0cHV0LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIGZyb21FdmVudCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc2tpcCwgZmlsdGVyLCB0YXAsIGRlbGF5LCB0YWtlLCBjb25jYXQsIG1hcCwgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5leHBvcnQgY29uc3QgU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQgPSAyMDA7IC8vIGluIG1pbGxpc2Vjb25kc1xuXG5jb25zdCBJTlZBTElEX1BPU0lUSU9OID0gLTE7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJywgXG4gICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgI2xpc3RDb250YWluZXIgW25nQ2xhc3NdPVwic2Nyb2xsYmFyU3R5bGVcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJcIiBbc3R5bGUuaGVpZ2h0XT1cImhvbGRlckhlaWdodEluUHhcIj5cclxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+XHJcbmAsXG4gICAgc3R5bGVzOiBbYC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJ7b3ZlcmZsb3cteTphdXRvO292ZXJmbG93LXg6aGlkZGVuO3Bvc2l0aW9uOnJlbGF0aXZlO2NvbnRhaW46bGF5b3V0Oy13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOnRvdWNofS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIgLmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci1ob2xkZXJ7d2lkdGg6MTAwJTtwb3NpdGlvbjpyZWxhdGl2ZX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLm5vcm1hbHt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIuaGlkZS1zY3JvbGxiYXJ7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjB9YF1cbn0pXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdENvbnRhaW5lciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSBfaG9sZGVySGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2NvbnRhaW5lcldpZHRoOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2NvbnRhaW5lckhlaWdodDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfc2Nyb2xsU3RhdGVDaGFuZ2U6IEJlaGF2aW9yU3ViamVjdDxTQ1JPTExfU1RBVEU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChTQ1JPTExfU1RBVEUuSURMRSk7XG4gICAgcHJpdmF0ZSBfc2Nyb2xsUG9zaXRpb246IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+ID0gbmV3IEJlaGF2aW9yU3ViamVjdCgwKTtcbiAgICBwcml2YXRlIF9zaXplQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyW10+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChbMCwgMF0pO1xuXG4gICAgcHJpdmF0ZSBpZ25vcmVTY3JvbGxFdmVudCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfaW5pdGlhbFNjcm9sbFRvcCA9IElOVkFMSURfUE9TSVRJT047XG5cbiAgICBjdXJyZW50U2Nyb2xsU3RhdGU6IFNDUk9MTF9TVEFURSA9IFNDUk9MTF9TVEFURS5JRExFO1xuXG4gICAgQFZpZXdDaGlsZCgnbGlzdENvbnRhaW5lcicpIGxpc3RDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgICBzY3JvbGxiYXJTdHlsZTogc3RyaW5nO1xuICAgIHNjcm9sbGJhcldpZHRoOiBudW1iZXI7XG5cbiAgICBzZXQgaG9sZGVySGVpZ2h0KGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5faG9sZGVySGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hvbGRlckhlaWdodCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXaGVuIGluaXRpYWxpemF0aW9uLCB0aGUgbGlzdC1ob2xkZXIgZG9lc24ndCBub3QgaGF2ZSBpdHMgaGVpZ2h0LiBTbyB0aGUgc2Nyb2xsVG9wIHNob3VsZCBiZSBkZWxheWVkIGZvciB3YWl0aW5nXG4gICAgICAgICAgICAvLyB0aGUgbGlzdC1ob2xkZXIgcmVuZGVyZWQgYmlnZ2VyIHRoYW4gdGhlIGxpc3QtY29udGFpbmVyLlxuICAgICAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgIT09IElOVkFMSURfUE9TSVRJT04gJiYgdGhpcy5faG9sZGVySGVpZ2h0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuX2luaXRpYWxTY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGhvbGRlckhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5faG9sZGVySGVpZ2h0O1xuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHRJblB4KCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLmhvbGRlckhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9sZGVySGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzEwMCUnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbCBzdGF0ZSBjaGFuZ2VcbiAgICAgKi9cbiAgICBnZXQgc2Nyb2xsU3RhdGVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxTQ1JPTExfU1RBVEU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKVxuICAgIGdldCBzY3JvbGxQb3NpdGlvbigpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsUG9zaXRpb24uYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbGlzdCBjb250YWluZXIgd2lkdGggYW5kIGhlaWdodC5cbiAgICAgKi9cbiAgICBnZXQgc2l6ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPG51bWJlcltdPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIEBJbnB1dCgpIHJvd0hlaWdodDogbnVtYmVyID0gMTAwO1xuXG4gICAgQElucHV0KClcbiAgICBzZXQgbmV3U2Nyb2xsUG9zaXRpb24ocDogbnVtYmVyKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwJywgcCk7XG4gICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHA7XG4gICAgICAgIC8vIGlmIGxpc3QtaG9sZGVyIGhhcyBubyBoZWlnaHQgYXQgdGhlIGNlcnRhaW4gdGltZS4gc2Nyb2xsVG9wIHdpbGwgbm90IGJlIHNldC5cbiAgICAgICAgaWYgKCF0aGlzLmhvbGRlckhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFRvcCA9IHA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVSVRpbWVsaW5lTWV0ZXIgaXMgb3B0aW9uYWwgaW5qZWN0aW9uLiB3aGVuIHRoaXMgY29tcG9uZW50IHVzZWQgaW5zaWRlIGEgVUlUaW1lbGluZU1ldGVyLlxuICAgICAqIGl0IGlzIHJlc3BvbnNpYmxlIHRvIHVwZGF0ZSB0aGUgc2Nyb2xsWVxuICAgICAqIEBwYXJhbSBfdGltZWxpbmVNZXRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnNjcm9sbGJhclN0eWxlID0gJ25vcm1hbCc7XG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSBnZXRTY3JvbGxCYXJXaWR0aCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsYmFyU3R5bGUgPT09ICdoaWRlLXNjcm9sbGJhcicpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnN0eWxlLnJpZ2h0ID0gKDAgLSB0aGlzLnNjcm9sbGJhcldpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSB0aGlzLnNjcm9sbGJhcldpZHRoICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIGZyb21FdmVudCh0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pZ25vcmVTY3JvbGxFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChzY3JvbGxZOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChzY3JvbGxZKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgLyp0aGlzLl9zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgdGhpcy5zY3JvbGxQb3NpdGlvblxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBza2lwKDEpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKHNjcm9sbFkpID0+IHtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICApOyovXG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUG9zaXRpb25cbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgdGFwKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLklETEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5TQ1JPTExJTkc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLlNDUk9MTElORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjcm9sbFN0YXRlID0gU0NST0xMX1NUQVRFLklETEU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIG1lYXN1cmUoKTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9IHtcbiAgICAgICAgaWYgKHRoaXMubGlzdENvbnRhaW5lciAmJiB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgLy8gbGV0IG1lYXN1cmVkV2lkdGggPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZEhlaWdodCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGxldCByZWN0ID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHJlY3Qud2lkdGggLSB0aGlzLnNjcm9sbGJhcldpZHRoO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4geyB3aWR0aDogdGhpcy5fY29udGFpbmVyV2lkdGgsIGhlaWdodDogdGhpcy5fY29udGFpbmVySGVpZ2h0IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuICAgIH1cblxuICAgIHJlcXVlc3RNZWFzdXJlKCkge1xuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLm1lYXN1cmUoKTtcbiAgICAgICAgdGhpcy5fc2l6ZUNoYW5nZS5uZXh0KFt3aWR0aCwgaGVpZ2h0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBTQ1JPTExfU1RBVEUge1xuICAgIFNDUk9MTElORyxcbiAgICBJRExFXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JvbGxCYXJXaWR0aCgpIHtcbiAgICBsZXQgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgaW5uZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICBpbm5lci5zdHlsZS5oZWlnaHQgPSBcIjIwMHB4XCI7XG5cbiAgICBsZXQgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdXRlci5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBvdXRlci5zdHlsZS50b3AgPSBcIjBweFwiO1xuICAgIG91dGVyLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgIG91dGVyLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLnN0eWxlLndpZHRoID0gXCIyMDBweFwiO1xuICAgIG91dGVyLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XG4gICAgbGV0IHcxID0gaW5uZXIub2Zmc2V0V2lkdGg7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSAnc2Nyb2xsJztcbiAgICBsZXQgdzIgPSBpbm5lci5vZmZzZXRXaWR0aDtcblxuICAgIGlmICh3MSA9PSB3Mikge1xuICAgICAgICB3MiA9IG91dGVyLmNsaWVudFdpZHRoO1xuICAgIH1cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3V0ZXIpO1xuXG4gICAgcmV0dXJuICh3MSAtIHcyKTtcbn1cblxuIiwiaW1wb3J0IHtcclxuICAgIERpcmVjdGl2ZSxcclxuICAgIERvQ2hlY2ssXHJcbiAgICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgICBJbnB1dCxcclxuICAgIGlzRGV2TW9kZSxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkLFxyXG4gICAgSXRlcmFibGVDaGFuZ2VzLFxyXG4gICAgSXRlcmFibGVEaWZmZXIsXHJcbiAgICBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICBOZ0l0ZXJhYmxlLFxyXG4gICAgT25DaGFuZ2VzLFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgT25Jbml0LFxyXG4gICAgU2ltcGxlQ2hhbmdlcyxcclxuICAgIFRlbXBsYXRlUmVmLFxyXG4gICAgVHJhY2tCeUZ1bmN0aW9uLFxyXG4gICAgVmlld0NvbnRhaW5lclJlZixcclxuICAgIFZpZXdSZWZcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbi8vaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZWN5Y2xlciB7XHJcbiAgICBwcml2YXRlIGxpbWl0OiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBfc2NyYXBWaWV3czogTWFwPG51bWJlciwgVmlld1JlZj4gPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgZ2V0Vmlldyhwb3NpdGlvbjogbnVtYmVyKTogVmlld1JlZiB8IG51bGwge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fc2NyYXBWaWV3cy5nZXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghdmlldyAmJiB0aGlzLl9zY3JhcFZpZXdzLnNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fc2NyYXBWaWV3cy5rZXlzKCkubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgICAgICB2aWV3ID0gdGhpcy5fc2NyYXBWaWV3cy5nZXQocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmlldykge1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmRlbGV0ZShwb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3IHx8IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjeWNsZVZpZXcocG9zaXRpb246IG51bWJlciwgdmlldzogVmlld1JlZikge1xyXG4gICAgICAgIHZpZXcuZGV0YWNoKCk7XHJcbiAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5zZXQocG9zaXRpb24sIHZpZXcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyYXAgdmlldyBjb3VudCBzaG91bGQgbm90IGV4Y2VlZCB0aGUgbnVtYmVyIG9mIGN1cnJlbnQgYXR0YWNoZWQgdmlld3MuXHJcbiAgICAgKi9cclxuICAgIHBydW5lU2NyYXBWaWV3cygpIHtcclxuICAgICAgICBpZiAodGhpcy5saW1pdCA8PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleUl0ZXJhdG9yID0gdGhpcy5fc2NyYXBWaWV3cy5rZXlzKCk7XHJcbiAgICAgICAgbGV0IGtleTogbnVtYmVyO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLl9zY3JhcFZpZXdzLnNpemUgPiB0aGlzLmxpbWl0KSB7XHJcbiAgICAgICAgICAgIGtleSA9IGtleUl0ZXJhdG9yLm5leHQoKS52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5nZXQoa2V5KS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZGVsZXRlKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFNjcmFwVmlld3NMaW1pdChsaW1pdDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5saW1pdCA9IGxpbWl0O1xyXG4gICAgICAgIHRoaXMucHJ1bmVTY3JhcFZpZXdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYW4oKSB7XHJcbiAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5mb3JFYWNoKCh2aWV3OiBWaWV3UmVmKSA9PiB7XHJcbiAgICAgICAgICAgIHZpZXcuZGVzdHJveSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3MuY2xlYXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEluZmluaXRlUm93IHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyAkaW1wbGljaXQ6IGFueSwgcHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBjb3VudDogbnVtYmVyKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4ID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsYXN0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXZlbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9kZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuZXZlbjtcclxuICAgIH1cclxufVxyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ1t2aXJ0dWFsUmVwZWF0XVt2aXJ0dWFsUmVwZWF0T2ZdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdDxUPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgRG9DaGVjaywgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICAgIHByaXZhdGUgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI8VD47XHJcbiAgICBwcml2YXRlIF90cmFja0J5Rm46IFRyYWNrQnlGdW5jdGlvbjxUPjtcclxuICAgIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JvbGwgb2Zmc2V0IG9mIHktYXhpcyBpbiBwaXhlbFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zY3JvbGxZOiBudW1iZXIgPSAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiBmaXJzdCB2aXNpYmxlIGl0ZW0gaW5kZXggaW4gY29sbGVjdGlvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9maXJzdEl0ZW1Qb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiBsYXN0IHZpc2libGUgaXRlbSBpbmRleCBpbiBjb2xsZWN0aW9uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2xhc3RJdGVtUG9zaXRpb246IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIF9jb250YWluZXJXaWR0aDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfY29udGFpbmVySGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGVuIHRoaXMgdmFsdWUgaXMgdHJ1ZSwgYSBmdWxsIGNsZWFuIGxheW91dCBpcyByZXF1aXJlZCwgZXZlcnkgZWxlbWVudCBtdXN0IGJlIHJlcG9zaXRpb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaW52YWxpZGF0ZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAvKipcclxuICAgICAqIHdoZW4gdGhpcyB2YWx1ZSBpcyB0cnVlLCBhIGxheW91dCBpcyBpbiBwcm9jZXNzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2lzSW5MYXlvdXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIF9pc0luTWVhc3VyZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgX3BlbmRpbmdNZWFzdXJlbWVudDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgX2NvbGxlY3Rpb246IGFueVtdO1xyXG5cclxuICAgIHByaXZhdGUgX3JlY3ljbGVyOiBSZWN5Y2xlciA9IG5ldyBSZWN5Y2xlcigpO1xyXG5cclxuICAgIEBJbnB1dCgpIHZpcnR1YWxSZXBlYXRPZjogTmdJdGVyYWJsZTxUPjtcclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IGluZmluaXRlRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGluZmluaXRlRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCBpbmZpbml0ZUZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxJbmZpbml0ZVJvdz4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlydHVhbFJlcGVhdENvbnRhaW5lcjogVmlydHVhbFJlcGVhdENvbnRhaW5lcixcclxuICAgICAgICBwcml2YXRlIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICAgICAgcHJpdmF0ZSBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPEluZmluaXRlUm93PixcclxuICAgICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG4gICAgICAgIGlmICgndmlydHVhbFJlcGVhdE9mJyBpbiBjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vIFJlYWN0IG9uIHZpcnR1YWxSZXBlYXRPZiBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjaGFuZ2VzWyd2aXJ0dWFsUmVwZWF0T2YnXS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fZGlmZmVyICYmIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMuX3RyYWNrQnlGbik7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0nIG9mIHR5cGUgJyR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdEb0NoZWNrKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9kaWZmZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMudmlydHVhbFJlcGVhdE9mKTtcclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxUPikge1xyXG4gICAgICAgIGlmICghdGhpcy5fY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKChpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxhbnk+LCBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBuZXcgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ25ldyBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGN1cnJlbnRJbmRleCwgMCwgaXRlbS5pdGVtKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZW1vdmUgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShhZGp1c3RlZFByZXZpb3VzSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbW92ZSBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbW92ZSBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShhZGp1c3RlZFByZXZpb3VzSW5kZXgsIDEpWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uW3JlY29yZC5jdXJyZW50SW5kZXhdID0gcmVjb3JkLml0ZW07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChpc01lYXN1cmVtZW50UmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZCh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnNjcm9sbFBvc2l0aW9uXHJcbiAgICAgICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgICAgICAgZmlsdGVyKChzY3JvbGxZKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKHNjcm9sbFkgLSB0aGlzLl9zY3JvbGxZKSA+PSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAgICAgICAgIChzY3JvbGxZKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsWSA9IHNjcm9sbFk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuc2l6ZUNoYW5nZS5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgIChbd2lkdGgsIGhlaWdodF0pID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzaXplQ2hhbmdlOiAnLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5jbGVhbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVxdWVzdE1lYXN1cmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5NZWFzdXJlIHx8IHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3BlbmRpbmdNZWFzdXJlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdNZWFzdXJlbWVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICAgICAgfSwgNjApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWVhc3VyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVxdWVzdExheW91dCgpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncmVxdWVzdExheW91dCcsIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0LCB0aGlzLl9jb250YWluZXJIZWlnaHQsIHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoKTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5NZWFzdXJlICYmIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGF5b3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbWVhc3VyZSgpIHtcclxuICAgICAgICBsZXQgY29sbGVjdGlvbk51bWJlciA9ICF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwID8gMCA6IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0ICogY29sbGVjdGlvbk51bWJlcjtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgYSBhcHByb3hpbWF0ZSBudW1iZXIgb2Ygd2hpY2ggYSB2aWV3IGNhbiBjb250YWluXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTY3JhcFZpZXdzTGltaXQoKTtcclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbGF5b3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ29uIGxheW91dCcpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSB0cnVlO1xyXG4gICAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIubWVhc3VyZSgpO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIGlmICghdGhpcy5fY29sbGVjdGlvbiB8fCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBkZXRhY2ggYWxsIHZpZXdzIHdpdGhvdXQgcmVjeWNsZSB0aGVtLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNoaWxkLmNvbnRleHQuaW5kZXggPCB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiB8fCBjaGlsZC5jb250ZXh0LmluZGV4ID4gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbiB8fCB0aGlzLl9pbnZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KGNoaWxkLmNvbnRleHQuaW5kZXgsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZpbmRQb3NpdGlvbkluUmFuZ2UoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgIC8vIGlmIChjaGlsZC5jb250ZXh0LmluZGV4IDwgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gfHwgY2hpbGQuY29udGV4dC5pbmRleCA+IHRoaXMuX2xhc3RJdGVtUG9zaXRpb24gfHwgdGhpcy5faW52YWxpZGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVjeWNsZXIucmVjeWNsZVZpZXcoY2hpbGQuY29udGV4dC5pbmRleCwgY2hpbGQpO1xyXG4gICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnNlcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTY3JhcFZpZXdzTGltaXQoKSB7XHJcbiAgICAgICAgbGV0IGxpbWl0ID0gdGhpcy5fY29udGFpbmVySGVpZ2h0IC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQgKyAyO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLnNldFNjcmFwVmlld3NMaW1pdChsaW1pdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnNlcnRWaWV3cygpIHtcclxuICAgICAgICBpZiAodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoMCk7XHJcbiAgICAgICAgICAgIGxldCBsYXN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RDaGlsZC5jb250ZXh0LmluZGV4IC0gMTsgaSA+PSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxhc3RDaGlsZC5jb250ZXh0LmluZGV4ICsgMTsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vbm9pbnNwZWN0aW9uIEpTTWV0aG9kQ2FuQmVTdGF0aWNcclxuICAgIHByaXZhdGUgYXBwbHlTdHlsZXModmlld0VsZW1lbnQ6IEhUTUxFbGVtZW50LCB5OiBudW1iZXIpIHtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoMCwgJHt5fXB4LCAwKWA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKDAsICR7eX1weCwgMClgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLndpZHRoID0gYCR7dGhpcy5fY29udGFpbmVyV2lkdGh9cHhgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLmhlaWdodCA9IGAke3RoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0fXB4YDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkaXNwYXRjaExheW91dChwb3NpdGlvbjogbnVtYmVyLCB2aWV3OiBWaWV3UmVmLCBhZGRCZWZvcmU6IGJvb2xlYW4pIHtcclxuICAgICAgICBsZXQgc3RhcnRQb3NZID0gcG9zaXRpb24gKiB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodDtcclxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKCh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4pLnJvb3ROb2Rlc1swXSwgc3RhcnRQb3NZKTtcclxuICAgICAgICBpZiAoYWRkQmVmb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHZpZXcsIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2aWV3LnJlYXR0YWNoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5kUG9zaXRpb25JblJhbmdlKCkge1xyXG4gICAgICAgIGxldCBzY3JvbGxZID0gdGhpcy5fc2Nyb2xsWTtcclxuICAgICAgICBsZXQgZmlyc3RQb3NpdGlvbiA9IE1hdGguZmxvb3Ioc2Nyb2xsWSAvIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0KTtcclxuICAgICAgICBsZXQgZmlyc3RQb3NpdGlvbk9mZnNldCA9IHNjcm9sbFkgLSBmaXJzdFBvc2l0aW9uICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQ7XHJcbiAgICAgICAgbGV0IGxhc3RQb3NpdGlvbiA9IE1hdGguY2VpbCgodGhpcy5fY29udGFpbmVySGVpZ2h0ICsgZmlyc3RQb3NpdGlvbk9mZnNldCkgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCkgKyBmaXJzdFBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uID0gTWF0aC5tYXgoZmlyc3RQb3NpdGlvbiAtIDEsIDApO1xyXG4gICAgICAgIHRoaXMuX2xhc3RJdGVtUG9zaXRpb24gPSBNYXRoLm1pbihsYXN0UG9zaXRpb24gKyAxLCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Vmlldyhwb3NpdGlvbjogbnVtYmVyKTogVmlld1JlZiB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSB0aGlzLl9yZWN5Y2xlci5nZXRWaWV3KHBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2NvbGxlY3Rpb25bcG9zaXRpb25dO1xyXG4gICAgICAgIGxldCBjb3VudCA9IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICB2aWV3ID0gdGhpcy5fdGVtcGxhdGUuY3JlYXRlRW1iZWRkZWRWaWV3KG5ldyBJbmZpbml0ZVJvdyhpdGVtLCBwb3NpdGlvbiwgY291bnQpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+KS5jb250ZXh0LiRpbXBsaWNpdCA9IGl0ZW07XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4pLmNvbnRleHQuaW5kZXggPSBwb3NpdGlvbjtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93PikuY29udGV4dC5jb3VudCA9IGNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh0eXBlOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHR5cGVbJ25hbWUnXSB8fCB0eXBlb2YgdHlwZTtcclxufVxyXG4iLCJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXQgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEJyb3dzZXJNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgVmlydHVhbFJlcGVhdENvbnRhaW5lcixcbiAgICBWaXJ0dWFsUmVwZWF0XG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxuICAgIFZpcnR1YWxSZXBlYXRcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0QW5ndWxhckxpYk1vZHVsZSB7IH1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSx1QkFJYSwwQkFBMEIsR0FBRyxHQUFHLENBQUM7QUFFOUMsdUJBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFZNUI7Ozs7O0lBMEZJOzZCQXpGZ0MsQ0FBQzsrQkFDQyxDQUFDO2dDQUNBLENBQUM7NkJBRUUsSUFBSSxZQUFZLEVBQUU7a0NBRUksSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQzsrQkFDL0MsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDOzJCQUN4QixJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQ0FFaEQsS0FBSztpQ0FFTCxnQkFBZ0I7a0NBRVQsWUFBWSxDQUFDLElBQUk7eUJBeUR2QixHQUFHO1FBbUI1QixJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLGlCQUFpQixFQUFFLENBQUM7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