(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define('virtual-repeat-angular-lib', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/platform-browser'], factory) :
    (factory((global['virtual-repeat-angular-lib'] = {}),global.ng.core,global.rxjs,global.rxjs.operators,global.ng.platformBrowser));
}(this, (function (exports,core,rxjs,operators,platformBrowser) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var /** @type {?} */ SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
    var /** @type {?} */ INVALID_POSITION = -1;
    var VirtualRepeatContainer = (function () {
        /**
         * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
         * it is responsible to update the scrollY
         * @param _timelineMeter
         */
        function VirtualRepeatContainer() {
            this._holderHeight = 0;
            this._containerWidth = 0;
            this._containerHeight = 0;
            this._subscription = new rxjs.Subscription();
            this._scrollStateChange = new rxjs.BehaviorSubject(SCROLL_STATE.IDLE);
            this._scrollPosition = new rxjs.BehaviorSubject(0);
            this._sizeChange = new rxjs.BehaviorSubject([0, 0]);
            this.ignoreScrollEvent = false;
            this._initialScrollTop = INVALID_POSITION;
            this.currentScrollState = SCROLL_STATE.IDLE;
            this.rowHeight = 100;
            this.scrollbarStyle = 'normal';
            this.scrollbarWidth = getScrollBarWidth();
        }
        Object.defineProperty(VirtualRepeatContainer.prototype, "holderHeight", {
            get: /**
             * @return {?}
             */ function () {
                return this._holderHeight;
            },
            set: /**
             * @param {?} height
             * @return {?}
             */ function (height) {
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
        Object.defineProperty(VirtualRepeatContainer.prototype, "holderHeightInPx", {
            get: /**
             * @return {?}
             */ function () {
                if (this.holderHeight) {
                    return this.holderHeight + 'px';
                }
                return '100%';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualRepeatContainer.prototype, "scrollStateChange", {
            /**
             * scroll state change
             */
            get: /**
             * scroll state change
             * @return {?}
             */ function () {
                return this._scrollStateChange.asObservable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualRepeatContainer.prototype, "scrollPosition", {
            /**
             * current scroll position.
             */
            get: /**
             * current scroll position.
             * @return {?}
             */ function () {
                return this._scrollPosition.asObservable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualRepeatContainer.prototype, "sizeChange", {
            /**
             * list container width and height.
             */
            get: /**
             * list container width and height.
             * @return {?}
             */ function () {
                return this._sizeChange.asObservable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualRepeatContainer.prototype, "newScrollPosition", {
            set: /**
             * @param {?} p
             * @return {?}
             */ function (p) {
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
        VirtualRepeatContainer.prototype.ngAfterViewInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (this.scrollbarStyle === 'hide-scrollbar') {
                    this.listContainer.nativeElement.style.right = (0 - this.scrollbarWidth) + 'px';
                    this.listContainer.nativeElement.style.paddingRight = this.scrollbarWidth + 'px';
                }
                if (window) {
                    this._subscription.add(rxjs.fromEvent(window, 'resize')
                        .subscribe(function () {
                        _this.requestMeasure();
                    }));
                }
                this._subscription.add(rxjs.fromEvent(this.listContainer.nativeElement, 'scroll')
                    .pipe(operators.filter(function () {
                    if (_this.ignoreScrollEvent) {
                        _this.ignoreScrollEvent = false;
                        return false;
                    }
                    return true;
                }), operators.map(function () {
                    return _this.listContainer.nativeElement.scrollTop;
                }))
                    .subscribe(function (scrollY) {
                    _this._scrollPosition.next(scrollY);
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
                    .pipe(operators.tap(function () {
                    if (_this.currentScrollState === SCROLL_STATE.IDLE) {
                        _this.currentScrollState = SCROLL_STATE.SCROLLING;
                        _this._scrollStateChange.next(_this.currentScrollState);
                    }
                }), operators.debounceTime(SCROLL_STOP_TIME_THRESHOLD))
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
        VirtualRepeatContainer.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this._subscription.unsubscribe();
            };
        /**
         * @return {?}
         */
        VirtualRepeatContainer.prototype.measure = /**
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
        VirtualRepeatContainer.prototype.requestMeasure = /**
         * @return {?}
         */
            function () {
                var _a = this.measure(), width = _a.width, height = _a.height;
                this._sizeChange.next([width, height]);
            };
        VirtualRepeatContainer.decorators = [
            { type: core.Component, args: [{
                        selector: 'gc-virtual-repeat-container',
                        template: "<div class=\"gc-virtual-repeat-container\" #listContainer [ngClass]=\"scrollbarStyle\">\n    <div class=\"gc-virtual-repeat-container\" [style.height]=\"holderHeightInPx\">\n        <ng-content></ng-content>\n    </div>\n</div>\n",
                        styles: [".gc-virtual-repeat-container{overflow-y:auto;overflow-x:hidden;position:relative;contain:layout;-webkit-overflow-scrolling:touch}.gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%;position:relative}.gc-virtual-repeat-container.normal{width:100%;height:100%}.gc-virtual-repeat-container.hide-scrollbar{position:absolute;top:0;left:0;bottom:0;right:0}"]
                    },] },
        ];
        /** @nocollapse */
        VirtualRepeatContainer.ctorParameters = function () { return []; };
        VirtualRepeatContainer.propDecorators = {
            listContainer: [{ type: core.ViewChild, args: ['listContainer',] }],
            scrollPosition: [{ type: core.Output }],
            rowHeight: [{ type: core.Input }],
            newScrollPosition: [{ type: core.Input }]
        };
        return VirtualRepeatContainer;
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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var Recycler = (function () {
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
    var InfiniteRow = (function () {
        function InfiniteRow($implicit, index, count) {
            this.$implicit = $implicit;
            this.index = index;
            this.count = count;
        }
        Object.defineProperty(InfiniteRow.prototype, "first", {
            get: /**
             * @return {?}
             */ function () {
                return this.index === 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InfiniteRow.prototype, "last", {
            get: /**
             * @return {?}
             */ function () {
                return this.index === this.count - 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InfiniteRow.prototype, "even", {
            get: /**
             * @return {?}
             */ function () {
                return this.index % 2 === 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InfiniteRow.prototype, "odd", {
            get: /**
             * @return {?}
             */ function () {
                return !this.even;
            },
            enumerable: true,
            configurable: true
        });
        return InfiniteRow;
    }());
    /**
     * @template T
     */
    var VirtualRepeat = (function () {
        function VirtualRepeat(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
            this._virtualRepeatContainer = _virtualRepeatContainer;
            this._differs = _differs;
            this._template = _template;
            this._viewContainerRef = _viewContainerRef;
            this._subscription = new rxjs.Subscription();
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
             */ function () {
                return this._trackByFn;
            },
            set: /**
             * @param {?} fn
             * @return {?}
             */ function (fn) {
                if (core.isDevMode() && fn != null && typeof fn !== 'function') {
                    if ((console) && /** @type {?} */ (console.warn)) {
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
             */ function (value) {
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
                        catch (e) {
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
                    .pipe(operators.filter(function (scrollY) {
                    return Math.abs(scrollY - _this._scrollY) >= _this._virtualRepeatContainer.rowHeight;
                }))
                    .subscribe(function (scrollY) {
                    _this._scrollY = scrollY;
                    _this.requestLayout();
                }));
                this._subscription.add(this._virtualRepeatContainer.sizeChange.subscribe(function (_a) {
                    var _b = __read(_a, 2), width = _b[0], height = _b[1];
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
                        var /** @type {?} */ child = (this._viewContainerRef.get(i));
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
                    var /** @type {?} */ child = (this._viewContainerRef.get(i));
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
                    var /** @type {?} */ firstChild = (this._viewContainerRef.get(0));
                    var /** @type {?} */ lastChild = (this._viewContainerRef.get(this._viewContainerRef.length - 1));
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
                this.applyStyles(((view)).rootNodes[0], startPosY);
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
                    ((view)).context.$implicit = item;
                    ((view)).context.index = position;
                    ((view)).context.count = count;
                }
                return view;
            };
        VirtualRepeat.decorators = [
            { type: core.Directive, args: [{
                        selector: '[virtualRepeat][virtualRepeatOf]'
                    },] },
        ];
        /** @nocollapse */
        VirtualRepeat.ctorParameters = function () {
            return [
                { type: VirtualRepeatContainer },
                { type: core.IterableDiffers },
                { type: core.TemplateRef },
                { type: core.ViewContainerRef }
            ];
        };
        VirtualRepeat.propDecorators = {
            virtualRepeatOf: [{ type: core.Input }],
            infiniteForTrackBy: [{ type: core.Input }],
            infiniteForTemplate: [{ type: core.Input }]
        };
        return VirtualRepeat;
    }());
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
    var VirtualRepeatAngularLibModule = (function () {
        function VirtualRepeatAngularLibModule() {
        }
        VirtualRepeatAngularLibModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [
                            platformBrowser.BrowserModule
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

    exports.SCROLL_STOP_TIME_THRESHOLD = SCROLL_STOP_TIME_THRESHOLD;
    exports.VirtualRepeatContainer = VirtualRepeatContainer;
    exports.SCROLL_STATE = SCROLL_STATE;
    exports.getScrollBarWidth = getScrollBarWidth;
    exports.Recycler = Recycler;
    exports.InfiniteRow = InfiniteRow;
    exports.VirtualRepeat = VirtualRepeat;
    exports.getTypeNameForDebugging = getTypeNameForDebugging;
    exports.VirtualRepeatAngularLibModule = VirtualRepeatAngularLibModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi9saWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLnRzIixudWxsLCJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCJcbmltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT3V0cHV0LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIGZyb21FdmVudCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc2tpcCwgZmlsdGVyLCB0YXAsIGRlbGF5LCB0YWtlLCBjb25jYXQsIG1hcCwgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5leHBvcnQgY29uc3QgU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQgPSAyMDA7IC8vIGluIG1pbGxpc2Vjb25kc1xuXG5jb25zdCBJTlZBTElEX1BPU0lUSU9OID0gLTE7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJywgXG4gICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgI2xpc3RDb250YWluZXIgW25nQ2xhc3NdPVwic2Nyb2xsYmFyU3R5bGVcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJcIiBbc3R5bGUuaGVpZ2h0XT1cImhvbGRlckhlaWdodEluUHhcIj5cclxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+XHJcbmAsXG4gICAgc3R5bGVzOiBbYC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXJ7b3ZlcmZsb3cteTphdXRvO292ZXJmbG93LXg6aGlkZGVuO3Bvc2l0aW9uOnJlbGF0aXZlO2NvbnRhaW46bGF5b3V0Oy13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOnRvdWNofS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIgLmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci1ob2xkZXJ7d2lkdGg6MTAwJTtwb3NpdGlvbjpyZWxhdGl2ZX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLm5vcm1hbHt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfS5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXIuaGlkZS1zY3JvbGxiYXJ7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjB9YF1cbn0pXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdENvbnRhaW5lciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSBfaG9sZGVySGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2NvbnRhaW5lcldpZHRoOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2NvbnRhaW5lckhlaWdodDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfc2Nyb2xsU3RhdGVDaGFuZ2U6IEJlaGF2aW9yU3ViamVjdDxTQ1JPTExfU1RBVEU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChTQ1JPTExfU1RBVEUuSURMRSk7XG4gICAgcHJpdmF0ZSBfc2Nyb2xsUG9zaXRpb246IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+ID0gbmV3IEJlaGF2aW9yU3ViamVjdCgwKTtcbiAgICBwcml2YXRlIF9zaXplQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyW10+ID0gbmV3IEJlaGF2aW9yU3ViamVjdChbMCwgMF0pO1xuXG4gICAgcHJpdmF0ZSBpZ25vcmVTY3JvbGxFdmVudCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfaW5pdGlhbFNjcm9sbFRvcCA9IElOVkFMSURfUE9TSVRJT047XG5cbiAgICBjdXJyZW50U2Nyb2xsU3RhdGU6IFNDUk9MTF9TVEFURSA9IFNDUk9MTF9TVEFURS5JRExFO1xuXG4gICAgQFZpZXdDaGlsZCgnbGlzdENvbnRhaW5lcicpIGxpc3RDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgICBzY3JvbGxiYXJTdHlsZTogc3RyaW5nO1xuICAgIHNjcm9sbGJhcldpZHRoOiBudW1iZXI7XG5cbiAgICBzZXQgaG9sZGVySGVpZ2h0KGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5faG9sZGVySGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2hvbGRlckhlaWdodCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXaGVuIGluaXRpYWxpemF0aW9uLCB0aGUgbGlzdC1ob2xkZXIgZG9lc24ndCBub3QgaGF2ZSBpdHMgaGVpZ2h0LiBTbyB0aGUgc2Nyb2xsVG9wIHNob3VsZCBiZSBkZWxheWVkIGZvciB3YWl0aW5nXG4gICAgICAgICAgICAvLyB0aGUgbGlzdC1ob2xkZXIgcmVuZGVyZWQgYmlnZ2VyIHRoYW4gdGhlIGxpc3QtY29udGFpbmVyLlxuICAgICAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgIT09IElOVkFMSURfUE9TSVRJT04gJiYgdGhpcy5faG9sZGVySGVpZ2h0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHRoaXMuX2luaXRpYWxTY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGhvbGRlckhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5faG9sZGVySGVpZ2h0O1xuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHRJblB4KCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLmhvbGRlckhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9sZGVySGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzEwMCUnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbCBzdGF0ZSBjaGFuZ2VcbiAgICAgKi9cbiAgICBnZXQgc2Nyb2xsU3RhdGVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxTQ1JPTExfU1RBVEU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKVxuICAgIGdldCBzY3JvbGxQb3NpdGlvbigpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsUG9zaXRpb24uYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbGlzdCBjb250YWluZXIgd2lkdGggYW5kIGhlaWdodC5cbiAgICAgKi9cbiAgICBnZXQgc2l6ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPG51bWJlcltdPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIEBJbnB1dCgpIHJvd0hlaWdodDogbnVtYmVyID0gMTAwO1xuXG4gICAgQElucHV0KClcbiAgICBzZXQgbmV3U2Nyb2xsUG9zaXRpb24ocDogbnVtYmVyKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwJywgcCk7XG4gICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHA7XG4gICAgICAgIC8vIGlmIGxpc3QtaG9sZGVyIGhhcyBubyBoZWlnaHQgYXQgdGhlIGNlcnRhaW4gdGltZS4gc2Nyb2xsVG9wIHdpbGwgbm90IGJlIHNldC5cbiAgICAgICAgaWYgKCF0aGlzLmhvbGRlckhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFRvcCA9IHA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVSVRpbWVsaW5lTWV0ZXIgaXMgb3B0aW9uYWwgaW5qZWN0aW9uLiB3aGVuIHRoaXMgY29tcG9uZW50IHVzZWQgaW5zaWRlIGEgVUlUaW1lbGluZU1ldGVyLlxuICAgICAqIGl0IGlzIHJlc3BvbnNpYmxlIHRvIHVwZGF0ZSB0aGUgc2Nyb2xsWVxuICAgICAqIEBwYXJhbSBfdGltZWxpbmVNZXRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnNjcm9sbGJhclN0eWxlID0gJ25vcm1hbCc7XG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSBnZXRTY3JvbGxCYXJXaWR0aCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsYmFyU3R5bGUgPT09ICdoaWRlLXNjcm9sbGJhcicpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnN0eWxlLnJpZ2h0ID0gKDAgLSB0aGlzLnNjcm9sbGJhcldpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSB0aGlzLnNjcm9sbGJhcldpZHRoICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIGZyb21FdmVudCh0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pZ25vcmVTY3JvbGxFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChzY3JvbGxZOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChzY3JvbGxZKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgLyp0aGlzLl9zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgdGhpcy5zY3JvbGxQb3NpdGlvblxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBza2lwKDEpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKHNjcm9sbFkpID0+IHtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICApOyovXG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUG9zaXRpb25cbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgdGFwKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLklETEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5TQ1JPTExJTkc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLlNDUk9MTElORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNjcm9sbFN0YXRlID0gU0NST0xMX1NUQVRFLklETEU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIG1lYXN1cmUoKTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9IHtcbiAgICAgICAgaWYgKHRoaXMubGlzdENvbnRhaW5lciAmJiB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgLy8gbGV0IG1lYXN1cmVkV2lkdGggPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZEhlaWdodCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGxldCByZWN0ID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHJlY3Qud2lkdGggLSB0aGlzLnNjcm9sbGJhcldpZHRoO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4geyB3aWR0aDogdGhpcy5fY29udGFpbmVyV2lkdGgsIGhlaWdodDogdGhpcy5fY29udGFpbmVySGVpZ2h0IH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuICAgIH1cblxuICAgIHJlcXVlc3RNZWFzdXJlKCkge1xuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLm1lYXN1cmUoKTtcbiAgICAgICAgdGhpcy5fc2l6ZUNoYW5nZS5uZXh0KFt3aWR0aCwgaGVpZ2h0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBTQ1JPTExfU1RBVEUge1xuICAgIFNDUk9MTElORyxcbiAgICBJRExFXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JvbGxCYXJXaWR0aCgpIHtcbiAgICBsZXQgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgaW5uZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICBpbm5lci5zdHlsZS5oZWlnaHQgPSBcIjIwMHB4XCI7XG5cbiAgICBsZXQgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdXRlci5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBvdXRlci5zdHlsZS50b3AgPSBcIjBweFwiO1xuICAgIG91dGVyLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgIG91dGVyLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLnN0eWxlLndpZHRoID0gXCIyMDBweFwiO1xuICAgIG91dGVyLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XG4gICAgbGV0IHcxID0gaW5uZXIub2Zmc2V0V2lkdGg7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSAnc2Nyb2xsJztcbiAgICBsZXQgdzIgPSBpbm5lci5vZmZzZXRXaWR0aDtcblxuICAgIGlmICh3MSA9PSB3Mikge1xuICAgICAgICB3MiA9IG91dGVyLmNsaWVudFdpZHRoO1xuICAgIH1cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3V0ZXIpO1xuXG4gICAgcmV0dXJuICh3MSAtIHcyKTtcbn1cblxuIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcclxuTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuXHJcblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRFxyXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxyXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXHJcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDApXHJcbiAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSByZXN1bHRba10gPSBtb2Rba107XHJcbiAgICByZXN1bHQuZGVmYXVsdCA9IG1vZDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBEb0NoZWNrLFxyXG4gICAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gICAgSW5wdXQsXHJcbiAgICBpc0Rldk1vZGUsXHJcbiAgICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcclxuICAgIEl0ZXJhYmxlQ2hhbmdlcyxcclxuICAgIEl0ZXJhYmxlRGlmZmVyLFxyXG4gICAgSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgTmdJdGVyYWJsZSxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIE9uRGVzdHJveSxcclxuICAgIE9uSW5pdCxcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIFRyYWNrQnlGdW5jdGlvbixcclxuICAgIFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xyXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG4vL2ltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICd2aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYic7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVjeWNsZXIge1xyXG4gICAgcHJpdmF0ZSBsaW1pdDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX3NjcmFwVmlld3M6IE1hcDxudW1iZXIsIFZpZXdSZWY+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGdldFZpZXcocG9zaXRpb246IG51bWJlcik6IFZpZXdSZWYgfCBudWxsIHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3NjcmFwVmlld3MuZ2V0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoIXZpZXcgJiYgdGhpcy5fc2NyYXBWaWV3cy5zaXplID4gMCkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX3NjcmFwVmlld3Mua2V5cygpLm5leHQoKS52YWx1ZTtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3NjcmFwVmlld3MuZ2V0KHBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZpZXcpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2NyYXBWaWV3cy5kZWxldGUocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldyB8fCBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3ljbGVWaWV3KHBvc2l0aW9uOiBudW1iZXIsIHZpZXc6IFZpZXdSZWYpIHtcclxuICAgICAgICB2aWV3LmRldGFjaCgpO1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3Muc2V0KHBvc2l0aW9uLCB2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmFwIHZpZXcgY291bnQgc2hvdWxkIG5vdCBleGNlZWQgdGhlIG51bWJlciBvZiBjdXJyZW50IGF0dGFjaGVkIHZpZXdzLlxyXG4gICAgICovXHJcbiAgICBwcnVuZVNjcmFwVmlld3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGltaXQgPD0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXlJdGVyYXRvciA9IHRoaXMuX3NjcmFwVmlld3Mua2V5cygpO1xyXG4gICAgICAgIGxldCBrZXk6IG51bWJlcjtcclxuICAgICAgICB3aGlsZSAodGhpcy5fc2NyYXBWaWV3cy5zaXplID4gdGhpcy5saW1pdCkge1xyXG4gICAgICAgICAgICBrZXkgPSBrZXlJdGVyYXRvci5uZXh0KCkudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZ2V0KGtleSkuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTY3JhcFZpZXdzTGltaXQobGltaXQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGltaXQgPSBsaW1pdDtcclxuICAgICAgICB0aGlzLnBydW5lU2NyYXBWaWV3cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFuKCkge1xyXG4gICAgICAgIHRoaXMuX3NjcmFwVmlld3MuZm9yRWFjaCgodmlldzogVmlld1JlZikgPT4ge1xyXG4gICAgICAgICAgICB2aWV3LmRlc3Ryb3koKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9zY3JhcFZpZXdzLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbmZpbml0ZVJvdyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgJGltcGxpY2l0OiBhbnksIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY291bnQ6IG51bWJlcikge1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBmaXJzdCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbGFzdCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRleCA9PT0gdGhpcy5jb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGV2ZW4oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvZGQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmV2ZW47XHJcbiAgICB9XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdF1bdmlydHVhbFJlcGVhdE9mXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXQ8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcml2YXRlIF9kaWZmZXI6IEl0ZXJhYmxlRGlmZmVyPFQ+O1xyXG4gICAgcHJpdmF0ZSBfdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248VD47XHJcbiAgICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcclxuICAgIC8qKlxyXG4gICAgICogc2Nyb2xsIG9mZnNldCBvZiB5LWF4aXMgaW4gcGl4ZWxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2Nyb2xsWTogbnVtYmVyID0gMDtcclxuICAgIC8qKlxyXG4gICAgICogZmlyc3QgdmlzaWJsZSBpdGVtIGluZGV4IGluIGNvbGxlY3Rpb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZmlyc3RJdGVtUG9zaXRpb246IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICogbGFzdCB2aXNpYmxlIGl0ZW0gaW5kZXggaW4gY29sbGVjdGlvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9sYXN0SXRlbVBvc2l0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBfY29udGFpbmVyV2lkdGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgX2NvbnRhaW5lckhlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hlbiB0aGlzIHZhbHVlIGlzIHRydWUsIGEgZnVsbCBjbGVhbiBsYXlvdXQgaXMgcmVxdWlyZWQsIGV2ZXJ5IGVsZW1lbnQgbXVzdCBiZSByZXBvc2l0aW9uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ludmFsaWRhdGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgLyoqXHJcbiAgICAgKiB3aGVuIHRoaXMgdmFsdWUgaXMgdHJ1ZSwgYSBsYXlvdXQgaXMgaW4gcHJvY2Vzc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pc0luTGF5b3V0OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNJbk1lYXN1cmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIF9wZW5kaW5nTWVhc3VyZW1lbnQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIF9jb2xsZWN0aW9uOiBhbnlbXTtcclxuXHJcbiAgICBwcml2YXRlIF9yZWN5Y2xlcjogUmVjeWNsZXIgPSBuZXcgUmVjeWNsZXIoKTtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0T2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCBpbmZpbml0ZUZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpbmZpbml0ZUZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgaW5maW5pdGVGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWY8SW5maW5pdGVSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgICAgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICAgIHByaXZhdGUgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJbmZpbml0ZVJvdz4sXHJcbiAgICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgICAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRPZicgaW4gY2hhbmdlcykge1xyXG4gICAgICAgICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0T2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RpZmZlciAmJiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLl90cmFja0J5Rm4pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzIHN1Y2ggYXMgQXJyYXlzLmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nRG9DaGVjaygpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fZGlmZmVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLnZpcnR1YWxSZXBlYXRPZik7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbiA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaE9wZXJhdGlvbigoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55PiwgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXIsIGN1cnJlbnRJbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gbmV3IGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCduZXcgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShjdXJyZW50SW5kZXgsIDAsIGl0ZW0uaXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmVtb3ZlIGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoYWRqdXN0ZWRQcmV2aW91c0luZGV4LCAxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG1vdmUgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdmUgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGN1cnJlbnRJbmRleCwgMCwgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoYWRqdXN0ZWRQcmV2aW91c0luZGV4LCAxKVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbltyZWNvcmQuY3VycmVudEluZGV4XSA9IHJlY29yZC5pdGVtO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoaXNNZWFzdXJlbWVudFJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5zY3JvbGxQb3NpdGlvblxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICAgIGZpbHRlcigoc2Nyb2xsWSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhzY3JvbGxZIC0gdGhpcy5fc2Nyb2xsWSkgPj0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgICAgICAoc2Nyb2xsWSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFkgPSBzY3JvbGxZO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZCh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnNpemVDaGFuZ2Uuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAoW3dpZHRoLCBoZWlnaHRdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc2l6ZUNoYW5nZTogJywgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fcmVjeWNsZXIuY2xlYW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlcXVlc3RNZWFzdXJlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luTWVhc3VyZSB8fCB0aGlzLl9pc0luTGF5b3V0KSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wZW5kaW5nTWVhc3VyZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9wZW5kaW5nTWVhc3VyZW1lbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XHJcbiAgICAgICAgICAgIH0sIDYwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1lYXN1cmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlcXVlc3RMYXlvdXQoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlcXVlc3RMYXlvdXQnLCB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCwgdGhpcy5fY29udGFpbmVySGVpZ2h0LCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0luTWVhc3VyZSAmJiB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1lYXN1cmUoKSB7XHJcbiAgICAgICAgbGV0IGNvbGxlY3Rpb25OdW1iZXIgPSAhdGhpcy5fY29sbGVjdGlvbiB8fCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCA/IDAgOiB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5ob2xkZXJIZWlnaHQgPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCAqIGNvbGxlY3Rpb25OdW1iZXI7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGEgYXBwcm94aW1hdGUgbnVtYmVyIG9mIHdoaWNoIGEgdmlldyBjYW4gY29udGFpblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCk7XHJcbiAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RMYXlvdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGxheW91dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdvbiBsYXlvdXQnKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gdHJ1ZTtcclxuICAgICAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLm1lYXN1cmUoKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24gfHwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gZGV0YWNoIGFsbCB2aWV3cyB3aXRob3V0IHJlY3ljbGUgdGhlbS5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjaGlsZC5jb250ZXh0LmluZGV4IDwgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gfHwgY2hpbGQuY29udGV4dC5pbmRleCA+IHRoaXMuX2xhc3RJdGVtUG9zaXRpb24gfHwgdGhpcy5faW52YWxpZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5maW5kUG9zaXRpb25JblJhbmdlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICAvLyBpZiAoY2hpbGQuY29udGV4dC5pbmRleCA8IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uIHx8IGNoaWxkLmNvbnRleHQuaW5kZXggPiB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uIHx8IHRoaXMuX2ludmFsaWRhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KGNoaWxkLmNvbnRleHQuaW5kZXgsIGNoaWxkKTtcclxuICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5zZXJ0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5wcnVuZVNjcmFwVmlld3MoKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlU2NyYXBWaWV3c0xpbWl0KCkge1xyXG4gICAgICAgIGxldCBsaW1pdCA9IHRoaXMuX2NvbnRhaW5lckhlaWdodCAvIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0ICsgMjtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5zZXRTY3JhcFZpZXdzTGltaXQobGltaXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5zZXJ0Vmlld3MoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgZmlyc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KDApO1xyXG4gICAgICAgICAgICBsZXQgbGFzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGZpcnN0Q2hpbGQuY29udGV4dC5pbmRleCAtIDE7IGkgPj0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGktLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBsYXN0Q2hpbGQuY29udGV4dC5pbmRleCArIDE7IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL25vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXHJcbiAgICBwcml2YXRlIGFwcGx5U3R5bGVzKHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKDAsICR7eX1weCwgMClgO1xyXG4gICAgICAgIHZpZXdFbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgwLCAke3l9cHgsIDApYDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3RoaXMuX2NvbnRhaW5lcldpZHRofXB4YDtcclxuICAgICAgICB2aWV3RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodH1weGA7XHJcbiAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGlzcGF0Y2hMYXlvdXQocG9zaXRpb246IG51bWJlciwgdmlldzogVmlld1JlZiwgYWRkQmVmb3JlOiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IHN0YXJ0UG9zWSA9IHBvc2l0aW9uICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcygodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+KS5yb290Tm9kZXNbMF0sIHN0YXJ0UG9zWSk7XHJcbiAgICAgICAgaWYgKGFkZEJlZm9yZSkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlldy5yZWF0dGFjaCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZFBvc2l0aW9uSW5SYW5nZSgpIHtcclxuICAgICAgICBsZXQgc2Nyb2xsWSA9IHRoaXMuX3Njcm9sbFk7XHJcbiAgICAgICAgbGV0IGZpcnN0UG9zaXRpb24gPSBNYXRoLmZsb29yKHNjcm9sbFkgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnJvd0hlaWdodCk7XHJcbiAgICAgICAgbGV0IGZpcnN0UG9zaXRpb25PZmZzZXQgPSBzY3JvbGxZIC0gZmlyc3RQb3NpdGlvbiAqIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucm93SGVpZ2h0O1xyXG4gICAgICAgIGxldCBsYXN0UG9zaXRpb24gPSBNYXRoLmNlaWwoKHRoaXMuX2NvbnRhaW5lckhlaWdodCArIGZpcnN0UG9zaXRpb25PZmZzZXQpIC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQpICsgZmlyc3RQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLl9maXJzdEl0ZW1Qb3NpdGlvbiA9IE1hdGgubWF4KGZpcnN0UG9zaXRpb24gLSAxLCAwKTtcclxuICAgICAgICB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uID0gTWF0aC5taW4obGFzdFBvc2l0aW9uICsgMSwgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFZpZXcocG9zaXRpb246IG51bWJlcik6IFZpZXdSZWYge1xyXG4gICAgICAgIGxldCB2aWV3ID0gdGhpcy5fcmVjeWNsZXIuZ2V0Vmlldyhwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLl9jb2xsZWN0aW9uW3Bvc2l0aW9uXTtcclxuICAgICAgICBsZXQgY291bnQgPSB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3RlbXBsYXRlLmNyZWF0ZUVtYmVkZGVkVmlldyhuZXcgSW5maW5pdGVSb3coaXRlbSwgcG9zaXRpb24sIGNvdW50KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPEluZmluaXRlUm93PikuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8SW5maW5pdGVSb3c+KS5jb250ZXh0LmluZGV4ID0gcG9zaXRpb247XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxJbmZpbml0ZVJvdz4pLmNvbnRleHQuY291bnQgPSBjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0eXBlWyduYW1lJ10gfHwgdHlwZW9mIHR5cGU7XHJcbn1cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJyb3dzZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0IH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBCcm93c2VyTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFZpcnR1YWxSZXBlYXRDb250YWluZXIsXG4gICAgVmlydHVhbFJlcGVhdFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgVmlydHVhbFJlcGVhdENvbnRhaW5lcixcbiAgICBWaXJ0dWFsUmVwZWF0XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdEFuZ3VsYXJMaWJNb2R1bGUgeyB9XG4iXSwibmFtZXMiOlsiU3Vic2NyaXB0aW9uIiwiQmVoYXZpb3JTdWJqZWN0IiwiZnJvbUV2ZW50IiwiZmlsdGVyIiwibWFwIiwidGFwIiwiZGVib3VuY2VUaW1lIiwiQ29tcG9uZW50IiwiVmlld0NoaWxkIiwiT3V0cHV0IiwiSW5wdXQiLCJpc0Rldk1vZGUiLCJEaXJlY3RpdmUiLCJJdGVyYWJsZURpZmZlcnMiLCJUZW1wbGF0ZVJlZiIsIlZpZXdDb250YWluZXJSZWYiLCJOZ01vZHVsZSIsIkJyb3dzZXJNb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSx5QkFJYSwwQkFBMEIsR0FBRyxHQUFHLENBQUM7SUFFOUMscUJBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7UUFzR3hCO2lDQXpGZ0MsQ0FBQzttQ0FDQyxDQUFDO29DQUNBLENBQUM7aUNBRUUsSUFBSUEsaUJBQVksRUFBRTtzQ0FFSSxJQUFJQyxvQkFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7bUNBQy9DLElBQUlBLG9CQUFlLENBQUMsQ0FBQyxDQUFDOytCQUN4QixJQUFJQSxvQkFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FDQUVoRCxLQUFLO3FDQUVMLGdCQUFnQjtzQ0FFVCxZQUFZLENBQUMsSUFBSTs2QkF5RHZCLEdBQUc7WUFtQjVCLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO1lBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztTQUM3QztRQXZFRCxzQkFBSSxnREFBWTs7O2dCQWlCaEI7Z0JBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQzdCOzs7O2dCQW5CRCxVQUFpQixNQUFjO2dCQUEvQixpQkFlQztnQkFkRyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7b0JBQzVCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLEVBQUU7d0JBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7cUJBQ2xEOzs7b0JBR0QsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssZ0JBQWdCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLEVBQUU7d0JBQ3pFLFVB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