import { Component, ViewChild, Output, Input, Directive, isDevMode, IterableDiffers, TemplateRef, ViewContainerRef, NgModule } from '@angular/core';
import { Subscription, BehaviorSubject, fromEvent } from 'rxjs';
import { filter, tap, map, debounceTime, first } from 'rxjs/operators';
import { __extends } from 'tslib';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatAsynch } from 'virtual-repeat-angular-lib/virtual-repeat-asynch';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var /** @type {?} */ SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
var /** @type {?} */ INVALID_POSITION = -1;
var VirtualRepeatContainer$1 = /** @class */ (function () {
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    function VirtualRepeatContainer$$1() {
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
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "holderHeight", {
        get: /**
         * @return {?}
         */
        function () {
            return this._holderHeight;
        },
        set: /**
         * @param {?} height
         * @return {?}
         */
        function (height) {
            var _this = this;
            if (typeof height !== 'undefined') {
                this._holderHeight = height;
                if (this._holderHeight === 0) {
                    this.listContainer.nativeElement.scrollTop = 0;
                }
                // When initialization, the list-holder doesn't not have its height. So the scrollTop should be delayed for waiting
                // the list-holder rendered bigger than the list-container.
                if (this._initialScrollTop !== INVALID_POSITION && this._holderHeight !== 0) {
                    setTimeout(function () {
                        _this.listContainer.nativeElement.scrollTop = _this._initialScrollTop;
                        _this._initialScrollTop = INVALID_POSITION;
                    });
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "holderHeightInPx", {
        get: /**
         * @return {?}
         */
        function () {
            if (this.holderHeight) {
                return this.holderHeight + 'px';
            }
            return '100%';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "scrollStateChange", {
        /**
         * scroll state change
         */
        get: /**
         * scroll state change
         * @return {?}
         */
        function () {
            return this._scrollStateChange.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "scrollPosition", {
        /**
         * current scroll position.
         */
        get: /**
         * current scroll position.
         * @return {?}
         */
        function () {
            return this._scrollPosition.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "sizeChange", {
        /**
         * list container width and height.
         */
        get: /**
         * list container width and height.
         * @return {?}
         */
        function () {
            return this._sizeChange.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "rowHeight", {
        set: /**
         * @param {?} rowHeight
         * @return {?}
         */
        function (rowHeight) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VirtualRepeatContainer$$1.prototype, "newScrollPosition", {
        set: /**
         * @param {?} p
         * @return {?}
         */
        function (p) {
            // console.log('p', p);
            this.listContainer.nativeElement.scrollTop = p;
            // if list-holder has no height at the certain time. scrollTop will not be set.
            if (!this.holderHeight) {
                this._initialScrollTop = p;
            }
            this._scrollPosition.next(p);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    VirtualRepeatContainer$$1.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.scrollbarStyle === 'hide-scrollbar') {
            this.listContainer.nativeElement.style.right = (0 - this.scrollbarWidth) + 'px';
            this.listContainer.nativeElement.style.paddingRight = this.scrollbarWidth + 'px';
        }
        if (window) {
            this._subscription.add(fromEvent(window, 'resize')
                .subscribe(function () {
                _this.requestMeasure();
            }));
        }
        this._subscription.add(fromEvent(this.listContainer.nativeElement, 'scroll')
            .pipe(filter(function () {
            if (_this.ignoreScrollEvent) {
                _this.ignoreScrollEvent = false;
                return false;
            }
            return true;
        }), map(function () {
            return _this.listContainer.nativeElement.scrollTop;
        }))
            .subscribe(function (scrollY) {
            _this._scrollPosition.next(scrollY);
        }));
        this._subscription.add(this.scrollPosition
            .pipe(tap(function () {
            if (_this.currentScrollState === SCROLL_STATE.IDLE) {
                _this.currentScrollState = SCROLL_STATE.SCROLLING;
                _this._scrollStateChange.next(_this.currentScrollState);
            }
        }), debounceTime(SCROLL_STOP_TIME_THRESHOLD))
            .subscribe(function () {
            if (_this.currentScrollState === SCROLL_STATE.SCROLLING) {
                _this.currentScrollState = SCROLL_STATE.IDLE;
                _this._scrollStateChange.next(_this.currentScrollState);
            }
        }));
        setTimeout(function () {
            _this.requestMeasure();
        });
    };
    /**
     * @return {?}
     */
    VirtualRepeatContainer$$1.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._subscription.unsubscribe();
    };
    /**
     * @return {?}
     */
    VirtualRepeatContainer$$1.prototype.measure = /**
     * @return {?}
     */
    function () {
        if (this.listContainer && this.listContainer.nativeElement) {
            // let measuredWidth = this.listContainer.nativeElement.clientWidth;
            // let measuredHeight = this.listContainer.nativeElement.clientHeight;
            var /** @type {?} */ rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return { width: this._containerWidth, height: this._containerHeight };
        }
        return { width: 0, height: 0 };
    };
    /**
     * @return {?}
     */
    VirtualRepeatContainer$$1.prototype.requestMeasure = /**
     * @return {?}
     */
    function () {
        var _a = this.measure(), width = _a.width, height = _a.height;
        this._sizeChange.next([width, height]);
    };
    VirtualRepeatContainer$$1.decorators = [
        { type: Component, args: [{
                    selector: 'gc-virtual-repeat-container',
                    template: "<div class=\"gc-virtual-repeat-container\" #listContainer [ngClass]=\"scrollbarStyle\">\n    <div class=\"gc-virtual-repeat-container\" [style.height]=\"holderHeightInPx\">\n        <ng-content></ng-content>\n    </div>\n</div>\n",
                    styles: [".gc-virtual-repeat-container{overflow-y:auto;overflow-x:hidden;position:relative;contain:layout;-webkit-overflow-scrolling:touch}.gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%;position:relative}.gc-virtual-repeat-container.normal{width:100%;height:100%}.gc-virtual-repeat-container.hide-scrollbar{position:absolute;top:0;left:0;bottom:0;right:0}"]
                },] },
    ];
    /** @nocollapse */
    VirtualRepeatContainer$$1.ctorParameters = function () { return []; };
    VirtualRepeatContainer$$1.propDecorators = {
        listContainer: [{ type: ViewChild, args: ['listContainer',] }],
        scrollPosition: [{ type: Output }],
        rowHeight: [{ type: Input }],
        newScrollPosition: [{ type: Input }]
    };
    return VirtualRepeatContainer$$1;
}());
/** @enum {number} */
var SCROLL_STATE = {
    SCROLLING: 0,
    IDLE: 1,
};
SCROLL_STATE[SCROLL_STATE.SCROLLING] = "SCROLLING";
SCROLL_STATE[SCROLL_STATE.IDLE] = "IDLE";
/**
 * @return {?}
 */
function getScrollBarWidth() {
    var /** @type {?} */ inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";
    var /** @type {?} */ outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var /** @type {?} */ w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var /** @type {?} */ w2 = inner.offsetWidth;
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
var VirtualRepeat = /** @class */ (function (_super) {
    __extends(VirtualRepeat, _super);
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
var VirtualRepeatAsynch$1 = /** @class */ (function (_super) {
    __extends(VirtualRepeatAsynch$$1, _super);
    function VirtualRepeatAsynch$$1(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
        return _super.call(this, _virtualRepeatContainer, _differs, _template, _viewContainerRef) || this;
    }
    Object.defineProperty(VirtualRepeatAsynch$$1.prototype, "virtualRepeatAsynchForTrackBy", {
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
    Object.defineProperty(VirtualRepeatAsynch$$1.prototype, "virtualRepeatAsynchForTemplate", {
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
    VirtualRepeatAsynch$$1.prototype.ngOnChanges = /**
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
    VirtualRepeatAsynch$$1.prototype.measure = /**
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
    VirtualRepeatAsynch$$1.prototype.layout = /**
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
    VirtualRepeatAsynch$$1.prototype.insertViews = /**
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
    VirtualRepeatAsynch$$1.prototype.getView = /**
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
    VirtualRepeatAsynch$$1.decorators = [
        { type: Directive, args: [{
                    selector: '[virtualRepeatAsynch]'
                },] },
    ];
    /** @nocollapse */
    VirtualRepeatAsynch$$1.ctorParameters = function () { return [
        { type: VirtualRepeatContainer$1 },
        { type: IterableDiffers },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ]; };
    VirtualRepeatAsynch$$1.propDecorators = {
        virtualRepeatAsynchOf: [{ type: Input }],
        virtualRepeatAsynchForTrackBy: [{ type: Input }],
        virtualRepeatAsynchForTemplate: [{ type: Input }]
    };
    return VirtualRepeatAsynch$$1;
}(VirtualRepeatBase));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var VirtualRepeatAngularLibModule = /** @class */ (function () {
    function VirtualRepeatAngularLibModule() {
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
    return VirtualRepeatAngularLibModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { SCROLL_STOP_TIME_THRESHOLD, VirtualRepeatContainer$1 as VirtualRepeatContainer, SCROLL_STATE, getScrollBarWidth, VirtualRepeat, getTypeNameForDebugging, VirtualRepeatAsynch$1 as VirtualRepeatAsynch, VirtualRepeatAngularLibModule };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIuanMubWFwIiwic291cmNlcyI6WyJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXIudHMiLCJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFzeW5jaC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCJcbmltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT3V0cHV0LCBJbnB1dCwgU2ltcGxlQ2hhbmdlcywgT25DaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24sIEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgZnJvbUV2ZW50IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBza2lwLCBmaWx0ZXIsIHRhcCwgZGVsYXksIHRha2UsIGNvbmNhdCwgbWFwLCBkZWJvdW5jZVRpbWUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBTQ1JPTExfU1RPUF9USU1FX1RIUkVTSE9MRCA9IDIwMDsgLy8gaW4gbWlsbGlzZWNvbmRzXG5cbmNvbnN0IElOVkFMSURfUE9TSVRJT04gPSAtMTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXInLFxuICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lclwiICNsaXN0Q29udGFpbmVyIFtuZ0NsYXNzXT1cInNjcm9sbGJhclN0eWxlXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgW3N0eWxlLmhlaWdodF09XCJob2xkZXJIZWlnaHRJblB4XCI+XHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgPC9kaXY+XHJcbjwvZGl2PlxyXG5gLFxuICAgIHN0eWxlczogW2AuZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVye292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjtwb3NpdGlvbjpyZWxhdGl2ZTtjb250YWluOmxheW91dDstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyIC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXItaG9sZGVye3dpZHRoOjEwMCU7cG9zaXRpb246cmVsYXRpdmV9LmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci5ub3JtYWx7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmhpZGUtc2Nyb2xsYmFye3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowfWBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRDb250YWluZXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHByaXZhdGUgX2hvbGRlckhlaWdodDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJXaWR0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJIZWlnaHQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICAgIHByaXZhdGUgX3Njcm9sbFN0YXRlQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8U0NST0xMX1NUQVRFPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoU0NST0xMX1NUQVRFLklETEUpO1xuICAgIHByaXZhdGUgX3Njcm9sbFBvc2l0aW9uOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoMCk7XG4gICAgcHJpdmF0ZSBfc2l6ZUNoYW5nZTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcltdPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoWzAsIDBdKTtcblxuICAgIHByaXZhdGUgaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuXG4gICAgY3VycmVudFNjcm9sbFN0YXRlOiBTQ1JPTExfU1RBVEUgPSBTQ1JPTExfU1RBVEUuSURMRTtcblxuICAgIEBWaWV3Q2hpbGQoJ2xpc3RDb250YWluZXInKSBsaXN0Q29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gICAgc2Nyb2xsYmFyU3R5bGU6IHN0cmluZztcbiAgICBzY3JvbGxiYXJXaWR0aDogbnVtYmVyO1xuXG4gICAgc2V0IGhvbGRlckhlaWdodChoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBpZiAodHlwZW9mIGhlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvbGRlckhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ob2xkZXJIZWlnaHQgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2hlbiBpbml0aWFsaXphdGlvbiwgdGhlIGxpc3QtaG9sZGVyIGRvZXNuJ3Qgbm90IGhhdmUgaXRzIGhlaWdodC4gU28gdGhlIHNjcm9sbFRvcCBzaG91bGQgYmUgZGVsYXllZCBmb3Igd2FpdGluZ1xuICAgICAgICAgICAgLy8gdGhlIGxpc3QtaG9sZGVyIHJlbmRlcmVkIGJpZ2dlciB0aGFuIHRoZSBsaXN0LWNvbnRhaW5lci5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pbml0aWFsU2Nyb2xsVG9wICE9PSBJTlZBTElEX1BPU0lUSU9OICYmIHRoaXMuX2hvbGRlckhlaWdodCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wID0gSU5WQUxJRF9QT1NJVElPTjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvbGRlckhlaWdodDtcbiAgICB9XG5cbiAgICBnZXQgaG9sZGVySGVpZ2h0SW5QeCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhvbGRlckhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcxMDAlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGwgc3RhdGUgY2hhbmdlXG4gICAgICovXG4gICAgZ2V0IHNjcm9sbFN0YXRlQ2hhbmdlKCk6IE9ic2VydmFibGU8U0NST0xMX1NUQVRFPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxTdGF0ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KClcbiAgICBnZXQgc2Nyb2xsUG9zaXRpb24oKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBvc2l0aW9uLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxpc3QgY29udGFpbmVyIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICovXG4gICAgZ2V0IHNpemVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxudW1iZXJbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBASW5wdXQoKSBzZXQgcm93SGVpZ2h0KHJvd0hlaWdodDogc3RyaW5nKSB7XG4gICAgICAgIGlmKHJvd0hlaWdodCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChyb3dIZWlnaHQgIT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yb3dIZWlnaHQgPSBOdW1iZXIocm93SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSB0aGlzLl9hdXRvSGVpZ2h0ID0gIGZhbHNlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodEF1dG9Db21wdXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9IZWlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSBcblxuICAgIF9yb3dIZWlnaHQ6IG51bWJlciA9IDEwMDtcbiAgICBfYXV0b0hlaWdodDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIF9oZWlnaHRBdXRvQ29tcHV0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IG5ld1Njcm9sbFBvc2l0aW9uKHA6IG51bWJlcikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncCcsIHApO1xuICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSBwO1xuICAgICAgICAvLyBpZiBsaXN0LWhvbGRlciBoYXMgbm8gaGVpZ2h0IGF0IHRoZSBjZXJ0YWluIHRpbWUuIHNjcm9sbFRvcCB3aWxsIG5vdCBiZSBzZXQuXG4gICAgICAgIGlmICghdGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQocCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVUlUaW1lbGluZU1ldGVyIGlzIG9wdGlvbmFsIGluamVjdGlvbi4gd2hlbiB0aGlzIGNvbXBvbmVudCB1c2VkIGluc2lkZSBhIFVJVGltZWxpbmVNZXRlci5cbiAgICAgKiBpdCBpcyByZXNwb25zaWJsZSB0byB1cGRhdGUgdGhlIHNjcm9sbFlcbiAgICAgKiBAcGFyYW0gX3RpbWVsaW5lTWV0ZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJTdHlsZSA9ICdub3JtYWwnO1xuICAgICAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gZ2V0U2Nyb2xsQmFyV2lkdGgoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbGJhclN0eWxlID09PSAnaGlkZS1zY3JvbGxiYXInKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5yaWdodCA9ICgwIC0gdGhpcy5zY3JvbGxiYXJXaWR0aCkgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gdGhpcy5zY3JvbGxiYXJXaWR0aCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdzY3JvbGwnKVxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlnbm9yZVNjcm9sbEV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoc2Nyb2xsWTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQoc2Nyb2xsWSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFBvc2l0aW9uXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5JRExFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPSBTQ1JPTExfU1RBVEUuU0NST0xMSU5HO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKFNDUk9MTF9TVE9QX1RJTUVfVEhSRVNIT0xEKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5TQ1JPTExJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5JRExFO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICBtZWFzdXJlKCk6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RDb250YWluZXIgJiYgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZFdpZHRoID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAvLyBsZXQgbWVhc3VyZWRIZWlnaHQgPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBsZXQgcmVjdCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSByZWN0LndpZHRoIC0gdGhpcy5zY3JvbGxiYXJXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgcmV0dXJuIHsgd2lkdGg6IHRoaXMuX2NvbnRhaW5lcldpZHRoLCBoZWlnaHQ6IHRoaXMuX2NvbnRhaW5lckhlaWdodCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB9XG5cbiAgICByZXF1ZXN0TWVhc3VyZSgpIHtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5tZWFzdXJlKCk7XG4gICAgICAgIHRoaXMuX3NpemVDaGFuZ2UubmV4dChbd2lkdGgsIGhlaWdodF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0NST0xMX1NUQVRFIHtcbiAgICBTQ1JPTExJTkcsXG4gICAgSURMRVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Nyb2xsQmFyV2lkdGgoKSB7XG4gICAgbGV0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgaW5uZXIuc3R5bGUuaGVpZ2h0ID0gXCIyMDBweFwiO1xuXG4gICAgbGV0IG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3V0ZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgb3V0ZXIuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMjAwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5oZWlnaHQgPSBcIjE1MHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xuICAgIGxldCB3MSA9IGlubmVyLm9mZnNldFdpZHRoO1xuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XG4gICAgbGV0IHcyID0gaW5uZXIub2Zmc2V0V2lkdGg7XG5cbiAgICBpZiAodzEgPT0gdzIpIHtcbiAgICAgICAgdzIgPSBvdXRlci5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcblxuICAgIHJldHVybiAodzEgLSB3Mik7XG59XG5cbiIsImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBEb0NoZWNrLFxyXG4gICAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gICAgSW5wdXQsXHJcbiAgICBpc0Rldk1vZGUsXHJcbiAgICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlcyxcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLy9pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWInO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdFJvdywgVmlydHVhbFJlcGVhdEJhc2UgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC5iYXNlJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0PFQ+IGV4dGVuZHMgVmlydHVhbFJlcGVhdEJhc2U8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcml2YXRlIF9jb2xsZWN0aW9uOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0T2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0Rm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpcnR1YWxSZXBlYXRGb3JUcmFja0J5KCk6IFRyYWNrQnlGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlGbjtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgICAgICBfdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+LFxyXG4gICAgICAgIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICAgICAgc3VwZXIoX3ZpcnR1YWxSZXBlYXRDb250YWluZXIsIF9kaWZmZXJzLCBfdGVtcGxhdGUsIF92aWV3Q29udGFpbmVyUmVmKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCd2aXJ0dWFsUmVwZWF0T2YnIGluIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy8gUmVhY3Qgb24gdmlydHVhbFJlcGVhdE9mIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoYW5nZXNbJ3ZpcnR1YWxSZXBlYXRPZiddLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5fdHJhY2tCeUZuKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0RvQ2hlY2soKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpZmZlcikge1xyXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy52aXJ0dWFsUmVwZWF0T2YpO1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseUNoYW5nZXMoY2hhbmdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseUNoYW5nZXMoY2hhbmdlczogSXRlcmFibGVDaGFuZ2VzPFQ+KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oKGl0ZW06IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4sIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLCBjdXJyZW50SW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIG5ldyBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbmV3IGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCBpdGVtLml0ZW0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbW92ZSBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZlIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSlbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uW3JlY29yZC5jdXJyZW50SW5kZXhdID0gcmVjb3JkLml0ZW07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChpc01lYXN1cmVtZW50UmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuY2xlYW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbWVhc3VyZSgpIHtcclxuICAgICAgICBsZXQgY29sbGVjdGlvbk51bWJlciA9ICF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwID8gMCA6IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodCAqIGNvbGxlY3Rpb25OdW1iZXI7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCk7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbGF5b3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IHRydWU7XHJcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5tZWFzdXJlKCk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uIHx8IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgdmlld3Mgd2l0aG91dCByZWN5Y2xlIHRoZW0uXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZmluZFBvc2l0aW9uSW5SYW5nZSh0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKGkpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgIGktLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnNlcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluc2VydFZpZXdzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RDaGlsZC5jb250ZXh0LmluZGV4IC0gMTsgaSA+PSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxhc3RDaGlsZC5jb250ZXh0LmluZGV4ICsgMTsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaExheW91dChpLCB2aWV3LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRWaWV3KHBvc2l0aW9uOiBudW1iZXIpOiBWaWV3UmVmIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3JlY3ljbGVyLmdldFZpZXcocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5fY29sbGVjdGlvbltwb3NpdGlvbl07XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLl90ZW1wbGF0ZS5jcmVhdGVFbWJlZGRlZFZpZXcobmV3IFZpcnR1YWxSZXBlYXRSb3coaXRlbSwgcG9zaXRpb24sIGNvdW50KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LiRpbXBsaWNpdCA9IGl0ZW07XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5pbmRleCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuY291bnQgPSBjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIERpcmVjdGl2ZSxcclxuICAgIEVtYmVkZGVkVmlld1JlZixcclxuICAgIElucHV0LFxyXG4gICAgaXNEZXZNb2RlLFxyXG4gICAgSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgTmdJdGVyYWJsZSxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIE9uRGVzdHJveSxcclxuICAgIE9uSW5pdCxcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIFRyYWNrQnlGdW5jdGlvbixcclxuICAgIFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IG1hcCwgZmlyc3QgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xyXG4vL2ltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYic7XHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRSb3csIFZpcnR1YWxSZXBlYXRCYXNlIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQuYmFzZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElBc3luY2hDb2xsZWN0aW9uIHtcclxuICAgIGdldExlbmd0aCgpOiBPYnNlcnZhYmxlPG51bWJlcj47XHJcbiAgICBnZXRJdGVtKGk6IG51bWJlcik6IE9ic2VydmFibGU8YW55PjtcclxufVxyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ1t2aXJ0dWFsUmVwZWF0QXN5bmNoXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRBc3luY2g8VD4gZXh0ZW5kcyBWaXJ0dWFsUmVwZWF0QmFzZTxUPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICAgIHByb3RlY3RlZCBfY29sbGVjdGlvbjogSUFzeW5jaENvbGxlY3Rpb247XHJcblxyXG4gICAgQElucHV0KCkgdmlydHVhbFJlcGVhdEFzeW5jaE9mOiBOZ0l0ZXJhYmxlPFQ+O1xyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyOiBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxyXG4gICAgICAgIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICAgICAgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcclxuICAgICAgICBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgICAgIHN1cGVyKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLCBfZGlmZmVycywgX3RlbXBsYXRlLCBfdmlld0NvbnRhaW5lclJlZilcclxuICAgIH1cclxuXHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG4gICAgICAgIGlmICgndmlydHVhbFJlcGVhdEFzeW5jaE9mJyBpbiBjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vIFJlYWN0IG9uIHZpcnR1YWxSZXBlYXRBc3luY2hPZiBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjaGFuZ2VzWyd2aXJ0dWFsUmVwZWF0QXN5bmNoT2YnXS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2hlaWdodEF1dG9Db21wdXRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgbWVhc3VyZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uZ2V0TGVuZ3RoKCkucGlwZShmaXJzdCgpKS5zdWJzY3JpYmUoKGxlbmd0aCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX3Jvd0hlaWdodCAqIGxlbmd0aDtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVNjcmFwVmlld3NMaW1pdCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGxheW91dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdvbiBsYXlvdXQnKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gdHJ1ZTtcclxuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLm1lYXN1cmUoKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgLy8gZGV0YWNoIGFsbCB2aWV3cyB3aXRob3V0IHJlY3ljbGUgdGhlbS5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV0YWNoQWxsVmlld3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5nZXRMZW5ndGgoKS5waXBlKGZpcnN0KCkpLnN1YnNjcmliZSgobGVuZ3RoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChsZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV0YWNoQWxsVmlld3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmZpbmRQb3NpdGlvbkluUmFuZ2UobGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKGNoaWxkLmNvbnRleHQuaW5kZXggPCB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiB8fCBjaGlsZC5jb250ZXh0LmluZGV4ID4gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbiB8fCB0aGlzLl9pbnZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KGNoaWxkLmNvbnRleHQuaW5kZXgsIGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmluc2VydFZpZXdzKGxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaW5zZXJ0Vmlld3MoY29sbGVjdGlvbl9sZW5ndGg6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RDaGlsZC5jb250ZXh0LmluZGV4IC0gMTsgaSA+PSB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbjsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGgsIGkpLnN1YnNjcmliZSgodmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbGFzdENoaWxkLmNvbnRleHQuaW5kZXggKyAxOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGgsIGkpLnN1YnNjcmliZSgodmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGgsIGkpLnN1YnNjcmliZSgodmlldykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldFZpZXcoY29sbGVjdGlvbl9sZW5ndGg6IG51bWJlciwgcG9zaXRpb246IG51bWJlcik6IE9ic2VydmFibGU8Vmlld1JlZj4ge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fcmVjeWNsZXIuZ2V0Vmlldyhwb3NpdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZ2V0SXRlbShwb3NpdGlvbilcclxuICAgICAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICAgICAgICBmaXJzdCgpLFxyXG4gICAgICAgICAgICAgICAgbWFwKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSB0aGlzLl90ZW1wbGF0ZS5jcmVhdGVFbWJlZGRlZFZpZXcobmV3IFZpcnR1YWxSZXBlYXRSb3coaXRlbSwgcG9zaXRpb24sIGNvbGxlY3Rpb25fbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LiRpbXBsaWNpdCA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC5pbmRleCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuY291bnQgPSBjb2xsZWN0aW9uX2xlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXQgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0JztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRBc3luY2ggfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi92aXJ0dWFsLXJlcGVhdC1hc3luY2gnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQnJvd3Nlck1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxuICAgIFZpcnR1YWxSZXBlYXQsXG4gICAgVmlydHVhbFJlcGVhdEFzeW5jaFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgVmlydHVhbFJlcGVhdENvbnRhaW5lcixcbiAgICBWaXJ0dWFsUmVwZWF0LFxuICAgIFZpcnR1YWxSZXBlYXRBc3luY2hcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0QW5ndWxhckxpYk1vZHVsZSB7IH1cbiJdLCJuYW1lcyI6WyJWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIiwidHNsaWJfMS5fX2V4dGVuZHMiLCJWaXJ0dWFsUmVwZWF0QXN5bmNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0EscUJBSWEsMEJBQTBCLEdBQUcsR0FBRyxDQUFDO0FBRTlDLHFCQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0lBcUh4Qjs2QkF4R2dDLENBQUM7K0JBQ0MsQ0FBQztnQ0FDQSxDQUFDOzZCQUVFLElBQUksWUFBWSxFQUFFO2tDQUVJLElBQUksZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7K0JBQy9DLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQzsyQkFDeEIsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUNBRWhELEtBQUs7aUNBRUwsZ0JBQWdCO2tDQUVULFlBQVksQ0FBQyxJQUFJOzBCQXNFL0IsR0FBRzsyQkFDRCxLQUFLO21DQUNHLEtBQUs7UUFtQmhDLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztLQUM3QztJQXRGRCxzQkFBSUEsbURBQVk7Ozs7UUFp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