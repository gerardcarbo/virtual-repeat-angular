import { noop, Observable, empty, of, Subscription, BehaviorSubject, Subject, fromEvent } from 'rxjs';
import * as i0 from '@angular/core';
import { Injectable, Component, Output, Input, ViewChild, Directive, isDevMode, NgModule } from '@angular/core';
import { flatMap, delay, tap, filter, map, pairwise, debounceTime } from 'rxjs/operators';
import * as i2 from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

class LoggerService {
    constructor() {
        const bLog = Boolean(localStorage.getItem('gcvra_log')); // enable log
        const filterLog = localStorage.getItem('gcvra_log_filter'); // filter log lines (; separated list)
        let filterLogTerms;
        if (filterLog) {
            filterLogTerms = filterLog
                .split(';')
                .map(term => term.trim().toLowerCase())
                .filter(term => !!term);
        }
        if (bLog) {
            if (filterLog) {
                this.log = function (text, ...args) {
                    let done = false;
                    filterLogTerms.forEach(term => {
                        if (!done && text.toLowerCase().indexOf(term) !== -1) {
                            console.log(text, ...args);
                            done = true;
                        }
                    });
                    return;
                };
            }
            else {
                this.log = function (text, ...args) {
                    console.log(text, ...args);
                };
            }
        }
        else {
            this.log = noop;
        }
    }
}
LoggerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: LoggerService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
LoggerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: LoggerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: LoggerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });

const logger = new LoggerService();
/**
 * If observable value has not changed act as throttleTime, but if changed notify it inmediatly.
 * @param throttleTime throttle time in miliseconds.
 */
function throttleTimeUntilChanged(throttleTime) {
    return (source) => {
        return new Observable(observer => {
            let lastSeen = {};
            let lastSeenTime = 0;
            return source
                .pipe(flatMap((value) => {
                // logger.log(`throttleTimeUntilChanged: value: ${value} last: ${lastSeen}`);
                const now = Date.now();
                if (value === lastSeen && now - lastSeenTime < throttleTime) {
                    return empty();
                }
                else {
                    lastSeen = value;
                    lastSeenTime = now;
                    return of(lastSeen);
                }
            }))
                .subscribe(observer);
        });
    };
}
/**
 * Remove spurious changes on a boolean observable.
 * @param glitchSize max size of the gitches (in miliseconds) to be removed.
 */
function deglitch(glitchSize) {
    return (source) => {
        return new Observable(observer => {
            let currentState;
            let lastState;
            let lastStateTime;
            return source
                .pipe(flatMap((value) => {
                // logger.log(`deglitch: value: ${value} currentState: ${currentState} `);
                lastStateTime = Date.now();
                lastState = value;
                if (currentState === undefined) {
                    currentState = value;
                    return of(value);
                }
                if (value === currentState) {
                    return empty();
                }
                else {
                    return of(value).pipe(delay(glitchSize), flatMap((value_) => {
                        const elapsed = Date.now() - lastStateTime;
                        // logger.log(`deglitch -> delay elapsed: ${elapsed} value_: ${value_} lastState: ${lastState} currentState: ${currentState} `);
                        if (value_ !== lastState) {
                            if (lastState === currentState) {
                                // logger.log(`deglitch -> delay lastState === currentState -> empty()`);
                                return empty();
                            }
                            else {
                                // logger.log(`deglitch -> delay elapsed: ${elapsed} lastState !== currentState -> ${lastState}`);
                                currentState = lastState;
                                return of(currentState);
                            }
                        }
                        // logger.log(`deglitch -> delay value_ !== lastState -> ${value_}`);
                        if (elapsed < glitchSize) {
                            // logger.log(`deglitch -> delay ${elapsed} < glitchSize -> empty()`);
                            return empty();
                        }
                        currentState = value_;
                        return of(currentState);
                    }));
                }
            }))
                .subscribe(observer);
        });
    };
}
/**
 * Remove spurious falses on a boolean observable.
 * @param glitchSize max size of the gitches (in miliseconds) to be removed.
 */
function deglitchFalse(glitchSize) {
    return (source) => {
        return new Observable(observer => {
            let currentState;
            let lastState;
            let lastStateTime;
            return source
                .pipe(flatMap((value) => {
                // logger.log(`deglitchFalse: value: ${value} currentState: ${currentState} `);
                lastStateTime = Date.now();
                lastState = value;
                if (currentState === undefined || (value === true && currentState !== value)) {
                    currentState = value;
                    return of(value);
                }
                if (value === currentState) {
                    return empty();
                }
                else {
                    return of(value).pipe(delay(glitchSize), flatMap((value_) => {
                        const elapsed = Date.now() - lastStateTime;
                        // logger.log(`deglitchFalse -> delay elapsed: ${elapsed} value_: ${value_} lastState: ${lastState} currentState: ${currentState} `);
                        if (value_ !== lastState) {
                            if (lastState === currentState) {
                                // logger.log(`deglitchFalse -> delay lastState === currentState -> empty()`);
                                return empty();
                            }
                            else {
                                // logger.log(`deglitchFalse -> delay elapsed: ${elapsed} lastState !== currentState -> ${lastState}`);
                                currentState = lastState;
                                return of(currentState);
                            }
                        }
                        // logger.log(`deglitchFalse -> delay value_ !== lastState -> ${value_}`);
                        if (elapsed < glitchSize) {
                            // logger.log(`deglitchFalse -> delay ${elapsed} < glitchSize -> empty()`);
                            return empty();
                        }
                        currentState = value_;
                        return of(currentState);
                    }));
                }
            }))
                .subscribe(observer);
        });
    };
}

const SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
const INVALID_POSITION = -1;
// tslint:disable-next-line:component-class-suffix
class VirtualRepeatContainer {
    /**
     * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
     * it is responsible to update the scrollY
     * @param _timelineMeter
     */
    constructor(logger) {
        this.logger = logger;
        this._holderHeight = 0;
        this._containerWidth = 0;
        this._containerHeight = 0;
        this.translateY = 0;
        this._subscription = new Subscription();
        this._scrollStateChange = new BehaviorSubject(SCROLL_STATE.IDLE);
        this._scrollPosition = new BehaviorSubject(0);
        this._sizeChange = new BehaviorSubject([0, 0]);
        this._ignoreScrollEvent = false;
        this._initialScrollTop = INVALID_POSITION;
        this._currentScrollState = SCROLL_STATE.IDLE;
        this._rowHeight = 100;
        this._autoHeight = false;
        this._autoHeightComputed = false;
        this._autoHeightVariable = false;
        this._autoHeightVariableData = {
            itemsCount: 0,
            totalHeight: 0
        };
        this._processingSubject = new Subject();
        this.processingRaw$ = this._processingSubject.pipe(tap(state => {
            this.logger.log('processingRaw$ ' + state);
        }));
        this.processing$ = this._processingSubject.pipe(deglitchFalse(500), tap(state => {
            this.logger.log('processing$ ' + state);
        }));
        this.scrollbarStyle = 'normal';
        this.scrollbarWidth = getScrollBarWidth();
    }
    set virtualRepeat(virtualRepeat) {
        this._virtualRepeat = virtualRepeat;
    }
    get currentScrollState() {
        return this._currentScrollState;
    }
    set holderHeight(height) {
        if (typeof height !== 'undefined') {
            this._holderHeight = height;
            if (this._holderHeight === 0) {
                this.listContainer.nativeElement.scrollTop = 0;
            }
            // When initialization, the list-holder doesn't not have its height.
            // So the scrollTop should be delayed for waiting
            // the list-holder rendered bigger than the list-container.
            if (this._initialScrollTop !== INVALID_POSITION &&
                this._holderHeight !== 0) {
                setTimeout(() => {
                    this.listContainer.nativeElement.scrollTop = this._initialScrollTop;
                    this._initialScrollTop = INVALID_POSITION;
                });
            }
        }
    }
    get holderHeight() {
        return this._holderHeight;
    }
    get holderHeightInPx() {
        if (this._holderHeight) {
            return this._holderHeight + 'px';
        }
        return '100%';
    }
    get translateYInPx() {
        return this.translateY + 'px';
    }
    /**
     * scroll state change
     */
    get scrollStateChange() {
        return this._scrollStateChange.asObservable();
    }
    /**
     * current scroll position.
     */
    get scrollPosition$() {
        return this._scrollPosition.asObservable();
    }
    /**
     * container width and height.
     */
    get sizeChange() {
        return this._sizeChange.asObservable();
    }
    set rowHeight(height) {
        if (height === 'auto') {
            this._autoHeight = true;
            this._autoHeightComputed = false;
            return;
        }
        if (typeof height === 'string' || height instanceof String) {
            height = Number(height);
        }
        if (isNaN(height)) {
            throw Error('rowHeight can not be NaN');
        }
        if (height !== undefined) {
            this._rowHeight = height;
            this._autoHeight = false;
        }
    }
    set processing(l) {
        this._processingSubject.next(l);
    }
    set scrollPosition(p) {
        // this.logger.log('p', p);
        this.listContainer.nativeElement.scrollTop = p;
        // if list-holder has no height at the certain time. scrollTop will not be set.
        if (!this._holderHeight) {
            this._initialScrollTop = p;
        }
        this._scrollPosition.next(p);
    }
    ngAfterViewInit() {
        if (this.scrollbarStyle === 'hide-scrollbar') {
            this.listContainer.nativeElement.style.right =
                0 - this.scrollbarWidth + 'px';
            this.listContainer.nativeElement.style.paddingRight =
                this.scrollbarWidth + 'px';
        }
        if (window) {
            this._subscription.add(fromEvent(window, 'resize').subscribe(() => {
                this.resize();
            }));
        }
        this._subscription.add(fromEvent(this.listContainer.nativeElement, 'scroll')
            .pipe(filter(() => {
            if (this._ignoreScrollEvent) {
                this._ignoreScrollEvent = false;
                return false;
            }
            return true;
        }), map(() => {
            return this.listContainer.nativeElement.scrollTop;
        }))
            .subscribe((scrollY) => {
            this._scrollPosition.next(scrollY);
        }));
        this._subscription.add(this.scrollPosition$
            .pipe(tap(() => {
            if (this._currentScrollState === SCROLL_STATE.IDLE) {
                this._currentScrollState = SCROLL_STATE.SCROLLING_DOWN;
                this._scrollStateChange.next(this._currentScrollState);
            }
        }), pairwise(), map(pair => {
            if (Math.abs(pair[1] - pair[0]) > 10) {
                this._currentScrollState =
                    pair[1] - pair[0] > 0
                        ? SCROLL_STATE.SCROLLING_DOWN
                        : SCROLL_STATE.SCROLLING_UP;
                this.logger.log(`scrollPosition pair: ${pair} _currentScrollState: ${this._currentScrollState}`);
                this._scrollStateChange.next(this._currentScrollState);
            }
        }), debounceTime(SCROLL_STOP_TIME_THRESHOLD))
            .subscribe(() => {
            if (this._currentScrollState !== SCROLL_STATE.IDLE) {
                this._scrollStateChange.next(SCROLL_STATE.IDLE);
            }
        }));
        setTimeout(() => {
            this.resize();
        });
    }
    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
    getRowHeight() {
        return this._rowHeight;
    }
    getContainerSize() {
        if (this.listContainer && this.listContainer.nativeElement) {
            const rect = this.listContainer.nativeElement.getBoundingClientRect();
            this._containerWidth = rect.width - this.scrollbarWidth;
            this._containerHeight = rect.height;
            return { width: this._containerWidth, height: this._containerHeight };
        }
        return { width: 0, height: 0 };
    }
    reset() {
        this.scrollPosition = 0;
        this._virtualRepeat.reset();
    }
    resize() {
        const { width, height } = this.getContainerSize();
        this._sizeChange.next([width, height]);
    }
}
VirtualRepeatContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatContainer, deps: [{ token: LoggerService }], target: i0.ɵɵFactoryTarget.Component });
VirtualRepeatContainer.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatContainer, selector: "gc-virtual-repeat-container", inputs: { rowHeight: "rowHeight", scrollPosition: "scrollPosition" }, outputs: { scrollPosition$: "scrollPosition$" }, viewQueries: [{ propertyName: "listContainer", first: true, predicate: ["listContainer"], descendants: true, static: true }], ngImport: i0, template: "<div class=\"gc-virtual-repeat-scroller\" #listContainer [ngClass]=\"scrollbarStyle\">\r\n    <div class=\"gc-virtual-repeat-container-holder\" [style.height]=\"holderHeightInPx\">\r\n    </div>\r\n    <div class=\"gc-virtual-repeat-offsetter\" role=\"presentation\" [style.transform]=\"'translateY('+ translateYInPx +')'\">\r\n        <ng-content></ng-content>\r\n    </div>\r\n</div>", styles: ["::ng-deep gc-virtual-repeat-container{display:block;margin:0;overflow:hidden;padding:0;width:100%;overflow-y:hidden;position:relative;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-scroller{overflow:auto;box-sizing:border-box;inset:0;margin:0;overflow-x:hidden;padding:0;position:absolute;width:100%;height:100%;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-offsetter{box-sizing:border-box;left:0;margin:0;padding:0;position:absolute;right:0;top:0;flex-direction:column}::ng-deep gc-virtual-repeat-container.hide-scrollbar{position:absolute;inset:0}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatContainer, decorators: [{
            type: Component,
            args: [{ selector: 'gc-virtual-repeat-container', template: "<div class=\"gc-virtual-repeat-scroller\" #listContainer [ngClass]=\"scrollbarStyle\">\r\n    <div class=\"gc-virtual-repeat-container-holder\" [style.height]=\"holderHeightInPx\">\r\n    </div>\r\n    <div class=\"gc-virtual-repeat-offsetter\" role=\"presentation\" [style.transform]=\"'translateY('+ translateYInPx +')'\">\r\n        <ng-content></ng-content>\r\n    </div>\r\n</div>", styles: ["::ng-deep gc-virtual-repeat-container{display:block;margin:0;overflow:hidden;padding:0;width:100%;overflow-y:hidden;position:relative;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-scroller{overflow:auto;box-sizing:border-box;inset:0;margin:0;overflow-x:hidden;padding:0;position:absolute;width:100%;height:100%;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-offsetter{box-sizing:border-box;left:0;margin:0;padding:0;position:absolute;right:0;top:0;flex-direction:column}::ng-deep gc-virtual-repeat-container.hide-scrollbar{position:absolute;inset:0}\n"] }]
        }], ctorParameters: function () { return [{ type: LoggerService }]; }, propDecorators: { scrollPosition$: [{
                type: Output
            }], rowHeight: [{
                type: Input
            }], scrollPosition: [{
                type: Input
            }], listContainer: [{
                type: ViewChild,
                args: ['listContainer', { static: true }]
            }] } });
var SCROLL_STATE;
(function (SCROLL_STATE) {
    SCROLL_STATE[SCROLL_STATE["IDLE"] = 0] = "IDLE";
    SCROLL_STATE[SCROLL_STATE["SCROLLING_DOWN"] = 1] = "SCROLLING_DOWN";
    SCROLL_STATE[SCROLL_STATE["SCROLLING_UP"] = 2] = "SCROLLING_UP";
})(SCROLL_STATE || (SCROLL_STATE = {}));
function getScrollBarWidth() {
    const inner = document.createElement('p');
    inner.style.width = '100%';
    inner.style.height = '200px';
    const outer = document.createElement('div');
    outer.style.position = 'absolute';
    outer.style.top = '0px';
    outer.style.left = '0px';
    outer.style.visibility = 'hidden';
    outer.style.width = '200px';
    outer.style.height = '150px';
    outer.style.overflow = 'hidden';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    const w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let w2 = inner.offsetWidth;
    if (w1 === w2) {
        w2 = outer.clientWidth;
    }
    document.body.removeChild(outer);
    return w1 - w2;
}

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        Object.freeze(this);
    }
}
class VirtualRepeatRow {
    constructor($implicit, index, count) {
        this.$implicit = $implicit;
        this.index = index;
        this.count = count;
    }
    get first() {
        return this.index === 0;
    }
    get last() {
        return this.index === this.count - 1;
    }
    get even() {
        return this.index % 2 === 0;
    }
    get odd() {
        return !this.even;
    }
}
class Recycler {
    constructor(limit = 0) {
        this._limit = 0;
        this._scrapViews = [];
        this._limit = limit;
    }
    length() {
        return this._scrapViews.length;
    }
    recoverView() {
        return this._scrapViews.pop();
    }
    recycleView(view) {
        view.detach();
        this._scrapViews.push(view);
    }
    /**
     * scrap view count should not exceed the number of current attached views.
     */
    pruneScrapViews() {
        if (this._limit <= 1) {
            return;
        }
        while (this._scrapViews.length > this._limit) {
            this._scrapViews.pop().destroy();
        }
    }
    setScrapViewsLimit(limit) {
        this._limit = limit;
        this.pruneScrapViews();
    }
    clean() {
        this._scrapViews.forEach((view) => {
            view.destroy();
        });
        this._scrapViews = [];
    }
}
class VirtualRepeatBase {
    constructor(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger) {
        this._virtualRepeatContainer = _virtualRepeatContainer;
        this._differs = _differs;
        this._template = _template;
        this._viewContainerRef = _viewContainerRef;
        this.logger = logger;
        this._subscription = new Subscription();
        /**
         * scroll offset of y-axis in pixel
         */
        this._scrollY = 0;
        /**
         * items inserted after and before the view area
         */
        this._guardItems = 10;
        this._isInLayout = false;
        this._isInMeasure = false;
        this._collectionLength = -1;
        this._processTimeout = 5000;
        this.requestMeasure = new Subject();
        this._requestMeasureFiltered = this.requestMeasure.pipe(tap(() => {
            this.logger.log('requestMeasureFiltered: requested');
        }), debounceTime(60), filter(() => {
            this.logger.log(`requestMeasureFiltered: enter isInMeasure: ` +
                `${this._isInMeasure} isInLayout: ${this._isInLayout}`);
            if (this._isInMeasure || this._isInLayout) {
                this.logger.log('requestMeasureFiltered: retrying...');
                setTimeout(() => {
                    this.requestMeasure.next();
                }, 500);
            }
            return !this._isInMeasure && !this._isInLayout;
        }));
        this.requestLayout = new Subject();
        this._requestLayoutFiltered = this.requestLayout.pipe(tap(() => {
            this.logger.log('requestLayoutFiltered: requested');
        }), filter(() => {
            this.logger.log(`requestLayoutFiltered: enter isInMeasure: ${this._isInMeasure} isInLayout: ${this._isInLayout}`);
            if (this._isInMeasure || this._isInLayout) {
                this.logger.log('requestLayoutFiltered: retrying...');
                setTimeout(() => {
                    this.requestLayout.next();
                }, 500);
            }
            return !this._isInMeasure && !this._isInLayout;
        }));
        this._virtualRepeatContainer.virtualRepeat = this;
    }
    ngOnInit() {
        this.connect();
    }
    ngOnDestroy() {
        this.disconnect();
    }
    connect() {
        this._firstRequestedItemIndex = this._lastRequestedItemIndex = undefined;
        this._virtualRepeatContainer._autoHeightComputed = false;
        this._recycler = new Recycler();
        this.requestMeasure.next();
        this._subscription.add(this._requestMeasureFiltered.subscribe(() => {
            this.measure();
        }));
        this._subscription.add(this._requestLayoutFiltered.subscribe(() => {
            this.layout();
        }));
        this._subscription.add(this._virtualRepeatContainer.scrollPosition$
            .pipe(debounceTime(60), filter(scrollY => {
            return (scrollY === 0 ||
                Math.abs(scrollY - this._scrollY) >=
                    (this._virtualRepeatContainer.getRowHeight() * this._guardItems) / 2);
        }))
            .subscribe(scrollY => {
            this.logger.log('scrollPosition: ', scrollY);
            this._scrollY = scrollY;
            if (scrollY >= 0 && this._collectionLength !== -1) {
                this.requestLayout.next();
            }
        }));
        this._subscription.add(this._virtualRepeatContainer.sizeChange.subscribe(([width, height]) => {
            this.logger.log('sizeChange: ', width, height);
            this._containerWidth = width;
            this._containerHeight = height;
            if (height > 0) {
                this.requestMeasure.next();
            }
        }));
        this._subscription.add(this._virtualRepeatContainer.processingRaw$.subscribe(processing => this.onProcessing(processing)));
    }
    disconnect() {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }
    reset() {
        this._virtualRepeatContainer.scrollPosition = 0;
        this._collectionLength = -1;
        this.detachAllViews();
        this.requestMeasure.next();
    }
    detachAllViews() {
        this._viewContainerRef.clear();
        this._isInLayout = false;
        return;
    }
    emptyItem(item) {
        const o = Array.isArray(item) ? [] : {};
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                const t = typeof item[key];
                o[key] = t === 'object' ? this.emptyItem(item[key]) : undefined;
            }
        }
        return o;
    }
    layout() {
        this.logger.log('layout: on layout');
        this._virtualRepeatContainer.processing = true;
        this._isInLayout = true;
        const { width, height } = this._virtualRepeatContainer.getContainerSize();
        this._containerWidth = width;
        this._containerHeight = height;
        if (this._collectionLength <= 0) {
            this.logger.log('layout: this._isInLayout = false. detachAllViews');
            this.detachAllViews();
            this.processingDone();
            return;
        }
        this.findRequestedIndexesRange();
        this.removeViews();
        this.createViews().then(() => {
            clearTimeout(this._doProcessTimeout);
            this.processingDone();
        });
        this._doProcessTimeout = setTimeout(() => {
            this.processingDone();
        }, this._processTimeout);
    }
    processingDone() {
        this._virtualRepeatContainer.processing = false;
        this._isInLayout = false;
        this._recycler.pruneScrapViews();
    }
    findRequestedIndexesRange() {
        let firstPosition;
        this._firstItemIndex = this._firstRequestedItemIndex;
        this._lastItemIndex = this._lastRequestedItemIndex;
        this.logger.log(`findRequestedIndexesRange: _autoHeightVariable: ${this._virtualRepeatContainer._autoHeightVariable} firstItemPosition: ${this._firstItemIndex}`);
        if (this._virtualRepeatContainer._autoHeightVariable) {
            this._virtualRepeatContainer.holderHeight =
                this._virtualRepeatContainer.getRowHeight() * this._collectionLength;
            firstPosition = Math.floor(this._collectionLength *
                (this._scrollY / this._virtualRepeatContainer.holderHeight));
            let lastPosition = Math.ceil(this._containerHeight / this._virtualRepeatContainer.getRowHeight()) + firstPosition;
            this._firstRequestedItemIndex = Math.max(firstPosition - this._guardItems, 0);
            this._lastRequestedItemIndex = Math.min(lastPosition + this._guardItems, this._collectionLength - 1);
            this.logger.log(`findRequestedIndexesRange: _autoHeightVariable scrollY: 
        ${this._scrollY} holderHeight: ${this._virtualRepeatContainer.holderHeight}`);
            this.logger.log(`findRequestedIndexesRange: _autoHeightVariable firstRequestedItemPosition: ${this._firstRequestedItemIndex} lastRequestedItemPosition: ${this._lastRequestedItemIndex}`);
        }
        else {
            firstPosition = Math.floor(this._scrollY / this._virtualRepeatContainer.getRowHeight());
            const firstPositionOffset = this._scrollY - firstPosition * this._virtualRepeatContainer.getRowHeight();
            let lastPosition = Math.ceil((this._containerHeight + firstPositionOffset) /
                this._virtualRepeatContainer.getRowHeight()) + firstPosition;
            this._firstRequestedItemIndex = Math.max(firstPosition - this._guardItems, 0);
            this._lastRequestedItemIndex = Math.min(lastPosition + this._guardItems, this._collectionLength - 1);
            if (this._lastRequestedItemIndex - this._firstRequestedItemIndex > 50) {
                this._lastRequestedItemIndex = this._firstRequestedItemIndex + 50;
            }
            this._virtualRepeatContainer.translateY =
                this._firstRequestedItemIndex * this._virtualRepeatContainer.getRowHeight();
            this.logger.log(`findRequestedIndexesRange: translateY: ${this._virtualRepeatContainer.translateY} rowHeight: ${this._virtualRepeatContainer.getRowHeight()}`);
            this.logger.log(`findRequestedIndexesRange: firstRequestedItemPosition: ${this._firstRequestedItemIndex} lastRequestedItemPosition: ${this._lastRequestedItemIndex}`);
        }
    }
    removeViews() {
        this._markedToBeRemovedCount = 0;
        if (this._viewContainerRef.length > 0) {
            this.logger.log('removeViews: length > 0');
            for (let i = 0; i < this._viewContainerRef.length; i++) {
                const view = (this._viewContainerRef.get(i));
                const viewIndex = view.context.index;
                if (viewIndex > this._lastRequestedItemIndex ||
                    viewIndex < this._firstRequestedItemIndex) {
                    if (this._virtualRepeatContainer._autoHeightVariable) {
                        const viewElement = view.rootNodes[0];
                        view.context.markedToBeRemoved = true;
                        this._markedToBeRemovedCount++;
                        this.logger.log('removeViews: _autoHeightVariable markedToBeRemoved', viewIndex);
                    }
                    else {
                        this.logger.log('removeViews: recycleView ', viewIndex);
                        this._recycler.recycleView(view);
                        this._viewContainerRef.detach(i);
                        i--;
                    }
                }
            }
            this.logger.log('removeViews: recycler length', this._recycler.length());
        }
    }
    createViews() {
        const promises = [];
        if (this._viewContainerRef.length > 0 &&
            this._markedToBeRemovedCount < this._viewContainerRef.length) {
            this._fullScroll = false;
            this.logger.log(`createViews: length > 0, _firstItemPosition: ${this._firstItemIndex} _lastItemPosition: ${this._lastItemIndex}`);
            this.logger.log(`createViews: length > 0, _firstRequestedItemPosition: ${this._firstRequestedItemIndex} _lastRequestedItemPosition: ${this._lastRequestedItemIndex}`);
            for (let i = this._firstItemIndex - 1; i >= this._firstRequestedItemIndex; i--) {
                this.logger.log('createViews: getView -- ', i);
                promises.push(this.createView(i, true));
            }
            for (let i = this._lastItemIndex + 1; i <= this._lastRequestedItemIndex; i++) {
                this.logger.log('createViews: getView  ++ ', i);
                promises.push(this.createView(i, false));
            }
        }
        else {
            this.logger.log('createViews: length == 0');
            this._fullScroll = true;
            for (let i = this._firstRequestedItemIndex; i <= this._lastRequestedItemIndex; i++) {
                promises.push(this.createView(i, false));
            }
        }
        return Promise.all(promises);
    }
    prepareView(index, item) {
        let view;
        if ((view = this._recycler.recoverView())) {
            view.context.$implicit = item;
            view.context.index = index;
            view.context.count = this._collectionLength;
            view.context.recycled = true;
            view.reattach();
        }
        else {
            view = this._template.createEmbeddedView(new VirtualRepeatRow(item, index, this._collectionLength));
            view.context.recycled = false;
        }
        return view;
    }
    createViewForItem(index, item) {
        this.logger.log(`createViewForItem: _firstItemPosition: ${this._firstItemIndex} _firstRequestedItemPosition: ${this._firstRequestedItemIndex} length: ${this._viewContainerRef.length}`);
        let containerPos = index - (this._firstItemIndex || 0);
        if (Math.abs(containerPos) > this._guardItems) {
            containerPos = 0; // out of previous range
        }
        this.logger.log(`createViewForItem: create containerPos: ${containerPos} index: ${index}`);
        let view = null;
        if (this._viewContainerRef.length === 0) {
            view = this.prepareView(index, item);
            this._viewContainerRef.insert(view);
        }
        else {
            let inserted = false;
            if (containerPos >= 0) {
                // insert at the end
                for (let containerIndex = this._viewContainerRef.length - 1; containerIndex >= 0; containerIndex--) {
                    const viewIndex = (this._viewContainerRef.get(containerIndex)).context.index;
                    // this.logger.log(`createViewForItem: checking ${viewIndex} ++`);
                    if (index === viewIndex) {
                        this.logger.log(`createViewForItem: reasign ${viewIndex} ++`);
                        view = this._viewContainerRef.get(containerIndex);
                        view.context.$implicit = item;
                        view.reattach();
                        inserted = true;
                        break;
                    }
                    else if (index > viewIndex) {
                        view = this.prepareView(index, item);
                        this.logger.log(`createViewForItem: inserting in ${containerIndex + 1} ++`);
                        this._viewContainerRef.insert(view, containerIndex + 1);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    view = this.prepareView(index, item);
                    this.logger.log(`createViewForItem: inserting in first +++`);
                    this._viewContainerRef.insert(view, 0);
                }
            }
            else {
                // insert at the beginning
                for (let containerIndex = 0; containerIndex < this._viewContainerRef.length; containerIndex++) {
                    const viewIndex = (this._viewContainerRef.get(containerIndex)).context.index;
                    // this.logger.log(`createViewForItem: checking ${viewIndex} --`);
                    if (index === viewIndex) {
                        this.logger.log(`createViewForItem: reasign ${index} at ${containerIndex} --`, item);
                        view = this._viewContainerRef.get(containerIndex);
                        view.context.$implicit = item;
                        view.reattach();
                        inserted = true;
                        break;
                    }
                    else if (index < viewIndex) {
                        view = this.prepareView(index, item);
                        this.logger.log(`createViewForItem: inserting in ${containerIndex} --`);
                        this._viewContainerRef.insert(view, containerIndex);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    view = this.prepareView(index, item);
                    this.logger.log(`createViewForItem: inserting in last ---`);
                    this._viewContainerRef.insert(view);
                }
            }
        }
        if (view) {
            this.applyStyles(index, view);
        }
        return view;
    }
    applyStyles(index, view) {
        const viewContent = view.rootNodes[0];
        if (!this._virtualRepeatContainer._autoHeight) {
            viewContent.style.height = `${this._virtualRepeatContainer.getRowHeight()}px`;
        }
        else {
            viewContent.style.height = undefined;
        }
        viewContent.style.boxSizing = 'border-box';
        if (this._virtualRepeatContainer._autoHeightVariable) {
            view.context.previousDisplay = viewContent.style.display;
            viewContent.style.display = 'none'; // will be shown when processing finished
            this.logger.log(`applyStyles: _autoHeightVariable creaded view on ${index} recycled: ${view.context.recycled}`);
        }
    }
    onProcessing(processing) {
        if (processing === false) {
            // processing finished
            this.logger.log('onProcessing: finished. Dispatching layout');
            window.requestAnimationFrame(() => {
                this.logger.log('onProcessing: inside');
                this.dispatchLayout();
                this.logger.log('onProcessing: layout done rowHeight', this._virtualRepeatContainer.getRowHeight());
            });
        }
    }
    dispatchLayout() {
        let totalHeight = 0;
        let totalRemovedHeight = 0;
        let totalAddedHeight = 0;
        let guardHeight = 0;
        let meanHeight = 0;
        if (this._viewContainerRef.length === 0) {
            return;
        }
        if (this._virtualRepeatContainer._autoHeight) {
            if (this._virtualRepeatContainer._autoHeightVariable) {
                this.logger.log(`dispatchLayout: _autoHeightVariable enter ${this._viewContainerRef.length}`);
                // show / recycle views in _autoHeightVariable mode
                for (let containerIndex = 0; containerIndex < this._viewContainerRef.length; containerIndex++) {
                    const view = (this._viewContainerRef.get(containerIndex));
                    const viewElement = view.rootNodes[0];
                    if (view.context.previousDisplay !== undefined) {
                        viewElement.style.display = view.context.previousDisplay;
                        this.logger.log(`dispatchLayout: _autoHeightVariable showing ${view.context.index}`);
                    }
                    if (view.context.markedToBeRemoved) {
                        totalRemovedHeight += this.getElementHeight(viewElement);
                        this._recycler.recycleView(view);
                        this._viewContainerRef.detach(containerIndex);
                        this.logger.log(`dispatchLayout: _autoHeightVariable removing ${view.context.index} recycler lenght: ${this._recycler.length()}`);
                        containerIndex--;
                        delete view.context.markedToBeRemoved;
                    }
                }
            }
            // compute meanHeight
            for (let containerIndex = 0; containerIndex < this._viewContainerRef.length; containerIndex++) {
                const view = this._viewContainerRef.get(containerIndex);
                const viewElement = view.rootNodes[0];
                const height = this.getElementHeight(viewElement);
                this.logger.log(`dispatchLayout: index: ${containerIndex} height: ${height}`);
                totalHeight += height;
                if (containerIndex < this._guardItems) {
                    guardHeight += height;
                }
                if (this._virtualRepeatContainer._autoHeightVariable) {
                    if (view.context.previousDisplay !== undefined) {
                        this.logger.log(`dispatchLayout: totalAddedHeight: ${totalAddedHeight}`);
                        totalAddedHeight += height;
                        if (this._virtualRepeatContainer._autoHeightVariableData.itemsCount <
                            this._collectionLength) {
                            this._virtualRepeatContainer._autoHeightVariableData.totalHeight += height;
                            this._virtualRepeatContainer._autoHeightVariableData.itemsCount++;
                        }
                        delete view.context.previousDisplay;
                    }
                }
            }
            meanHeight = totalHeight / this._viewContainerRef.length;
            if (!this._virtualRepeatContainer._autoHeightComputed) {
                this._virtualRepeatContainer.rowHeight = meanHeight;
                this.logger.log('dispatchLayout: autoHeight rowHeight updated ' + meanHeight);
                this._virtualRepeatContainer._autoHeightComputed = true;
                this.requestMeasure.next();
            }
            else if (meanHeight !== this._virtualRepeatContainer.getRowHeight()) {
                this._virtualRepeatContainer._autoHeightVariable = true;
                this.logger.log('dispatchLayout: autoHeightVariable rowHeight updated ' +
                    this._virtualRepeatContainer.getRowHeight());
            }
            if (this._virtualRepeatContainer._autoHeightVariable) {
                if (this._virtualRepeatContainer._autoHeightVariableData.itemsCount === 0) {
                    // first page
                    this._virtualRepeatContainer._autoHeightVariableData.totalHeight = totalHeight;
                    this._virtualRepeatContainer._autoHeightVariableData.itemsCount = this._viewContainerRef.length;
                }
                this._virtualRepeatContainer.rowHeight =
                    this._virtualRepeatContainer._autoHeightVariableData.totalHeight /
                        this._virtualRepeatContainer._autoHeightVariableData.itemsCount;
                if (this._fullScroll) {
                    this._virtualRepeatContainer.translateY = this._scrollY - guardHeight;
                }
                else {
                    // partial scroll
                    this.logger.log(`dispatchLayout: _autoHeightVariable partial scroll`);
                    let translateY = this._virtualRepeatContainer.translateY +
                        (this._virtualRepeatContainer.currentScrollState ===
                            SCROLL_STATE.SCROLLING_DOWN
                            ? totalRemovedHeight
                            : -totalAddedHeight);
                    // check out of scroll
                    const offset = this._scrollY - translateY;
                    if (offset > guardHeight * 1.5 || offset < guardHeight * 0.5) {
                        translateY = this._scrollY - guardHeight;
                        this.logger.log(`dispatchLayout: _autoHeightVariable out of scroll adjusted`);
                    }
                    this._virtualRepeatContainer.translateY = translateY;
                }
                if (this._scrollY === 0) {
                    // adjust on limits
                    this._virtualRepeatContainer.translateY = 0;
                }
                this.logger.log(`dispatchLayout: _autoHeightVariable rowHeight: ${this._virtualRepeatContainer.getRowHeight()}
                         scrollY: ${this._scrollY} scrollState: ${this._virtualRepeatContainer.currentScrollState}
                         totalRemovedHeight: ${totalRemovedHeight} totalAddedHeight: ${totalAddedHeight}
                         translateY: ${this._virtualRepeatContainer.translateY}`);
            }
        }
    }
    getElementHeight(viewElement) {
        return viewElement.offsetHeight || viewElement.children['0'].clientHeight;
    }
}
VirtualRepeatBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatBase, deps: [{ token: VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeatBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatBase, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatBase, decorators: [{
            type: Directive,
            args: [{}]
        }], ctorParameters: function () { return [{ type: VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: LoggerService }]; } });

// tslint:disable-next-line:directive-class-suffix
class VirtualRepeat extends VirtualRepeatBase {
    constructor(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger) {
        super(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger);
    }
    set virtualRepeatForTrackBy(fn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (console && console.warn) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation. ` +
                    ` for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    get virtualRepeatForTrackBy() {
        return this._trackByFn;
    }
    set virtualRepeatForTemplate(value) {
        if (value) {
            this._template = value;
        }
    }
    ngOnChanges(changes) {
        if ('virtualRepeatOf' in changes) {
            this.detachAllViews();
            // React on virtualRepeatOf only once all inputs have been initialized
            const value = changes['virtualRepeatOf'].currentValue;
            if (this._collection === undefined) {
                this._collection = value;
                this.requestMeasure.next();
            }
            else if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this._trackByFn);
                }
                catch (e) {
                    throw new Error(`Cannot find a differ supporting object '${value}'
                    of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
    }
    ngDoCheck() {
        if (this._differ) {
            const changes = this._differ.diff(this.virtualRepeatOf);
            if (changes) {
                this.applyChanges(changes);
            }
        }
    }
    applyChanges(changes) {
        if (!this._collection) {
            this._collection = [];
        }
        let isMeasurementRequired = false;
        changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                // new item
                // this.logger.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(currentIndex, 0, item.item);
            }
            else if (currentIndex == null) {
                // remove item
                this.logger.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            }
            else {
                // move item
                this.logger.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });
        changes.forEachIdentityChange((record) => {
            this._collection[record.currentIndex] = record.item;
        });
        if (isMeasurementRequired) {
            this.requestMeasure.next();
        }
        else {
            this.requestLayout.next();
        }
    }
    measure() {
        this.logger.log('measure: enter');
        this._collectionLength =
            !this._collection || this._collection.length === 0
                ? 0
                : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight =
            this._virtualRepeatContainer.getRowHeight() * this._collectionLength;
        this._isInMeasure = false;
        this.requestLayout.next();
        this.logger.log('measure: exit');
    }
    createView(index) {
        const item = this._collection[index];
        const view = this.createViewForItem(index, item);
        return Promise.resolve(view);
    }
}
VirtualRepeat.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeat, deps: [{ token: VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeat.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeat, selector: "[virtualRepeat]", inputs: { virtualRepeatOf: "virtualRepeatOf", virtualRepeatForTrackBy: "virtualRepeatForTrackBy", virtualRepeatForTemplate: "virtualRepeatForTemplate" }, usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeat, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[virtualRepeat]'
                }]
        }], ctorParameters: function () { return [{ type: VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: LoggerService }]; }, propDecorators: { virtualRepeatOf: [{
                type: Input
            }], virtualRepeatForTrackBy: [{
                type: Input
            }], virtualRepeatForTemplate: [{
                type: Input
            }] } });
function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}

// tslint:disable-next-line:directive-class-suffix
class VirtualRepeatAsynch extends VirtualRepeatBase {
    constructor(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger) {
        super(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger);
    }
    set virtualRepeatAsynchForTrackBy(fn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (console && console.warn) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation` +
                    ` for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    get virtualRepeatAsynchForTrackBy() {
        return this._trackByFn;
    }
    set virtualRepeatAsynchForTemplate(value) {
        if (value) {
            this._template = value;
        }
    }
    ngOnChanges(changes) {
        if ('virtualRepeatAsynchOf' in changes) {
            this.detachAllViews();
            // React on virtualRepeatAsynchOf only once all inputs have been initialized
            const value = changes['virtualRepeatAsynchOf'].currentValue;
            this._collection = value;
            this.requestMeasure.next();
        }
    }
    measure() {
        if (!this._collection) {
            return;
        }
        this._isInMeasure = true;
        this._virtualRepeatContainer.processing = true;
        this._collection.getLength().then((length) => {
            this._collectionLength = length;
            this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer.getRowHeight() * length;
            this._isInMeasure = false;
            this.requestLayout.next();
        });
    }
    createView(index, addBefore) {
        let view;
        if (!this._virtualRepeatContainer._autoHeightVariable && !!(view = this._recycler.recoverView())) {
            // recover recycled views. Will be filled with new item once received.
            const embedView = view;
            embedView.context.index = index;
            embedView.rootNodes[0].style.height = this._virtualRepeatContainer.getRowHeight() + 'px';
            embedView.context.$implicit = this.emptyItem(embedView.context.$implicit);
            view.reattach();
            this._viewContainerRef.insert(view, (addBefore ? 0 : undefined));
        }
        return this._collection.getItem(index).then((item) => {
            this.createViewForItem(index, item);
            return view;
        });
    }
}
VirtualRepeatAsynch.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAsynch, deps: [{ token: VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeatAsynch.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatAsynch, selector: "[virtualRepeatAsynch]", inputs: { virtualRepeatAsynchOf: "virtualRepeatAsynchOf", virtualRepeatAsynchForTrackBy: "virtualRepeatAsynchForTrackBy", virtualRepeatAsynchForTemplate: "virtualRepeatAsynchForTemplate" }, usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAsynch, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[virtualRepeatAsynch]'
                }]
        }], ctorParameters: function () { return [{ type: VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: LoggerService }]; }, propDecorators: { virtualRepeatAsynchOf: [{
                type: Input
            }], virtualRepeatAsynchForTrackBy: [{
                type: Input
            }], virtualRepeatAsynchForTemplate: [{
                type: Input
            }] } });

// tslint:disable-next-line:directive-class-suffix
class VirtualRepeatReactive extends VirtualRepeatBase {
    constructor(virtualRepeatContainer, differs, template, viewContainerRef, logger) {
        super(virtualRepeatContainer, differs, template, viewContainerRef, logger);
        this._viewDeferreds = [];
    }
    static ngTemplateContextGuard(dir, ctx) {
        return true;
    }
    set virtualRepeatReactiveForTrackBy(fn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (console && console.warn) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.
          See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation
          for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    get virtualRepeatReactiveForTrackBy() {
        return this._trackByFn;
    }
    set virtualRepeatReactiveForTemplate(value) {
        if (value) {
            this._template = value;
        }
    }
    ngOnChanges(changes) {
        if ('virtualRepeatReactiveOf' in changes) {
            this.detachAllViews();
            // React on virtualRepeatReactiveOf only once all inputs have been initialized
            let value = changes['virtualRepeatReactiveOf'].currentValue;
            if (!value) {
                return;
            }
            if (value.create !== undefined) {
                // is factory?
                value = value.create(); // create reactive collection
            }
            this._collection = value;
            this._collection.connect();
            this.logger.log('ngOnChanges: this._collection asigned.');
            this._subscription.add(this._collection.length$.subscribe(lenght => this.onLength(lenght), error => {
                this.onLength(0);
            }));
            this._subscription.add(this._collection.items$.subscribe(data => {
                try {
                    this.onItem(data);
                }
                catch (exc) {
                    this.logger.log('onItem: Exception', exc);
                }
            }));
            this._subscription.add(this._collection.reset$.subscribe(() => {
                this.reset();
            }));
            this.requestMeasure.next();
        }
    }
    connect() {
        super.connect();
    }
    disconnect() {
        super.disconnect();
        if (!!this._collection) {
            this._collection.disconnect();
        }
    }
    measure() {
        this.logger.log('measure: enter');
        if (!this._collection) {
            this.logger.log('measure: !this._collection. Exit');
            return;
        }
        this._virtualRepeatContainer.processing = true;
        this.logger.log('measure: requestLength -> onLength');
        this._collection.requestLength();
    }
    onLength(length) {
        this.logger.log('onLength: enter', this._collectionLength, length);
        this._isInMeasure = true;
        this._collectionLength = length;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer.getRowHeight() * length;
        // calculate a approximate number of which a view can contain
        this._isInMeasure = false;
        this.logger.log('onLength: requestLayout');
        if (length > 0) {
            this.requestLayout.next();
        }
        else {
            this._virtualRepeatContainer.processing = false;
        }
    }
    createView(index, addBefore) {
        this.logger.log('createView: requestItem: ', index);
        let view;
        if (!this._virtualRepeatContainer._autoHeightVariable && !!(view = this._recycler.recoverView())) {
            // recover recycled views. Will be filled with new item once received.
            const embedView = view;
            embedView.context.index = index;
            embedView.rootNodes[0].style.height = this._virtualRepeatContainer.getRowHeight() + 'px';
            embedView.context.$implicit = this.emptyItem(embedView.context.$implicit);
            embedView.context.recycled = true;
            this._viewContainerRef.insert(view, addBefore ? 0 : undefined);
            view.reattach();
        }
        this.logger.log('createView: _viewDeferreds add: ', index);
        this._viewDeferreds[index] = new Deferred();
        this._collection.requestItem(index);
        return this._viewDeferreds[index].promise;
    }
    onItem(data) {
        const { index, item } = data;
        this.logger.log('onItem: enter', index, item);
        const view = this.createViewForItem(index, item);
        if (this._viewDeferreds[index]) {
            this.logger.log('onItem: _viewPromises resolve: ', index);
            this._viewDeferreds[index].resolve(view);
        }
    }
    onProcessing(processing) {
        if (!processing) {
            // processing finished
            this.logger.log('onProcessing: _viewDeferreds deleting');
            this._viewDeferreds = [];
        }
        super.onProcessing(processing);
    }
}
VirtualRepeatReactive.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatReactive, deps: [{ token: VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeatReactive.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatReactive, selector: "[virtualRepeatReactive]", inputs: { virtualRepeatReactiveForTrackBy: "virtualRepeatReactiveForTrackBy", virtualRepeatReactiveForTemplate: "virtualRepeatReactiveForTemplate", virtualRepeatReactiveOf: "virtualRepeatReactiveOf" }, usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatReactive, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[virtualRepeatReactive]'
                }]
        }], ctorParameters: function () { return [{ type: VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: LoggerService }]; }, propDecorators: { virtualRepeatReactiveForTrackBy: [{
                type: Input
            }], virtualRepeatReactiveForTemplate: [{
                type: Input
            }], virtualRepeatReactiveOf: [{
                type: Input
            }] } });

class VirtualRepeatAngularLibModule {
}
VirtualRepeatAngularLibModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
VirtualRepeatAngularLibModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, declarations: [VirtualRepeatContainer,
        VirtualRepeat,
        VirtualRepeatAsynch,
        VirtualRepeatReactive], imports: [BrowserModule], exports: [VirtualRepeatContainer,
        VirtualRepeat,
        VirtualRepeatAsynch,
        VirtualRepeatReactive] });
VirtualRepeatAngularLibModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, providers: [
        LoggerService
    ], imports: [BrowserModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        BrowserModule
                    ],
                    declarations: [
                        VirtualRepeatContainer,
                        VirtualRepeat,
                        VirtualRepeatAsynch,
                        VirtualRepeatReactive
                    ],
                    providers: [
                        LoggerService
                    ],
                    exports: [
                        VirtualRepeatContainer,
                        VirtualRepeat,
                        VirtualRepeatAsynch,
                        VirtualRepeatReactive
                    ]
                }]
        }] });

/*
 * Public API Surface of virtual-repeat-angular-lib
 */

/**
 * Generated bundle index. Do not edit.
 */

export { LoggerService, SCROLL_STATE, SCROLL_STOP_TIME_THRESHOLD, VirtualRepeat, VirtualRepeatAngularLibModule, VirtualRepeatAsynch, VirtualRepeatContainer, VirtualRepeatReactive, deglitch, deglitchFalse, getScrollBarWidth, getTypeNameForDebugging, throttleTimeUntilChanged };
//# sourceMappingURL=virtual-repeat-angular.mjs.map
