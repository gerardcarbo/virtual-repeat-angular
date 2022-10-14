import { Directive } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { filter, debounceTime, tap } from 'rxjs/operators';
import { SCROLL_STATE } from './virtual-repeat-container';
import * as i0 from "@angular/core";
import * as i1 from "./virtual-repeat-container";
import * as i2 from "./logger.service";
export class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        Object.freeze(this);
    }
}
export class VirtualRepeatRow {
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
export class Recycler {
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
export class VirtualRepeatBase {
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
VirtualRepeatBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatBase, deps: [{ token: i1.VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: i2.LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeatBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatBase, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatBase, decorators: [{
            type: Directive,
            args: [{}]
        }], ctorParameters: function () { return [{ type: i1.VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: i2.LoggerService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQuYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3NyYy9saWIvdmlydHVhbC1yZXBlYXQuYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBVUwsU0FBUyxFQUNWLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxZQUFZLEVBQWMsT0FBTyxFQUFtQixNQUFNLE1BQU0sQ0FBQztBQUMxRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQXFCLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUUsT0FBTyxFQUVMLFlBQVksRUFDYixNQUFNLDRCQUE0QixDQUFDOzs7O0FBR3BDLE1BQU0sT0FBTyxRQUFRO0lBS25CO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM3QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUNTLFNBQWMsRUFDZCxLQUFhLEVBQ2IsS0FBYTtRQUZiLGNBQVMsR0FBVCxTQUFTLENBQUs7UUFDZCxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUNsQixDQUFDO0lBRUwsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcs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QUFpQixJQUFJLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCOytDQUNsRSxrQkFBa0Isc0JBQXNCLGdCQUFnQjt1Q0FDaEUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDM0U7U0FDRjtJQUNILENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxXQUF3QjtRQUMvQyxPQUFPLFdBQVcsQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDNUUsQ0FBQzs7OEdBN3JCbUIsaUJBQWlCO2tHQUFqQixpQkFBaUI7MkZBQWpCLGlCQUFpQjtrQkFGdEMsU0FBUzttQkFBQyxFQUNWIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgSXRlcmFibGVEaWZmZXIsXHJcbiAgSXRlcmFibGVEaWZmZXJzLFxyXG4gIFRlbXBsYXRlUmVmLFxyXG4gIFRyYWNrQnlGdW5jdGlvbixcclxuICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gIFZpZXdSZWYsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBEaXJlY3RpdmVcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGZpbHRlciwgZGVib3VuY2VUaW1lLCB0YXAsIHRocm90dGxlVGltZSwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1xyXG4gIFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgU0NST0xMX1NUQVRFXHJcbn0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnZXIuc2VydmljZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgRGVmZXJyZWQ8VD4ge1xyXG4gIHB1YmxpYyBwcm9taXNlOiBQcm9taXNlPFQ+O1xyXG4gIHB1YmxpYyByZXNvbHZlOiAodmFsdWU6IFQpID0+IHZvaWQ7XHJcbiAgcHVibGljIHJlamVjdDogKHZhbHVlOiBUKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdFJvdyB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgJGltcGxpY2l0OiBhbnksXHJcbiAgICBwdWJsaWMgaW5kZXg6IG51bWJlcixcclxuICAgIHB1YmxpYyBjb3VudDogbnVtYmVyXHJcbiAgKSB7IH1cclxuXHJcbiAgZ2V0IGZpcnN0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPT09IDA7XHJcbiAgfVxyXG5cclxuICBnZXQgbGFzdCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTtcclxuICB9XHJcblxyXG4gIGdldCBldmVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5kZXggJSAyID09PSAwO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG9kZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhdGhpcy5ldmVuO1xyXG4gIH1cclxuXHJcbiAgcHJldmlvdXNEaXNwbGF5OiBzdHJpbmc7XHJcbiAgbWFya2VkVG9CZVJlbW92ZWQ6IGJvb2xlYW47XHJcbiAgcmVjeWNsZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSZWN5Y2xlciB7XHJcbiAgcHJpdmF0ZSBfbGltaXQgPSAwO1xyXG4gIHByaXZhdGUgX3NjcmFwVmlld3M6IFZpZXdSZWZbXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsaW1pdDogbnVtYmVyID0gMCkge1xyXG4gICAgdGhpcy5fbGltaXQgPSBsaW1pdDtcclxuICB9XHJcblxyXG4gIGxlbmd0aCgpIHtcclxuICAgIHJldHVybiB0aGlzLl9zY3JhcFZpZXdzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIHJlY292ZXJWaWV3KCk6IEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2NyYXBWaWV3cy5wb3AoKSBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz47XHJcbiAgfVxyXG5cclxuICByZWN5Y2xlVmlldyh2aWV3OiBWaWV3UmVmKSB7XHJcbiAgICB2aWV3LmRldGFjaCgpO1xyXG4gICAgdGhpcy5fc2NyYXBWaWV3cy5wdXNoKHZpZXcpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2NyYXAgdmlldyBjb3VudCBzaG91bGQgbm90IGV4Y2VlZCB0aGUgbnVtYmVyIG9mIGN1cnJlbnQgYXR0YWNoZWQgdmlld3MuXHJcbiAgICovXHJcbiAgcHJ1bmVTY3JhcFZpZXdzKCkge1xyXG4gICAgaWYgKHRoaXMuX2xpbWl0IDw9IDEpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgd2hpbGUgKHRoaXMuX3NjcmFwVmlld3MubGVuZ3RoID4gdGhpcy5fbGltaXQpIHtcclxuICAgICAgdGhpcy5fc2NyYXBWaWV3cy5wb3AoKS5kZXN0cm95KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRTY3JhcFZpZXdzTGltaXQobGltaXQ6IG51bWJlcikge1xyXG4gICAgdGhpcy5fbGltaXQgPSBsaW1pdDtcclxuICAgIHRoaXMucHJ1bmVTY3JhcFZpZXdzKCk7XHJcbiAgfVxyXG5cclxuICBjbGVhbigpIHtcclxuICAgIHRoaXMuX3NjcmFwVmlld3MuZm9yRWFjaCgodmlldzogVmlld1JlZikgPT4ge1xyXG4gICAgICB2aWV3LmRlc3Ryb3koKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fc2NyYXBWaWV3cyA9IFtdO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVmlydHVhbFJlcGVhdCB7XHJcbiAgcmVzZXQoKTogdm9pZDtcclxufVxyXG5cclxuQERpcmVjdGl2ZSh7XHJcbn0pXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaXJ0dWFsUmVwZWF0QmFzZTxUPlxyXG4gIGltcGxlbWVudHMgSVZpcnR1YWxSZXBlYXQsIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBwcm90ZWN0ZWQgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI8VD47XHJcbiAgcHJvdGVjdGVkIF90cmFja0J5Rm46IFRyYWNrQnlGdW5jdGlvbjxUPjtcclxuICBwcm90ZWN0ZWQgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xyXG4gIC8qKlxyXG4gICAqIHNjcm9sbCBvZmZzZXQgb2YgeS1heGlzIGluIHBpeGVsXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIF9zY3JvbGxZID0gMDtcclxuICAvKipcclxuICAgKiBjdXJyZW50IGZpcnN0IGl0ZW0gaW5kZXggaW4gY29sbGVjdGlvblxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBfZmlyc3RJdGVtSW5kZXg6IG51bWJlcjtcclxuICAvKipcclxuICAgKiBjdXJyZW50IGxhc3QgaXRlbSBpbmRleCBpbiBjb2xsZWN0aW9uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIF9sYXN0SXRlbUluZGV4OiBudW1iZXI7XHJcbiAgLyoqXHJcbiAgICogZmlyc3QgcmVxdWVzdGVkIGl0ZW0gaW5kZXggaW4gY29sbGVjdGlvblxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBfZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXg6IG51bWJlcjtcclxuICAvKipcclxuICAgKiBsYXN0IHJlcXVlc3RlZCBpdGVtIGluZGV4IGluIGNvbGxlY3Rpb25cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXg6IG51bWJlcjtcclxuICAvKipcclxuICAgKiBpdGVtcyBpbnNlcnRlZCBhZnRlciBhbmQgYmVmb3JlIHRoZSB2aWV3IGFyZWFcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgX2d1YXJkSXRlbXMgPSAxMDtcclxuXHJcbiAgcHJvdGVjdGVkIF9jb250YWluZXJXaWR0aDogbnVtYmVyO1xyXG4gIHByb3RlY3RlZCBfY29udGFpbmVySGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gIHByb3RlY3RlZCBfaXNJbkxheW91dCA9IGZhbHNlO1xyXG5cclxuICBwcm90ZWN0ZWQgX2lzSW5NZWFzdXJlID0gZmFsc2U7XHJcblxyXG4gIHByb3RlY3RlZCBfcGVuZGluZ01lYXN1cmVtZW50OiBhbnk7XHJcblxyXG4gIHByb3RlY3RlZCBfY29sbGVjdGlvbkxlbmd0aCA9IC0xO1xyXG5cclxuICBwcm90ZWN0ZWQgX3JlY3ljbGVyOiBSZWN5Y2xlcjtcclxuXHJcbiAgcHJvdGVjdGVkIF9tYXJrZWRUb0JlUmVtb3ZlZENvdW50OiBudW1iZXI7XHJcblxyXG4gIHByb3RlY3RlZCBfZnVsbFNjcm9sbDogYm9vbGVhbjtcclxuICBwcm90ZWN0ZWQgX3Byb2Nlc3NUaW1lb3V0ID0gNTAwMDtcclxuICBwcm90ZWN0ZWQgX2RvUHJvY2Vzc1RpbWVvdXQ6IGFueTtcclxuXHJcbiAgcHVibGljIHJlcXVlc3RNZWFzdXJlOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwcm90ZWN0ZWQgX3JlcXVlc3RNZWFzdXJlRmlsdGVyZWQ6IE9ic2VydmFibGU8YW55PiA9IHRoaXMucmVxdWVzdE1lYXN1cmUucGlwZShcclxuICAgIHRhcCgoKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZygncmVxdWVzdE1lYXN1cmVGaWx0ZXJlZDogcmVxdWVzdGVkJyk7XHJcbiAgICB9KSxcclxuICAgIGRlYm91bmNlVGltZSg2MCksXHJcbiAgICBmaWx0ZXIoKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgYHJlcXVlc3RNZWFzdXJlRmlsdGVyZWQ6IGVudGVyIGlzSW5NZWFzdXJlOiBgICtcclxuICAgICAgICBgJHt0aGlzLl9pc0luTWVhc3VyZX0gaXNJbkxheW91dDogJHt0aGlzLl9pc0luTGF5b3V0fWBcclxuICAgICAgKTtcclxuICAgICAgaWYgKHRoaXMuX2lzSW5NZWFzdXJlIHx8IHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ3JlcXVlc3RNZWFzdXJlRmlsdGVyZWQ6IHJldHJ5aW5nLi4uJyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlLm5leHQoKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAhdGhpcy5faXNJbk1lYXN1cmUgJiYgIXRoaXMuX2lzSW5MYXlvdXQ7XHJcbiAgICB9KVxyXG4gICk7XHJcblxyXG4gIHB1YmxpYyByZXF1ZXN0TGF5b3V0OiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwcm90ZWN0ZWQgX3JlcXVlc3RMYXlvdXRGaWx0ZXJlZDogT2JzZXJ2YWJsZTxhbnk+ID0gdGhpcy5yZXF1ZXN0TGF5b3V0LnBpcGUoXHJcbiAgICB0YXAoKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlci5sb2coJ3JlcXVlc3RMYXlvdXRGaWx0ZXJlZDogcmVxdWVzdGVkJyk7XHJcbiAgICB9KSxcclxuICAgIGZpbHRlcigoKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICBgcmVxdWVzdExheW91dEZpbHRlcmVkOiBlbnRlciBpc0luTWVhc3VyZTogJHtcclxuICAgICAgICB0aGlzLl9pc0luTWVhc3VyZVxyXG4gICAgICAgIH0gaXNJbkxheW91dDogJHt0aGlzLl9pc0luTGF5b3V0fWBcclxuICAgICAgKTtcclxuICAgICAgaWYgKHRoaXMuX2lzSW5NZWFzdXJlIHx8IHRoaXMuX2lzSW5MYXlvdXQpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ3JlcXVlc3RMYXlvdXRGaWx0ZXJlZDogcmV0cnlpbmcuLi4nKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVxdWVzdExheW91dC5uZXh0KCk7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gIXRoaXMuX2lzSW5NZWFzdXJlICYmICF0aGlzLl9pc0luTGF5b3V0O1xyXG4gICAgfSlcclxuICApO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByb3RlY3RlZCBfdmlydHVhbFJlcGVhdENvbnRhaW5lcjogVmlydHVhbFJlcGVhdENvbnRhaW5lcixcclxuICAgIHByb3RlY3RlZCBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgcHJvdGVjdGVkIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VmlydHVhbFJlcGVhdFJvdz4sXHJcbiAgICBwcm90ZWN0ZWQgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBwcm90ZWN0ZWQgbG9nZ2VyOiBMb2dnZXJTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnZpcnR1YWxSZXBlYXQgPSB0aGlzO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNjb25uZWN0KCk7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgY29ubmVjdCgpIHtcclxuICAgIHRoaXMuX2ZpcnN0UmVxdWVzdGVkSXRlbUluZGV4ID0gdGhpcy5fbGFzdFJlcXVlc3RlZEl0ZW1JbmRleCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2F1dG9IZWlnaHRDb21wdXRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcmVjeWNsZXIgPSBuZXcgUmVjeWNsZXIoKTtcclxuICAgIHRoaXMucmVxdWVzdE1lYXN1cmUubmV4dCgpO1xyXG5cclxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXHJcbiAgICAgIHRoaXMuX3JlcXVlc3RNZWFzdXJlRmlsdGVyZWQuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICB0aGlzLm1lYXN1cmUoKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcclxuICAgICAgdGhpcy5fcmVxdWVzdExheW91dEZpbHRlcmVkLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sYXlvdXQoKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcclxuICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5zY3JvbGxQb3NpdGlvbiRcclxuICAgICAgICAucGlwZShcclxuICAgICAgICAgIGRlYm91bmNlVGltZSg2MCksXHJcbiAgICAgICAgICBmaWx0ZXIoc2Nyb2xsWSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgc2Nyb2xsWSA9PT0gMCB8fFxyXG4gICAgICAgICAgICAgIE1hdGguYWJzKHNjcm9sbFkgLSB0aGlzLl9zY3JvbGxZKSA+PVxyXG4gICAgICAgICAgICAgICh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmdldFJvd0hlaWdodCgpICogdGhpcy5fZ3VhcmRJdGVtcykgLyAyXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIClcclxuICAgICAgICAuc3Vic2NyaWJlKHNjcm9sbFkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXIubG9nKCdzY3JvbGxQb3NpdGlvbjogJywgc2Nyb2xsWSk7XHJcbiAgICAgICAgICB0aGlzLl9zY3JvbGxZID0gc2Nyb2xsWTtcclxuICAgICAgICAgIGlmIChzY3JvbGxZID49IDAgJiYgdGhpcy5fY29sbGVjdGlvbkxlbmd0aCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0Lm5leHQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKFxyXG4gICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnNpemVDaGFuZ2Uuc3Vic2NyaWJlKChbd2lkdGgsIGhlaWdodF0pID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ3NpemVDaGFuZ2U6ICcsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lcldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIGlmIChoZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlLm5leHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXHJcbiAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucHJvY2Vzc2luZ1JhdyQuc3Vic2NyaWJlKHByb2Nlc3NpbmcgPT5cclxuICAgICAgICB0aGlzLm9uUHJvY2Vzc2luZyhwcm9jZXNzaW5nKVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGRpc2Nvbm5lY3QoKSB7XHJcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX3JlY3ljbGVyLmNsZWFuKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKSB7XHJcbiAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnNjcm9sbFBvc2l0aW9uID0gMDtcclxuICAgIHRoaXMuX2NvbGxlY3Rpb25MZW5ndGggPSAtMTtcclxuICAgIHRoaXMuZGV0YWNoQWxsVmlld3MoKTtcclxuICAgIHRoaXMucmVxdWVzdE1lYXN1cmUubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZVZpZXcoXHJcbiAgICBpbmRleDogbnVtYmVyLFxyXG4gICAgYWRkQmVmb3JlOiBib29sZWFuXHJcbiAgKTogUHJvbWlzZTxWaWV3UmVmPjtcclxuXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IG1lYXN1cmUoKTogdm9pZDtcclxuXHJcbiAgcHJvdGVjdGVkIGRldGFjaEFsbFZpZXdzKCkge1xyXG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xyXG4gICAgdGhpcy5faXNJbkxheW91dCA9IGZhbHNlO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGVtcHR5SXRlbShpdGVtOiBhbnkpIHtcclxuICAgIGNvbnN0IG8gPSBBcnJheS5pc0FycmF5KGl0ZW0pID8gW10gOiB7fTtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIGl0ZW0pIHtcclxuICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGNvbnN0IHQgPSB0eXBlb2YgaXRlbVtrZXldO1xyXG4gICAgICAgIG9ba2V5XSA9IHQgPT09ICdvYmplY3QnID8gdGhpcy5lbXB0eUl0ZW0oaXRlbVtrZXldKSA6IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG87XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgbGF5b3V0KCkge1xyXG4gICAgdGhpcy5sb2dnZXIubG9nKCdsYXlvdXQ6IG9uIGxheW91dCcpO1xyXG4gICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuX2lzSW5MYXlvdXQgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRDb250YWluZXJTaXplKCk7XHJcbiAgICB0aGlzLl9jb250YWluZXJXaWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLl9jb2xsZWN0aW9uTGVuZ3RoIDw9IDApIHtcclxuICAgICAgdGhpcy5sb2dnZXIubG9nKCdsYXlvdXQ6IHRoaXMuX2lzSW5MYXlvdXQgPSBmYWxzZS4gZGV0YWNoQWxsVmlld3MnKTtcclxuICAgICAgdGhpcy5kZXRhY2hBbGxWaWV3cygpO1xyXG4gICAgICB0aGlzLnByb2Nlc3NpbmdEb25lKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuZmluZFJlcXVlc3RlZEluZGV4ZXNSYW5nZSgpO1xyXG4gICAgdGhpcy5yZW1vdmVWaWV3cygpO1xyXG4gICAgdGhpcy5jcmVhdGVWaWV3cygpLnRoZW4oKCkgPT4ge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fZG9Qcm9jZXNzVGltZW91dCk7XHJcbiAgICAgIHRoaXMucHJvY2Vzc2luZ0RvbmUoKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fZG9Qcm9jZXNzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnByb2Nlc3NpbmdEb25lKCk7XHJcbiAgICB9LCB0aGlzLl9wcm9jZXNzVGltZW91dCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByb2Nlc3NpbmdEb25lKCkge1xyXG4gICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLl9pc0luTGF5b3V0ID0gZmFsc2U7XHJcbiAgICB0aGlzLl9yZWN5Y2xlci5wcnVuZVNjcmFwVmlld3MoKTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBmaW5kUmVxdWVzdGVkSW5kZXhlc1JhbmdlKCkge1xyXG4gICAgbGV0IGZpcnN0UG9zaXRpb247XHJcblxyXG4gICAgdGhpcy5fZmlyc3RJdGVtSW5kZXggPSB0aGlzLl9maXJzdFJlcXVlc3RlZEl0ZW1JbmRleDtcclxuICAgIHRoaXMuX2xhc3RJdGVtSW5kZXggPSB0aGlzLl9sYXN0UmVxdWVzdGVkSXRlbUluZGV4O1xyXG4gICAgdGhpcy5sb2dnZXIubG9nKFxyXG4gICAgICBgZmluZFJlcXVlc3RlZEluZGV4ZXNSYW5nZTogX2F1dG9IZWlnaHRWYXJpYWJsZTogJHtcclxuICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlXHJcbiAgICAgIH0gZmlyc3RJdGVtUG9zaXRpb246ICR7dGhpcy5fZmlyc3RJdGVtSW5kZXh9YFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlKSB7XHJcbiAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuaG9sZGVySGVpZ2h0ID1cclxuICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmdldFJvd0hlaWdodCgpICogdGhpcy5fY29sbGVjdGlvbkxlbmd0aDtcclxuXHJcbiAgICAgIGZpcnN0UG9zaXRpb24gPSBNYXRoLmZsb29yKFxyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb25MZW5ndGggKlxyXG4gICAgICAgICh0aGlzLl9zY3JvbGxZIC8gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5ob2xkZXJIZWlnaHQpXHJcbiAgICAgICk7XHJcbiAgICAgIGxldCBsYXN0UG9zaXRpb24gPVxyXG4gICAgICAgIE1hdGguY2VpbChcclxuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckhlaWdodCAvIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuZ2V0Um93SGVpZ2h0KClcclxuICAgICAgICApICsgZmlyc3RQb3NpdGlvbjtcclxuICAgICAgdGhpcy5fZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXggPSBNYXRoLm1heChcclxuICAgICAgICBmaXJzdFBvc2l0aW9uIC0gdGhpcy5fZ3VhcmRJdGVtcyxcclxuICAgICAgICAwXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXggPSBNYXRoLm1pbihcclxuICAgICAgICBsYXN0UG9zaXRpb24gKyB0aGlzLl9ndWFyZEl0ZW1zLFxyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb25MZW5ndGggLSAxXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICBgZmluZFJlcXVlc3RlZEluZGV4ZXNSYW5nZTogX2F1dG9IZWlnaHRWYXJpYWJsZSBzY3JvbGxZOiBcclxuICAgICAgICAke3RoaXMuX3Njcm9sbFl9IGhvbGRlckhlaWdodDogJHt0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodH1gXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICBgZmluZFJlcXVlc3RlZEluZGV4ZXNSYW5nZTogX2F1dG9IZWlnaHRWYXJpYWJsZSBmaXJzdFJlcXVlc3RlZEl0ZW1Qb3NpdGlvbjogJHtcclxuICAgICAgICB0aGlzLl9maXJzdFJlcXVlc3RlZEl0ZW1JbmRleFxyXG4gICAgICAgIH0gbGFzdFJlcXVlc3RlZEl0ZW1Qb3NpdGlvbjogJHt0aGlzLl9sYXN0UmVxdWVzdGVkSXRlbUluZGV4fWBcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZpcnN0UG9zaXRpb24gPSBNYXRoLmZsb29yKFxyXG4gICAgICAgIHRoaXMuX3Njcm9sbFkgLyB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmdldFJvd0hlaWdodCgpXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGZpcnN0UG9zaXRpb25PZmZzZXQgPVxyXG4gICAgICAgIHRoaXMuX3Njcm9sbFkgLSBmaXJzdFBvc2l0aW9uICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRSb3dIZWlnaHQoKTtcclxuICAgICAgbGV0IGxhc3RQb3NpdGlvbiA9XHJcbiAgICAgICAgTWF0aC5jZWlsKFxyXG4gICAgICAgICAgKHRoaXMuX2NvbnRhaW5lckhlaWdodCArIGZpcnN0UG9zaXRpb25PZmZzZXQpIC9cclxuICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuZ2V0Um93SGVpZ2h0KClcclxuICAgICAgICApICsgZmlyc3RQb3NpdGlvbjtcclxuICAgICAgdGhpcy5fZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXggPSBNYXRoLm1heChcclxuICAgICAgICBmaXJzdFBvc2l0aW9uIC0gdGhpcy5fZ3VhcmRJdGVtcyxcclxuICAgICAgICAwXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXggPSBNYXRoLm1pbihcclxuICAgICAgICBsYXN0UG9zaXRpb24gKyB0aGlzLl9ndWFyZEl0ZW1zLFxyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb25MZW5ndGggLSAxXHJcbiAgICAgICk7XHJcbiAgICAgIGlmICh0aGlzLl9sYXN0UmVxdWVzdGVkSXRlbUluZGV4IC0gdGhpcy5fZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXggPiA1MCkge1xyXG4gICAgICAgIHRoaXMuX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXggPSB0aGlzLl9maXJzdFJlcXVlc3RlZEl0ZW1JbmRleCArIDUwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnRyYW5zbGF0ZVkgPVxyXG4gICAgICAgIHRoaXMuX2ZpcnN0UmVxdWVzdGVkSXRlbUluZGV4ICogdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRSb3dIZWlnaHQoKTtcclxuICAgICAgdGhpcy5sb2dnZXIubG9nKFxyXG4gICAgICAgIGBmaW5kUmVxdWVzdGVkSW5kZXhlc1JhbmdlOiB0cmFuc2xhdGVZOiAke1xyXG4gICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIudHJhbnNsYXRlWVxyXG4gICAgICAgIH0gcm93SGVpZ2h0OiAke3RoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuZ2V0Um93SGVpZ2h0KCl9YFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgYGZpbmRSZXF1ZXN0ZWRJbmRleGVzUmFuZ2U6IGZpcnN0UmVxdWVzdGVkSXRlbVBvc2l0aW9uOiAke1xyXG4gICAgICAgIHRoaXMuX2ZpcnN0UmVxdWVzdGVkSXRlbUluZGV4XHJcbiAgICAgICAgfSBsYXN0UmVxdWVzdGVkSXRlbVBvc2l0aW9uOiAke3RoaXMuX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXh9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIHJlbW92ZVZpZXdzKCkge1xyXG4gICAgdGhpcy5fbWFya2VkVG9CZVJlbW92ZWRDb3VudCA9IDA7XHJcbiAgICBpZiAodGhpcy5fdmlld0NvbnRhaW5lclJlZi5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZygncmVtb3ZlVmlld3M6IGxlbmd0aCA+IDAnKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdmlldyA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+KFxyXG4gICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5nZXQoaSlcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJbmRleCA9IHZpZXcuY29udGV4dC5pbmRleDtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2aWV3SW5kZXggPiB0aGlzLl9sYXN0UmVxdWVzdGVkSXRlbUluZGV4IHx8XHJcbiAgICAgICAgICB2aWV3SW5kZXggPCB0aGlzLl9maXJzdFJlcXVlc3RlZEl0ZW1JbmRleFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2F1dG9IZWlnaHRWYXJpYWJsZSkge1xyXG4gICAgICAgICAgICBjb25zdCB2aWV3RWxlbWVudDogSFRNTEVsZW1lbnQgPSB2aWV3LnJvb3ROb2Rlc1swXTtcclxuICAgICAgICAgICAgdmlldy5jb250ZXh0Lm1hcmtlZFRvQmVSZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fbWFya2VkVG9CZVJlbW92ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICAgICAgJ3JlbW92ZVZpZXdzOiBfYXV0b0hlaWdodFZhcmlhYmxlIG1hcmtlZFRvQmVSZW1vdmVkJyxcclxuICAgICAgICAgICAgICB2aWV3SW5kZXhcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygncmVtb3ZlVmlld3M6IHJlY3ljbGVWaWV3ICcsIHZpZXdJbmRleCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3ljbGVyLnJlY3ljbGVWaWV3KHZpZXcpO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpKTtcclxuICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sb2dnZXIubG9nKCdyZW1vdmVWaWV3czogcmVjeWNsZXIgbGVuZ3RoJywgdGhpcy5fcmVjeWNsZXIubGVuZ3RoKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGNyZWF0ZVZpZXdzKCk6IFByb21pc2U8Vmlld1JlZltdPiB7XHJcbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA+IDAgJiZcclxuICAgICAgdGhpcy5fbWFya2VkVG9CZVJlbW92ZWRDb3VudCA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5fZnVsbFNjcm9sbCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgYGNyZWF0ZVZpZXdzOiBsZW5ndGggPiAwLCBfZmlyc3RJdGVtUG9zaXRpb246ICR7XHJcbiAgICAgICAgdGhpcy5fZmlyc3RJdGVtSW5kZXhcclxuICAgICAgICB9IF9sYXN0SXRlbVBvc2l0aW9uOiAke3RoaXMuX2xhc3RJdGVtSW5kZXh9YFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgYGNyZWF0ZVZpZXdzOiBsZW5ndGggPiAwLCBfZmlyc3RSZXF1ZXN0ZWRJdGVtUG9zaXRpb246ICR7XHJcbiAgICAgICAgdGhpcy5fZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXhcclxuICAgICAgICB9IF9sYXN0UmVxdWVzdGVkSXRlbVBvc2l0aW9uOiAke3RoaXMuX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXh9YFxyXG4gICAgICApO1xyXG4gICAgICBmb3IgKFxyXG4gICAgICAgIGxldCBpID0gdGhpcy5fZmlyc3RJdGVtSW5kZXggLSAxO1xyXG4gICAgICAgIGkgPj0gdGhpcy5fZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXg7XHJcbiAgICAgICAgaS0tXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZygnY3JlYXRlVmlld3M6IGdldFZpZXcgLS0gJywgaSk7XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLmNyZWF0ZVZpZXcoaSwgdHJ1ZSkpO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLl9sYXN0SXRlbUluZGV4ICsgMTtcclxuICAgICAgICBpIDw9IHRoaXMuX2xhc3RSZXF1ZXN0ZWRJdGVtSW5kZXg7XHJcbiAgICAgICAgaSsrXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZygnY3JlYXRlVmlld3M6IGdldFZpZXcgICsrICcsIGkpO1xyXG4gICAgICAgIHByb21pc2VzLnB1c2godGhpcy5jcmVhdGVWaWV3KGksIGZhbHNlKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZygnY3JlYXRlVmlld3M6IGxlbmd0aCA9PSAwJyk7XHJcbiAgICAgIHRoaXMuX2Z1bGxTY3JvbGwgPSB0cnVlO1xyXG4gICAgICBmb3IgKFxyXG4gICAgICAgIGxldCBpID0gdGhpcy5fZmlyc3RSZXF1ZXN0ZWRJdGVtSW5kZXg7XHJcbiAgICAgICAgaSA8PSB0aGlzLl9sYXN0UmVxdWVzdGVkSXRlbUluZGV4O1xyXG4gICAgICAgIGkrK1xyXG4gICAgICApIHtcclxuICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuY3JlYXRlVmlldyhpLCBmYWxzZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBwcmVwYXJlVmlldyhpbmRleDogbnVtYmVyLCBpdGVtOiBUKSB7XHJcbiAgICBsZXQgdmlldztcclxuICAgIGlmICgodmlldyA9IHRoaXMuX3JlY3ljbGVyLnJlY292ZXJWaWV3KCkpKSB7XHJcbiAgICAgIHZpZXcuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICB2aWV3LmNvbnRleHQuaW5kZXggPSBpbmRleDtcclxuICAgICAgdmlldy5jb250ZXh0LmNvdW50ID0gdGhpcy5fY29sbGVjdGlvbkxlbmd0aDtcclxuICAgICAgdmlldy5jb250ZXh0LnJlY3ljbGVkID0gdHJ1ZTtcclxuICAgICAgdmlldy5yZWF0dGFjaCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmlldyA9IHRoaXMuX3RlbXBsYXRlLmNyZWF0ZUVtYmVkZGVkVmlldyhcclxuICAgICAgICBuZXcgVmlydHVhbFJlcGVhdFJvdyhpdGVtLCBpbmRleCwgdGhpcy5fY29sbGVjdGlvbkxlbmd0aClcclxuICAgICAgKTtcclxuICAgICAgdmlldy5jb250ZXh0LnJlY3ljbGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmlldztcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBjcmVhdGVWaWV3Rm9ySXRlbShpbmRleDogbnVtYmVyLCBpdGVtOiBUKTogVmlld1JlZiB7XHJcbiAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgIGBjcmVhdGVWaWV3Rm9ySXRlbTogX2ZpcnN0SXRlbVBvc2l0aW9uOiAke1xyXG4gICAgICB0aGlzLl9maXJzdEl0ZW1JbmRleFxyXG4gICAgICB9IF9maXJzdFJlcXVlc3RlZEl0ZW1Qb3NpdGlvbjogJHt0aGlzLl9maXJzdFJlcXVlc3RlZEl0ZW1JbmRleH0gbGVuZ3RoOiAke1xyXG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aFxyXG4gICAgICB9YFxyXG4gICAgKTtcclxuICAgIGxldCBjb250YWluZXJQb3MgPSBpbmRleCAtICh0aGlzLl9maXJzdEl0ZW1JbmRleCB8fCAwKTtcclxuICAgIGlmIChNYXRoLmFicyhjb250YWluZXJQb3MpID4gdGhpcy5fZ3VhcmRJdGVtcykge1xyXG4gICAgICBjb250YWluZXJQb3MgPSAwOyAvLyBvdXQgb2YgcHJldmlvdXMgcmFuZ2VcclxuICAgIH1cclxuICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgYGNyZWF0ZVZpZXdGb3JJdGVtOiBjcmVhdGUgY29udGFpbmVyUG9zOiAke2NvbnRhaW5lclBvc30gaW5kZXg6ICR7aW5kZXh9YFxyXG4gICAgKTtcclxuICAgIGxldCB2aWV3OiBWaWV3UmVmID0gbnVsbDtcclxuICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB2aWV3ID0gdGhpcy5wcmVwYXJlVmlldyhpbmRleCwgaXRlbSk7XHJcbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHZpZXcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IGluc2VydGVkID0gZmFsc2U7XHJcbiAgICAgIGlmIChjb250YWluZXJQb3MgPj0gMCkge1xyXG4gICAgICAgIC8vIGluc2VydCBhdCB0aGUgZW5kXHJcbiAgICAgICAgZm9yIChcclxuICAgICAgICAgIGxldCBjb250YWluZXJJbmRleCA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoIC0gMTtcclxuICAgICAgICAgIGNvbnRhaW5lckluZGV4ID49IDA7XHJcbiAgICAgICAgICBjb250YWluZXJJbmRleC0tXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBjb25zdCB2aWV3SW5kZXggPSAoPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj4oXHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGNvbnRhaW5lckluZGV4KVxyXG4gICAgICAgICAgKSkuY29udGV4dC5pbmRleDtcclxuICAgICAgICAgIC8vIHRoaXMubG9nZ2VyLmxvZyhgY3JlYXRlVmlld0Zvckl0ZW06IGNoZWNraW5nICR7dmlld0luZGV4fSArK2ApO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09PSB2aWV3SW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKGBjcmVhdGVWaWV3Rm9ySXRlbTogcmVhc2lnbiAke3ZpZXdJbmRleH0gKytgKTtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGNvbnRhaW5lckluZGV4KTtcclxuICAgICAgICAgICAgKDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dmlldykuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICB2aWV3LnJlYXR0YWNoKCk7XHJcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID4gdmlld0luZGV4KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLnByZXBhcmVWaWV3KGluZGV4LCBpdGVtKTtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKFxyXG4gICAgICAgICAgICAgIGBjcmVhdGVWaWV3Rm9ySXRlbTogaW5zZXJ0aW5nIGluICR7Y29udGFpbmVySW5kZXggKyAxfSArK2BcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldywgY29udGFpbmVySW5kZXggKyAxKTtcclxuICAgICAgICAgICAgaW5zZXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpbnNlcnRlZCkge1xyXG4gICAgICAgICAgdmlldyA9IHRoaXMucHJlcGFyZVZpZXcoaW5kZXgsIGl0ZW0pO1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXIubG9nKGBjcmVhdGVWaWV3Rm9ySXRlbTogaW5zZXJ0aW5nIGluIGZpcnN0ICsrK2ApO1xyXG4gICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldywgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGluc2VydCBhdCB0aGUgYmVnaW5uaW5nXHJcbiAgICAgICAgZm9yIChcclxuICAgICAgICAgIGxldCBjb250YWluZXJJbmRleCA9IDA7XHJcbiAgICAgICAgICBjb250YWluZXJJbmRleCA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoO1xyXG4gICAgICAgICAgY29udGFpbmVySW5kZXgrK1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgY29uc3Qgdmlld0luZGV4ID0gKDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+KFxyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChjb250YWluZXJJbmRleClcclxuICAgICAgICAgICkpLmNvbnRleHQuaW5kZXg7XHJcbiAgICAgICAgICAvLyB0aGlzLmxvZ2dlci5sb2coYGNyZWF0ZVZpZXdGb3JJdGVtOiBjaGVja2luZyAke3ZpZXdJbmRleH0gLS1gKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gdmlld0luZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICAgICAgICBgY3JlYXRlVmlld0Zvckl0ZW06IHJlYXNpZ24gJHtpbmRleH0gYXQgJHtjb250YWluZXJJbmRleH0gLS1gLFxyXG4gICAgICAgICAgICAgIGl0ZW1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KGNvbnRhaW5lckluZGV4KTtcclxuICAgICAgICAgICAgKDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dmlldykuY29udGV4dC4kaW1wbGljaXQgPSBpdGVtO1xyXG4gICAgICAgICAgICB2aWV3LnJlYXR0YWNoKCk7XHJcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4IDwgdmlld0luZGV4KSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLnByZXBhcmVWaWV3KGluZGV4LCBpdGVtKTtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKFxyXG4gICAgICAgICAgICAgIGBjcmVhdGVWaWV3Rm9ySXRlbTogaW5zZXJ0aW5nIGluICR7Y29udGFpbmVySW5kZXh9IC0tYFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3LCBjb250YWluZXJJbmRleCk7XHJcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaW5zZXJ0ZWQpIHtcclxuICAgICAgICAgIHZpZXcgPSB0aGlzLnByZXBhcmVWaWV3KGluZGV4LCBpdGVtKTtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyhgY3JlYXRlVmlld0Zvckl0ZW06IGluc2VydGluZyBpbiBsYXN0IC0tLWApO1xyXG4gICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbnNlcnQodmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZpZXcpIHtcclxuICAgICAgdGhpcy5hcHBseVN0eWxlcyhpbmRleCwgdmlldyBhcyBFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGFwcGx5U3R5bGVzKFxyXG4gICAgaW5kZXg6IG51bWJlcixcclxuICAgIHZpZXc6IEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PlxyXG4gICkge1xyXG4gICAgY29uc3Qgdmlld0NvbnRlbnQgPSB2aWV3LnJvb3ROb2Rlc1swXTtcclxuICAgIGlmICghdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodCkge1xyXG4gICAgICB2aWV3Q29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmdldFJvd0hlaWdodCgpfXB4YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZpZXdDb250ZW50LnN0eWxlLmhlaWdodCA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHZpZXdDb250ZW50LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcclxuXHJcbiAgICBpZiAodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlKSB7XHJcbiAgICAgIHZpZXcuY29udGV4dC5wcmV2aW91c0Rpc3BsYXkgPSB2aWV3Q29udGVudC5zdHlsZS5kaXNwbGF5O1xyXG4gICAgICB2aWV3Q29udGVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAvLyB3aWxsIGJlIHNob3duIHdoZW4gcHJvY2Vzc2luZyBmaW5pc2hlZFxyXG4gICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgYGFwcGx5U3R5bGVzOiBfYXV0b0hlaWdodFZhcmlhYmxlIGNyZWFkZWQgdmlldyBvbiAke2luZGV4fSByZWN5Y2xlZDogJHtcclxuICAgICAgICB2aWV3LmNvbnRleHQucmVjeWNsZWRcclxuICAgICAgICB9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25Qcm9jZXNzaW5nKHByb2Nlc3Npbmc6IGJvb2xlYW4pOiBhbnkge1xyXG4gICAgaWYgKHByb2Nlc3NpbmcgPT09IGZhbHNlKSB7XHJcbiAgICAgIC8vIHByb2Nlc3NpbmcgZmluaXNoZWRcclxuICAgICAgdGhpcy5sb2dnZXIubG9nKCdvblByb2Nlc3Npbmc6IGZpbmlzaGVkLiBEaXNwYXRjaGluZyBsYXlvdXQnKTtcclxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKCdvblByb2Nlc3Npbmc6IGluc2lkZScpO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hMYXlvdXQoKTtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICAnb25Qcm9jZXNzaW5nOiBsYXlvdXQgZG9uZSByb3dIZWlnaHQnLFxyXG4gICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRSb3dIZWlnaHQoKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaExheW91dCgpIHtcclxuICAgIGxldCB0b3RhbEhlaWdodCA9IDA7XHJcbiAgICBsZXQgdG90YWxSZW1vdmVkSGVpZ2h0ID0gMDtcclxuICAgIGxldCB0b3RhbEFkZGVkSGVpZ2h0ID0gMDtcclxuICAgIGxldCBndWFyZEhlaWdodCA9IDA7XHJcbiAgICBsZXQgbWVhbkhlaWdodCA9IDA7XHJcblxyXG4gICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxyXG5cclxuICAgIGlmICh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9hdXRvSGVpZ2h0KSB7XHJcbiAgICAgIGlmICh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9hdXRvSGVpZ2h0VmFyaWFibGUpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICBgZGlzcGF0Y2hMYXlvdXQ6IF9hdXRvSGVpZ2h0VmFyaWFibGUgZW50ZXIgJHtcclxuICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoXHJcbiAgICAgICAgICB9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gc2hvdyAvIHJlY3ljbGUgdmlld3MgaW4gX2F1dG9IZWlnaHRWYXJpYWJsZSBtb2RlXHJcbiAgICAgICAgZm9yIChcclxuICAgICAgICAgIGxldCBjb250YWluZXJJbmRleCA9IDA7XHJcbiAgICAgICAgICBjb250YWluZXJJbmRleCA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoO1xyXG4gICAgICAgICAgY29udGFpbmVySW5kZXgrK1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgY29uc3QgdmlldyA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+KFxyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmdldChjb250YWluZXJJbmRleClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zdCB2aWV3RWxlbWVudDogSFRNTEVsZW1lbnQgPSB2aWV3LnJvb3ROb2Rlc1swXTtcclxuICAgICAgICAgIGlmICh2aWV3LmNvbnRleHQucHJldmlvdXNEaXNwbGF5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmlld0VsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHZpZXcuY29udGV4dC5wcmV2aW91c0Rpc3BsYXk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICAgICAgICBgZGlzcGF0Y2hMYXlvdXQ6IF9hdXRvSGVpZ2h0VmFyaWFibGUgc2hvd2luZyAke1xyXG4gICAgICAgICAgICAgIHZpZXcuY29udGV4dC5pbmRleFxyXG4gICAgICAgICAgICAgIH1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodmlldy5jb250ZXh0Lm1hcmtlZFRvQmVSZW1vdmVkKSB7XHJcbiAgICAgICAgICAgIHRvdGFsUmVtb3ZlZEhlaWdodCArPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQodmlld0VsZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN5Y2xlci5yZWN5Y2xlVmlldyh2aWV3KTtcclxuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2goY29udGFpbmVySW5kZXgpO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICAgICAgYGRpc3BhdGNoTGF5b3V0OiBfYXV0b0hlaWdodFZhcmlhYmxlIHJlbW92aW5nICR7XHJcbiAgICAgICAgICAgICAgdmlldy5jb250ZXh0LmluZGV4XHJcbiAgICAgICAgICAgICAgfSByZWN5Y2xlciBsZW5naHQ6ICR7dGhpcy5fcmVjeWNsZXIubGVuZ3RoKCl9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb250YWluZXJJbmRleC0tO1xyXG4gICAgICAgICAgICBkZWxldGUgdmlldy5jb250ZXh0Lm1hcmtlZFRvQmVSZW1vdmVkO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY29tcHV0ZSBtZWFuSGVpZ2h0XHJcbiAgICAgIGZvciAoXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lckluZGV4ID0gMDtcclxuICAgICAgICBjb250YWluZXJJbmRleCA8IHRoaXMuX3ZpZXdDb250YWluZXJSZWYubGVuZ3RoO1xyXG4gICAgICAgIGNvbnRhaW5lckluZGV4KytcclxuICAgICAgKSB7XHJcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZ2V0KFxyXG4gICAgICAgICAgY29udGFpbmVySW5kZXhcclxuICAgICAgICApIGFzIEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93PjtcclxuICAgICAgICBjb25zdCB2aWV3RWxlbWVudDogSFRNTEVsZW1lbnQgPSB2aWV3LnJvb3ROb2Rlc1swXTtcclxuXHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRFbGVtZW50SGVpZ2h0KHZpZXdFbGVtZW50KTtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICBgZGlzcGF0Y2hMYXlvdXQ6IGluZGV4OiAke2NvbnRhaW5lckluZGV4fSBoZWlnaHQ6ICR7aGVpZ2h0fWBcclxuICAgICAgICApO1xyXG4gICAgICAgIHRvdGFsSGVpZ2h0ICs9IGhlaWdodDtcclxuICAgICAgICBpZiAoY29udGFpbmVySW5kZXggPCB0aGlzLl9ndWFyZEl0ZW1zKSB7XHJcbiAgICAgICAgICBndWFyZEhlaWdodCArPSBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlKSB7XHJcbiAgICAgICAgICBpZiAodmlldy5jb250ZXh0LnByZXZpb3VzRGlzcGxheSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICAgICAgICBgZGlzcGF0Y2hMYXlvdXQ6IHRvdGFsQWRkZWRIZWlnaHQ6ICR7dG90YWxBZGRlZEhlaWdodH1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRvdGFsQWRkZWRIZWlnaHQgKz0gaGVpZ2h0O1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlRGF0YS5pdGVtc0NvdW50IDxcclxuICAgICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uTGVuZ3RoXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2F1dG9IZWlnaHRWYXJpYWJsZURhdGEudG90YWxIZWlnaHQgKz0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2F1dG9IZWlnaHRWYXJpYWJsZURhdGEuaXRlbXNDb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSB2aWV3LmNvbnRleHQucHJldmlvdXNEaXNwbGF5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBtZWFuSGVpZ2h0ID0gdG90YWxIZWlnaHQgLyB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmICghdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodENvbXB1dGVkKSB7XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQgPSBtZWFuSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICAgICdkaXNwYXRjaExheW91dDogYXV0b0hlaWdodCByb3dIZWlnaHQgdXBkYXRlZCAnICsgbWVhbkhlaWdodFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodENvbXB1dGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlLm5leHQoKTtcclxuICAgICAgfSBlbHNlIGlmIChtZWFuSGVpZ2h0ICE9PSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmdldFJvd0hlaWdodCgpKSB7XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICAnZGlzcGF0Y2hMYXlvdXQ6IGF1dG9IZWlnaHRWYXJpYWJsZSByb3dIZWlnaHQgdXBkYXRlZCAnICtcclxuICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuZ2V0Um93SGVpZ2h0KClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlRGF0YS5pdGVtc0NvdW50ID09PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAvLyBmaXJzdCBwYWdlXHJcbiAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9hdXRvSGVpZ2h0VmFyaWFibGVEYXRhLnRvdGFsSGVpZ2h0ID0gdG90YWxIZWlnaHQ7XHJcbiAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9hdXRvSGVpZ2h0VmFyaWFibGVEYXRhLml0ZW1zQ291bnQgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5yb3dIZWlnaHQgPVxyXG4gICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5fYXV0b0hlaWdodFZhcmlhYmxlRGF0YS50b3RhbEhlaWdodCAvXHJcbiAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLl9hdXRvSGVpZ2h0VmFyaWFibGVEYXRhLml0ZW1zQ291bnQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9mdWxsU2Nyb2xsKSB7XHJcbiAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnRyYW5zbGF0ZVkgPSB0aGlzLl9zY3JvbGxZIC0gZ3VhcmRIZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHBhcnRpYWwgc2Nyb2xsXHJcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coYGRpc3BhdGNoTGF5b3V0OiBfYXV0b0hlaWdodFZhcmlhYmxlIHBhcnRpYWwgc2Nyb2xsYCk7XHJcbiAgICAgICAgICBsZXQgdHJhbnNsYXRlWSA9XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIudHJhbnNsYXRlWSArXHJcbiAgICAgICAgICAgICh0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmN1cnJlbnRTY3JvbGxTdGF0ZSA9PT1cclxuICAgICAgICAgICAgICBTQ1JPTExfU1RBVEUuU0NST0xMSU5HX0RPV05cclxuICAgICAgICAgICAgICA/IHRvdGFsUmVtb3ZlZEhlaWdodFxyXG4gICAgICAgICAgICAgIDogLXRvdGFsQWRkZWRIZWlnaHQpO1xyXG4gICAgICAgICAgLy8gY2hlY2sgb3V0IG9mIHNjcm9sbFxyXG4gICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5fc2Nyb2xsWSAtIHRyYW5zbGF0ZVk7XHJcbiAgICAgICAgICBpZiAob2Zmc2V0ID4gZ3VhcmRIZWlnaHQgKiAxLjUgfHwgb2Zmc2V0IDwgZ3VhcmRIZWlnaHQgKiAwLjUpIHtcclxuICAgICAgICAgICAgdHJhbnNsYXRlWSA9IHRoaXMuX3Njcm9sbFkgLSBndWFyZEhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nKFxyXG4gICAgICAgICAgICAgIGBkaXNwYXRjaExheW91dDogX2F1dG9IZWlnaHRWYXJpYWJsZSBvdXQgb2Ygc2Nyb2xsIGFkanVzdGVkYFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci50cmFuc2xhdGVZID0gdHJhbnNsYXRlWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxZID09PSAwKSB7XHJcbiAgICAgICAgICAvLyBhZGp1c3Qgb24gbGltaXRzXHJcbiAgICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnRyYW5zbGF0ZVkgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKGBkaXNwYXRjaExheW91dDogX2F1dG9IZWlnaHRWYXJpYWJsZSByb3dIZWlnaHQ6ICR7dGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRSb3dIZWlnaHQoKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFk6ICR7dGhpcy5fc2Nyb2xsWX0gc2Nyb2xsU3RhdGU6ICR7dGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5jdXJyZW50U2Nyb2xsU3RhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFJlbW92ZWRIZWlnaHQ6ICR7dG90YWxSZW1vdmVkSGVpZ2h0fSB0b3RhbEFkZGVkSGVpZ2h0OiAke3RvdGFsQWRkZWRIZWlnaHR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVZOiAke3RoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIudHJhbnNsYXRlWX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbGVtZW50SGVpZ2h0KHZpZXdFbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgcmV0dXJuIHZpZXdFbGVtZW50Lm9mZnNldEhlaWdodCB8fCB2aWV3RWxlbWVudC5jaGlsZHJlblsnMCddLmNsaWVudEhlaWdodDtcclxuICB9XHJcbn1cclxuIl19