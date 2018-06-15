(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('virtual-repeat-angular-lib/virtual-repeat-container'), require('virtual-repeat-angular-lib/virtual-repeat.base'), require('@angular/platform-browser'), require('virtual-repeat-angular-lib/virtual-repeat-asynch')) :
    typeof define === 'function' && define.amd ? define('virtual-repeat-angular-lib', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', 'virtual-repeat-angular-lib/virtual-repeat-container', 'virtual-repeat-angular-lib/virtual-repeat.base', '@angular/platform-browser', 'virtual-repeat-angular-lib/virtual-repeat-asynch'], factory) :
    (factory((global['virtual-repeat-angular-lib'] = {}),global.ng.core,global.rxjs,global.rxjs.operators,null,null,global.ng.platformBrowser,null));
}(this, (function (exports,core,rxjs,operators,virtualRepeatContainer,virtualRepeat_base,platformBrowser,virtualRepeatAsynch) { 'use strict';

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
            this._rowHeight = 100;
            this._autoHeight = false;
            this._heightAutoComputed = false;
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
        Object.defineProperty(VirtualRepeatContainer.prototype, "rowHeight", {
            set: /**
             * @param {?} rowHeight
             * @return {?}
             */ function (rowHeight) {
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
    /* global Reflect, Promise */
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p]; };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * @template T
     */
    var VirtualRepeat = (function (_super) {
        __extends(VirtualRepeat, _super);
        function VirtualRepeat(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
            return _super.call(this, _virtualRepeatContainer, _differs, _template, _viewContainerRef) || this;
        }
        Object.defineProperty(VirtualRepeat.prototype, "virtualRepeatForTrackBy", {
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
        Object.defineProperty(VirtualRepeat.prototype, "virtualRepeatForTemplate", {
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
                        var /** @type {?} */ child = (this._viewContainerRef.get(i));
                        this._viewContainerRef.detach(i);
                        i--;
                    }
                    this._isInLayout = false;
                    this._invalidate = false;
                    return;
                }
                this.findPositionInRange(this._collection.length);
                for (var /** @type {?} */ i = 0; i < this._viewContainerRef.length; i++) {
                    var /** @type {?} */ child = (this._viewContainerRef.get(i));
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
                    view = this._template.createEmbeddedView(new virtualRepeat_base.VirtualRepeatRow(item, position, count));
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
                        selector: '[virtualRepeat]'
                    },] },
        ];
        /** @nocollapse */
        VirtualRepeat.ctorParameters = function () {
            return [
                { type: virtualRepeatContainer.VirtualRepeatContainer },
                { type: core.IterableDiffers },
                { type: core.TemplateRef },
                { type: core.ViewContainerRef }
            ];
        };
        VirtualRepeat.propDecorators = {
            virtualRepeatOf: [{ type: core.Input }],
            virtualRepeatForTrackBy: [{ type: core.Input }],
            virtualRepeatForTemplate: [{ type: core.Input }]
        };
        return VirtualRepeat;
    }(virtualRepeat_base.VirtualRepeatBase));
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
    var VirtualRepeatAsynch = (function (_super) {
        __extends(VirtualRepeatAsynch, _super);
        function VirtualRepeatAsynch(_virtualRepeatContainer, _differs, _template, _viewContainerRef) {
            return _super.call(this, _virtualRepeatContainer, _differs, _template, _viewContainerRef) || this;
        }
        Object.defineProperty(VirtualRepeatAsynch.prototype, "virtualRepeatAsynchForTrackBy", {
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
        Object.defineProperty(VirtualRepeatAsynch.prototype, "virtualRepeatAsynchForTemplate", {
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
                this._collection.getLength().pipe(operators.first()).subscribe(function (length) {
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
                this._collection.getLength().pipe(operators.first()).subscribe(function (length) {
                    if (length == 0) {
                        return _this.detachAllViews();
                    }
                    _this.findPositionInRange(length);
                    for (var /** @type {?} */ i = 0; i < _this._viewContainerRef.length; i++) {
                        var /** @type {?} */ child = (_this._viewContainerRef.get(i));
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
                    var /** @type {?} */ firstChild = (this._viewContainerRef.get(0));
                    var /** @type {?} */ lastChild = (this._viewContainerRef.get(this._viewContainerRef.length - 1));
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
                    .pipe(operators.first(), operators.map(function (item) {
                    if (!view) {
                        view = _this._template.createEmbeddedView(new virtualRepeat_base.VirtualRepeatRow(item, position, collection_length));
                    }
                    else {
                        ((view)).context.$implicit = item;
                        ((view)).context.index = position;
                        ((view)).context.count = collection_length;
                    }
                    return view;
                }));
            };
        VirtualRepeatAsynch.decorators = [
            { type: core.Directive, args: [{
                        selector: '[virtualRepeatAsynch]'
                    },] },
        ];
        /** @nocollapse */
        VirtualRepeatAsynch.ctorParameters = function () {
            return [
                { type: VirtualRepeatContainer },
                { type: core.IterableDiffers },
                { type: core.TemplateRef },
                { type: core.ViewContainerRef }
            ];
        };
        VirtualRepeatAsynch.propDecorators = {
            virtualRepeatAsynchOf: [{ type: core.Input }],
            virtualRepeatAsynchForTrackBy: [{ type: core.Input }],
            virtualRepeatAsynchForTemplate: [{ type: core.Input }]
        };
        return VirtualRepeatAsynch;
    }(virtualRepeat_base.VirtualRepeatBase));

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
                            VirtualRepeat,
                            virtualRepeatAsynch.VirtualRepeatAsynch
                        ],
                        exports: [
                            VirtualRepeatContainer,
                            VirtualRepeat,
                            virtualRepeatAsynch.VirtualRepeatAsynch
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
    exports.VirtualRepeat = VirtualRepeat;
    exports.getTypeNameForDebugging = getTypeNameForDebugging;
    exports.VirtualRepeatAsynch = VirtualRepeatAsynch;
    exports.VirtualRepeatAngularLibModule = VirtualRepeatAngularLibModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi9saWIvdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLnRzIixudWxsLCJuZzovL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL2xpYi92aXJ0dWFsLXJlcGVhdC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFzeW5jaC50cyIsIm5nOi8vdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvbGliL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCJcbmltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT3V0cHV0LCBJbnB1dCwgU2ltcGxlQ2hhbmdlcywgT25DaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24sIEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgZnJvbUV2ZW50IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBza2lwLCBmaWx0ZXIsIHRhcCwgZGVsYXksIHRha2UsIGNvbmNhdCwgbWFwLCBkZWJvdW5jZVRpbWUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBTQ1JPTExfU1RPUF9USU1FX1RIUkVTSE9MRCA9IDIwMDsgLy8gaW4gbWlsbGlzZWNvbmRzXG5cbmNvbnN0IElOVkFMSURfUE9TSVRJT04gPSAtMTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXInLFxuICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lclwiICNsaXN0Q29udGFpbmVyIFtuZ0NsYXNzXT1cInNjcm9sbGJhclN0eWxlXCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyXCIgW3N0eWxlLmhlaWdodF09XCJob2xkZXJIZWlnaHRJblB4XCI+XHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgPC9kaXY+XHJcbjwvZGl2PlxyXG5gLFxuICAgIHN0eWxlczogW2AuZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVye292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjtwb3NpdGlvbjpyZWxhdGl2ZTtjb250YWluOmxheW91dDstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyIC5nYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXItaG9sZGVye3dpZHRoOjEwMCU7cG9zaXRpb246cmVsYXRpdmV9LmdjLXZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci5ub3JtYWx7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0uZ2MtdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmhpZGUtc2Nyb2xsYmFye3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowfWBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRDb250YWluZXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHByaXZhdGUgX2hvbGRlckhlaWdodDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJXaWR0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jb250YWluZXJIZWlnaHQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICAgIHByaXZhdGUgX3Njcm9sbFN0YXRlQ2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8U0NST0xMX1NUQVRFPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoU0NST0xMX1NUQVRFLklETEUpO1xuICAgIHByaXZhdGUgX3Njcm9sbFBvc2l0aW9uOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoMCk7XG4gICAgcHJpdmF0ZSBfc2l6ZUNoYW5nZTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcltdPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoWzAsIDBdKTtcblxuICAgIHByaXZhdGUgaWdub3JlU2Nyb2xsRXZlbnQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2luaXRpYWxTY3JvbGxUb3AgPSBJTlZBTElEX1BPU0lUSU9OO1xuXG4gICAgY3VycmVudFNjcm9sbFN0YXRlOiBTQ1JPTExfU1RBVEUgPSBTQ1JPTExfU1RBVEUuSURMRTtcblxuICAgIEBWaWV3Q2hpbGQoJ2xpc3RDb250YWluZXInKSBsaXN0Q29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gICAgc2Nyb2xsYmFyU3R5bGU6IHN0cmluZztcbiAgICBzY3JvbGxiYXJXaWR0aDogbnVtYmVyO1xuXG4gICAgc2V0IGhvbGRlckhlaWdodChoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBpZiAodHlwZW9mIGhlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvbGRlckhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ob2xkZXJIZWlnaHQgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2hlbiBpbml0aWFsaXphdGlvbiwgdGhlIGxpc3QtaG9sZGVyIGRvZXNuJ3Qgbm90IGhhdmUgaXRzIGhlaWdodC4gU28gdGhlIHNjcm9sbFRvcCBzaG91bGQgYmUgZGVsYXllZCBmb3Igd2FpdGluZ1xuICAgICAgICAgICAgLy8gdGhlIGxpc3QtaG9sZGVyIHJlbmRlcmVkIGJpZ2dlciB0aGFuIHRoZSBsaXN0LWNvbnRhaW5lci5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pbml0aWFsU2Nyb2xsVG9wICE9PSBJTlZBTElEX1BPU0lUSU9OICYmIHRoaXMuX2hvbGRlckhlaWdodCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wID0gSU5WQUxJRF9QT1NJVElPTjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBob2xkZXJIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvbGRlckhlaWdodDtcbiAgICB9XG5cbiAgICBnZXQgaG9sZGVySGVpZ2h0SW5QeCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhvbGRlckhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcxMDAlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGwgc3RhdGUgY2hhbmdlXG4gICAgICovXG4gICAgZ2V0IHNjcm9sbFN0YXRlQ2hhbmdlKCk6IE9ic2VydmFibGU8U0NST0xMX1NUQVRFPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JvbGxTdGF0ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KClcbiAgICBnZXQgc2Nyb2xsUG9zaXRpb24oKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBvc2l0aW9uLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxpc3QgY29udGFpbmVyIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICovXG4gICAgZ2V0IHNpemVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxudW1iZXJbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBASW5wdXQoKSBzZXQgcm93SGVpZ2h0KHJvd0hlaWdodDogc3RyaW5nKSB7XG4gICAgICAgIGlmKHJvd0hlaWdodCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChyb3dIZWlnaHQgIT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yb3dIZWlnaHQgPSBOdW1iZXIocm93SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSB0aGlzLl9hdXRvSGVpZ2h0ID0gIGZhbHNlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodEF1dG9Db21wdXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9IZWlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSBcblxuICAgIF9yb3dIZWlnaHQ6IG51bWJlciA9IDEwMDtcbiAgICBfYXV0b0hlaWdodDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIF9oZWlnaHRBdXRvQ29tcHV0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IG5ld1Njcm9sbFBvc2l0aW9uKHA6IG51bWJlcikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncCcsIHApO1xuICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSBwO1xuICAgICAgICAvLyBpZiBsaXN0LWhvbGRlciBoYXMgbm8gaGVpZ2h0IGF0IHRoZSBjZXJ0YWluIHRpbWUuIHNjcm9sbFRvcCB3aWxsIG5vdCBiZSBzZXQuXG4gICAgICAgIGlmICghdGhpcy5ob2xkZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQocCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVUlUaW1lbGluZU1ldGVyIGlzIG9wdGlvbmFsIGluamVjdGlvbi4gd2hlbiB0aGlzIGNvbXBvbmVudCB1c2VkIGluc2lkZSBhIFVJVGltZWxpbmVNZXRlci5cbiAgICAgKiBpdCBpcyByZXNwb25zaWJsZSB0byB1cGRhdGUgdGhlIHNjcm9sbFlcbiAgICAgKiBAcGFyYW0gX3RpbWVsaW5lTWV0ZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJTdHlsZSA9ICdub3JtYWwnO1xuICAgICAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gZ2V0U2Nyb2xsQmFyV2lkdGgoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbGJhclN0eWxlID09PSAnaGlkZS1zY3JvbGxiYXInKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5yaWdodCA9ICgwIC0gdGhpcy5zY3JvbGxiYXJXaWR0aCkgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gdGhpcy5zY3JvbGxiYXJXaWR0aCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdzY3JvbGwnKVxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaWdub3JlU2Nyb2xsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlnbm9yZVNjcm9sbEV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoc2Nyb2xsWTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFBvc2l0aW9uLm5leHQoc2Nyb2xsWSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFBvc2l0aW9uXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5JRExFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPSBTQ1JPTExfU1RBVEUuU0NST0xMSU5HO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKFNDUk9MTF9TVE9QX1RJTUVfVEhSRVNIT0xEKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUgPT09IFNDUk9MTF9TVEFURS5TQ1JPTExJTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY3JvbGxTdGF0ZSA9IFNDUk9MTF9TVEFURS5JRExFO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5jdXJyZW50U2Nyb2xsU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICBtZWFzdXJlKCk6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RDb250YWluZXIgJiYgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIGxldCBtZWFzdXJlZFdpZHRoID0gdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAvLyBsZXQgbWVhc3VyZWRIZWlnaHQgPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBsZXQgcmVjdCA9IHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSByZWN0LndpZHRoIC0gdGhpcy5zY3JvbGxiYXJXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgcmV0dXJuIHsgd2lkdGg6IHRoaXMuX2NvbnRhaW5lcldpZHRoLCBoZWlnaHQ6IHRoaXMuX2NvbnRhaW5lckhlaWdodCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB9XG5cbiAgICByZXF1ZXN0TWVhc3VyZSgpIHtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5tZWFzdXJlKCk7XG4gICAgICAgIHRoaXMuX3NpemVDaGFuZ2UubmV4dChbd2lkdGgsIGhlaWdodF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gU0NST0xMX1NUQVRFIHtcbiAgICBTQ1JPTExJTkcsXG4gICAgSURMRVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Nyb2xsQmFyV2lkdGgoKSB7XG4gICAgbGV0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgaW5uZXIuc3R5bGUuaGVpZ2h0ID0gXCIyMDBweFwiO1xuXG4gICAgbGV0IG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3V0ZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgb3V0ZXIuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMjAwcHhcIjtcbiAgICBvdXRlci5zdHlsZS5oZWlnaHQgPSBcIjE1MHB4XCI7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xuICAgIGxldCB3MSA9IGlubmVyLm9mZnNldFdpZHRoO1xuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XG4gICAgbGV0IHcyID0gaW5uZXIub2Zmc2V0V2lkdGg7XG5cbiAgICBpZiAodzEgPT0gdzIpIHtcbiAgICAgICAgdzIgPSBvdXRlci5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcblxuICAgIHJldHVybiAodzEgLSB3Mik7XG59XG5cbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXHJcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcblxyXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXHJcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIFRJVExFLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSxcclxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cclxuXHJcblNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIGlmIChlLmluZGV4T2YocFtpXSkgPCAwKVxyXG4gICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHJlc3VsdC52YWx1ZSk7IH0pLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgcmVzdWx0W2tdID0gbW9kW2tdO1xyXG4gICAgcmVzdWx0LmRlZmF1bHQgPSBtb2Q7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgRGlyZWN0aXZlLFxyXG4gICAgRG9DaGVjayxcclxuICAgIEVtYmVkZGVkVmlld1JlZixcclxuICAgIElucHV0LFxyXG4gICAgaXNEZXZNb2RlLFxyXG4gICAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXHJcbiAgICBJdGVyYWJsZUNoYW5nZXMsXHJcbiAgICBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICBOZ0l0ZXJhYmxlLFxyXG4gICAgT25DaGFuZ2VzLFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgT25Jbml0LFxyXG4gICAgU2ltcGxlQ2hhbmdlcyxcclxuICAgIFRlbXBsYXRlUmVmLFxyXG4gICAgVHJhY2tCeUZ1bmN0aW9uLFxyXG4gICAgVmlld0NvbnRhaW5lclJlZixcclxuICAgIFZpZXdSZWZcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbi8vaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRSb3csIFZpcnR1YWxSZXBlYXRCYXNlIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQuYmFzZSc7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiAnW3ZpcnR1YWxSZXBlYXRdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdDxUPiBleHRlbmRzIFZpcnR1YWxSZXBlYXRCYXNlPFQ+IGltcGxlbWVudHMgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfY29sbGVjdGlvbjogYW55W107XHJcblxyXG4gICAgQElucHV0KCkgdmlydHVhbFJlcGVhdE9mOiBOZ0l0ZXJhYmxlPFQ+O1xyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBpZiAoPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXJ0dWFsUmVwZWF0Rm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0Rm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyOiBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxyXG4gICAgICAgIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICAgICAgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcclxuICAgICAgICBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgICAgIHN1cGVyKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLCBfZGlmZmVycywgX3RlbXBsYXRlLCBfdmlld0NvbnRhaW5lclJlZilcclxuICAgIH1cclxuXHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG4gICAgICAgIGlmICgndmlydHVhbFJlcGVhdE9mJyBpbiBjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vIFJlYWN0IG9uIHZpcnR1YWxSZXBlYXRPZiBvbmx5IG9uY2UgYWxsIGlucHV0cyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjaGFuZ2VzWyd2aXJ0dWFsUmVwZWF0T2YnXS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fZGlmZmVyICYmIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2RpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMuX3RyYWNrQnlGbik7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHt2YWx1ZX0nIG9mIHR5cGUgJyR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodmFsdWUpfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdEb0NoZWNrKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9kaWZmZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMudmlydHVhbFJlcGVhdE9mKTtcclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxUPikge1xyXG4gICAgICAgIGlmICghdGhpcy5fY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKChpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxhbnk+LCBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBuZXcgaXRlbVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ25ldyBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGN1cnJlbnRJbmRleCwgMCwgaXRlbS5pdGVtKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZW1vdmUgaXRlbScsIGl0ZW0sIGFkanVzdGVkUHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlzTWVhc3VyZW1lbnRSZXF1aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShhZGp1c3RlZFByZXZpb3VzSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbW92ZSBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbW92ZSBpdGVtJywgaXRlbSwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShhZGp1c3RlZFByZXZpb3VzSW5kZXgsIDEpWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY29sbGVjdGlvbltyZWNvcmQuY3VycmVudEluZGV4XSA9IHJlY29yZC5pdGVtO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoaXNNZWFzdXJlbWVudFJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIHRoaXMuX3JlY3ljbGVyLmNsZWFuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG1lYXN1cmUoKSB7XHJcbiAgICAgICAgbGV0IGNvbGxlY3Rpb25OdW1iZXIgPSAhdGhpcy5fY29sbGVjdGlvbiB8fCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCA/IDAgOiB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5ob2xkZXJIZWlnaHQgPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQgKiBjb2xsZWN0aW9uTnVtYmVyO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhIGFwcHJveGltYXRlIG51bWJlciBvZiB3aGljaCBhIHZpZXcgY2FuIGNvbnRhaW5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVNjcmFwVmlld3NMaW1pdCgpO1xyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGxheW91dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbkxheW91dCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2lzSW5MYXlvdXQgPSB0cnVlO1xyXG4gICAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIubWVhc3VyZSgpO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIGlmICghdGhpcy5fY29sbGVjdGlvbiB8fCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBkZXRhY2ggYWxsIHZpZXdzIHdpdGhvdXQgcmVjeWNsZSB0aGVtLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZpbmRQb3NpdGlvbkluUmFuZ2UodGhpcy5fY29sbGVjdGlvbi5sZW5ndGgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSA8RW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+PnRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGkpO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVjeWNsZXIucmVjeWNsZVZpZXcoY2hpbGQuY29udGV4dC5pbmRleCwgY2hpbGQpO1xyXG4gICAgICAgICAgICBpLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5zZXJ0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLl9yZWN5Y2xlci5wcnVuZVNjcmFwVmlld3MoKTtcclxuICAgICAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBpbnNlcnRWaWV3cygpIHtcclxuICAgICAgICBpZiAodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCgwKTtcclxuICAgICAgICAgICAgbGV0IGxhc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGZpcnN0Q2hpbGQuY29udGV4dC5pbmRleCAtIDE7IGkgPj0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGktLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBsYXN0Q2hpbGQuY29udGV4dC5pbmRleCArIDE7IGkgPD0gdGhpcy5fbGFzdEl0ZW1Qb3NpdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlldyA9IHRoaXMuZ2V0VmlldyhpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoaSwgdmlldywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpZXcgPSB0aGlzLmdldFZpZXcoaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Vmlldyhwb3NpdGlvbjogbnVtYmVyKTogVmlld1JlZiB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSB0aGlzLl9yZWN5Y2xlci5nZXRWaWV3KHBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2NvbGxlY3Rpb25bcG9zaXRpb25dO1xyXG4gICAgICAgIGxldCBjb3VudCA9IHRoaXMuX2NvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICB2aWV3ID0gdGhpcy5fdGVtcGxhdGUuY3JlYXRlRW1iZWRkZWRWaWV3KG5ldyBWaXJ0dWFsUmVwZWF0Um93KGl0ZW0sIHBvc2l0aW9uLCBjb3VudCkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuaW5kZXggPSBwb3NpdGlvbjtcclxuICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LmNvdW50ID0gY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nKHR5cGU6IGFueSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBEaXJlY3RpdmUsXHJcbiAgICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgICBJbnB1dCxcclxuICAgIGlzRGV2TW9kZSxcclxuICAgIEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIE5nSXRlcmFibGUsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBPbkluaXQsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVGVtcGxhdGVSZWYsXHJcbiAgICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgVmlld1JlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtYXAsIGZpcnN0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuLy9pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWInO1xyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Um93LCBWaXJ0dWFsUmVwZWF0QmFzZSB9IGZyb20gJ3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3ZpcnR1YWwtcmVwZWF0LmJhc2UnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQXN5bmNoQ29sbGVjdGlvbiB7XHJcbiAgICBnZXRMZW5ndGgoKTogT2JzZXJ2YWJsZTxudW1iZXI+O1xyXG4gICAgZ2V0SXRlbShpOiBudW1iZXIpOiBPYnNlcnZhYmxlPGFueT47XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbdmlydHVhbFJlcGVhdEFzeW5jaF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0QXN5bmNoPFQ+IGV4dGVuZHMgVmlydHVhbFJlcGVhdEJhc2U8VD4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2NvbGxlY3Rpb246IElBc3luY2hDb2xsZWN0aW9uO1xyXG5cclxuICAgIEBJbnB1dCgpIHZpcnR1YWxSZXBlYXRBc3luY2hPZjogTmdJdGVyYWJsZTxUPjtcclxuXHJcbiAgICBASW5wdXQoKVxyXG4gICAgc2V0IHZpcnR1YWxSZXBlYXRBc3luY2hGb3JUcmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcclxuICAgICAgICBpZiAoaXNEZXZNb2RlKCkgJiYgZm4gIT0gbnVsbCAmJiB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgaWYgKDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgIGB0cmFja0J5IG11c3QgYmUgYSBmdW5jdGlvbiwgYnV0IHJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoZm4pfS4gYCArXHJcbiAgICAgICAgICAgICAgICAgICAgYFNlZSBodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpL2NvbW1vbi9pbmRleC9OZ0Zvci1kaXJlY3RpdmUuaHRtbCMhI2NoYW5nZS1wcm9wYWdhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90cmFja0J5Rm4gPSBmbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgdmlydHVhbFJlcGVhdEFzeW5jaEZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93Pikge1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfdmlydHVhbFJlcGVhdENvbnRhaW5lcjogVmlydHVhbFJlcGVhdENvbnRhaW5lcixcclxuICAgICAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICAgIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4sXHJcbiAgICAgICAgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcclxuICAgICAgICBzdXBlcihfdmlydHVhbFJlcGVhdENvbnRhaW5lciwgX2RpZmZlcnMsIF90ZW1wbGF0ZSwgX3ZpZXdDb250YWluZXJSZWYpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgICAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRBc3luY2hPZicgaW4gY2hhbmdlcykge1xyXG4gICAgICAgICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0QXN5bmNoT2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdEFzeW5jaE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uID0gdmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9oZWlnaHRBdXRvQ29tcHV0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG1lYXN1cmUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLmdldExlbmd0aCgpLnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKChsZW5ndGgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5ob2xkZXJIZWlnaHQgPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9yb3dIZWlnaHQgKiBsZW5ndGg7XHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBhIGFwcHJveGltYXRlIG51bWJlciBvZiB3aGljaCBhIHZpZXcgY2FuIGNvbnRhaW5cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVTY3JhcFZpZXdzTGltaXQoKTtcclxuICAgICAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdExheW91dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBsYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnb24gbGF5b3V0Jyk7XHJcbiAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IHRydWU7XHJcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5tZWFzdXJlKCk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgdmlld3Mgd2l0aG91dCByZWN5Y2xlIHRoZW0uXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRldGFjaEFsbFZpZXdzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uZ2V0TGVuZ3RoKCkucGlwZShmaXJzdCgpKS5zdWJzY3JpYmUoKGxlbmd0aCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRldGFjaEFsbFZpZXdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5maW5kUG9zaXRpb25JblJhbmdlKGxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChpKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmIChjaGlsZC5jb250ZXh0LmluZGV4IDwgdGhpcy5fZmlyc3RJdGVtUG9zaXRpb24gfHwgY2hpbGQuY29udGV4dC5pbmRleCA+IHRoaXMuX2xhc3RJdGVtUG9zaXRpb24gfHwgdGhpcy5faW52YWxpZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goaSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyhjaGlsZC5jb250ZXh0LmluZGV4LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pbnNlcnRWaWV3cyhsZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5wcnVuZVNjcmFwVmlld3MoKTtcclxuICAgICAgICAgICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluc2VydFZpZXdzKGNvbGxlY3Rpb25fbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdENoaWxkID0gPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj50aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldCgwKTtcclxuICAgICAgICAgICAgbGV0IGxhc3RDaGlsZCA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGZpcnN0Q2hpbGQuY29udGV4dC5pbmRleCAtIDE7IGkgPj0gdGhpcy5fZmlyc3RJdGVtUG9zaXRpb247IGktLSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoLCBpKS5zdWJzY3JpYmUoKHZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxhc3RDaGlsZC5jb250ZXh0LmluZGV4ICsgMTsgaSA8PSB0aGlzLl9sYXN0SXRlbVBvc2l0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5nZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoLCBpKS5zdWJzY3JpYmUoKHZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX2ZpcnN0SXRlbVBvc2l0aW9uOyBpIDw9IHRoaXMuX2xhc3RJdGVtUG9zaXRpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoLCBpKS5zdWJzY3JpYmUoKHZpZXcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTGF5b3V0KGksIHZpZXcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRWaWV3KGNvbGxlY3Rpb25fbGVuZ3RoOiBudW1iZXIsIHBvc2l0aW9uOiBudW1iZXIpOiBPYnNlcnZhYmxlPFZpZXdSZWY+IHtcclxuICAgICAgICBsZXQgdmlldyA9IHRoaXMuX3JlY3ljbGVyLmdldFZpZXcocG9zaXRpb24pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmdldEl0ZW0ocG9zaXRpb24pXHJcbiAgICAgICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgICAgICAgZmlyc3QoKSxcclxuICAgICAgICAgICAgICAgIG1hcCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gdGhpcy5fdGVtcGxhdGUuY3JlYXRlRW1iZWRkZWRWaWV3KG5ldyBWaXJ0dWFsUmVwZWF0Um93KGl0ZW0sIHBvc2l0aW9uLCBjb2xsZWN0aW9uX2xlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh2aWV3IGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PikuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAodmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pLmNvbnRleHQuaW5kZXggPSBwb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPFZpcnR1YWxSZXBlYXRSb3c+KS5jb250ZXh0LmNvdW50ID0gY29sbGVjdGlvbl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJyb3dzZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0IH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdCc7XG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0QXN5bmNoIH0gZnJvbSAndmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvdmlydHVhbC1yZXBlYXQtYXN5bmNoJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEJyb3dzZXJNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgVmlydHVhbFJlcGVhdENvbnRhaW5lcixcbiAgICBWaXJ0dWFsUmVwZWF0LFxuICAgIFZpcnR1YWxSZXBlYXRBc3luY2hcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFZpcnR1YWxSZXBlYXRDb250YWluZXIsXG4gICAgVmlydHVhbFJlcGVhdCxcbiAgICBWaXJ0dWFsUmVwZWF0QXN5bmNoXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdEFuZ3VsYXJMaWJNb2R1bGUgeyB9XG4iXSwibmFtZXMiOlsiU3Vic2NyaXB0aW9uIiwiQmVoYXZpb3JTdWJqZWN0IiwiZnJvbUV2ZW50IiwiZmlsdGVyIiwibWFwIiwidGFwIiwiZGVib3VuY2VUaW1lIiwiQ29tcG9uZW50IiwiVmlld0NoaWxkIiwiT3V0cHV0IiwiSW5wdXQiLCJ0c2xpYl8xLl9fZXh0ZW5kcyIsImlzRGV2TW9kZSIsIlZpcnR1YWxSZXBlYXRSb3ciLCJEaXJlY3RpdmUiLCJWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIiwiSXRlcmFibGVEaWZmZXJzIiwiVGVtcGxhdGVSZWYiLCJWaWV3Q29udGFpbmVyUmVmIiwiVmlydHVhbFJlcGVhdEJhc2UiLCJmaXJzdCIsIk5nTW9kdWxlIiwiQnJvd3Nlck1vZHVsZSIsIlZpcnR1YWxSZXBlYXRBc3luY2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSx5QkFJYSwwQkFBMEIsR0FBRyxHQUFHLENBQUM7SUFFOUMscUJBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7UUFxSHhCO2lDQXhHZ0MsQ0FBQzttQ0FDQyxDQUFDO29DQUNBLENBQUM7aUNBRUUsSUFBSUEsaUJBQVksRUFBRTtzQ0FFSSxJQUFJQyxvQkFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7bUNBQy9DLElBQUlBLG9CQUFlLENBQUMsQ0FBQyxDQUFDOytCQUN4QixJQUFJQSxvQkFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FDQUVoRCxLQUFLO3FDQUVMLGdCQUFnQjtzQ0FFVCxZQUFZLENBQUMsSUFBSTs4QkFzRS9CLEdBQUc7K0JBQ0QsS0FBSzt1Q0FDRyxLQUFLO1lBbUJoQyxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztZQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLGlCQUFpQixFQUFFLENBQUM7U0FDN0M7UUF0RkQsc0JBQUksZ0RBQVk7OztnQkFpQmhCO2dCQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQzthQUM3Qjs7OztnQkFuQkQsVUFBaUIsTUFBYztnQkFBL0IsaUJBZUM7Z0JBZEcsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO29CQUM1QixJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssQ0FBQyxFQUFFO3dCQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO3FCQUNsRDs7O29CQUdELElBQUksSUFBSSxDQUFDLGlCQUFpQixLQUFLLGdCQUFnQixJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssQ0FB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