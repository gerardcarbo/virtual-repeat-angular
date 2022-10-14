import { Component, ViewChild, Output, Input } from '@angular/core';
import { Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { filter, tap, map, debounceTime, pairwise, } from 'rxjs/operators';
import { deglitchFalse } from './rxjs.operators';
import * as i0 from "@angular/core";
import * as i1 from "./logger.service";
import * as i2 from "@angular/common";
export const SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds
const INVALID_POSITION = -1;
// tslint:disable-next-line:component-class-suffix
export class VirtualRepeatContainer {
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
VirtualRepeatContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatContainer, deps: [{ token: i1.LoggerService }], target: i0.ɵɵFactoryTarget.Component });
VirtualRepeatContainer.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatContainer, selector: "gc-virtual-repeat-container", inputs: { rowHeight: "rowHeight", scrollPosition: "scrollPosition" }, outputs: { scrollPosition$: "scrollPosition$" }, viewQueries: [{ propertyName: "listContainer", first: true, predicate: ["listContainer"], descendants: true, static: true }], ngImport: i0, template: "<div class=\"gc-virtual-repeat-scroller\" #listContainer [ngClass]=\"scrollbarStyle\">\r\n    <div class=\"gc-virtual-repeat-container-holder\" [style.height]=\"holderHeightInPx\">\r\n    </div>\r\n    <div class=\"gc-virtual-repeat-offsetter\" role=\"presentation\" [style.transform]=\"'translateY('+ translateYInPx +')'\">\r\n        <ng-content></ng-content>\r\n    </div>\r\n</div>", styles: ["::ng-deep gc-virtual-repeat-container{display:block;margin:0;overflow:hidden;padding:0;width:100%;overflow-y:hidden;position:relative;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-scroller{overflow:auto;box-sizing:border-box;inset:0;margin:0;overflow-x:hidden;padding:0;position:absolute;width:100%;height:100%;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-offsetter{box-sizing:border-box;left:0;margin:0;padding:0;position:absolute;right:0;top:0;flex-direction:column}::ng-deep gc-virtual-repeat-container.hide-scrollbar{position:absolute;inset:0}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatContainer, decorators: [{
            type: Component,
            args: [{ selector: 'gc-virtual-repeat-container', template: "<div class=\"gc-virtual-repeat-scroller\" #listContainer [ngClass]=\"scrollbarStyle\">\r\n    <div class=\"gc-virtual-repeat-container-holder\" [style.height]=\"holderHeightInPx\">\r\n    </div>\r\n    <div class=\"gc-virtual-repeat-offsetter\" role=\"presentation\" [style.transform]=\"'translateY('+ translateYInPx +')'\">\r\n        <ng-content></ng-content>\r\n    </div>\r\n</div>", styles: ["::ng-deep gc-virtual-repeat-container{display:block;margin:0;overflow:hidden;padding:0;width:100%;overflow-y:hidden;position:relative;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-scroller{overflow:auto;box-sizing:border-box;inset:0;margin:0;overflow-x:hidden;padding:0;position:absolute;width:100%;height:100%;-webkit-overflow-scrolling:touch}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-container-holder{width:100%}::ng-deep gc-virtual-repeat-container .gc-virtual-repeat-offsetter{box-sizing:border-box;left:0;margin:0;padding:0;position:absolute;right:0;top:0;flex-direction:column}::ng-deep gc-virtual-repeat-container.hide-scrollbar{position:absolute;inset:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.LoggerService }]; }, propDecorators: { scrollPosition$: [{
                type: Output
            }], rowHeight: [{
                type: Input
            }], scrollPosition: [{
                type: Input
            }], listContainer: [{
                type: ViewChild,
                args: ['listContainer', { static: true }]
            }] } });
export var SCROLL_STATE;
(function (SCROLL_STATE) {
    SCROLL_STATE[SCROLL_STATE["IDLE"] = 0] = "IDLE";
    SCROLL_STATE[SCROLL_STATE["SCROLLING_DOWN"] = 1] = "SCROLLING_DOWN";
    SCROLL_STATE[SCROLL_STATE["SCROLLING_UP"] = 2] = "SCROLLING_UP";
})(SCROLL_STATE || (SCROLL_STATE = {}));
export function getScrollBarWidth() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvc3JjL2xpYi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXIudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi9zcmMvbGliL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUlULE1BQU0sRUFDTixLQUFLLEVBQ04sTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLFlBQVksRUFDWixlQUFlLEVBRWYsU0FBUyxFQUNULE9BQU8sRUFFUixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFDTCxNQUFNLEVBQ04sR0FBRyxFQUNILEdBQUcsRUFDSCxZQUFZLEVBQ1osUUFBUSxHQUNULE1BQU0sZ0JBQWdCLENBQUM7QUFHeEIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7O0FBRWpELE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQjtBQUVqRSxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBTzVCLGtEQUFrRDtBQUNsRCxNQUFNLE9BQU8sc0JBQXNCO0lBb0dqQzs7OztPQUlHO0lBQ0gsWUFBc0IsTUFBcUI7UUFBckIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUluQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUNsQixvQkFBZSxHQUFHLENBQUMsQ0FBQztRQUNwQixxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDdEIsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUVkLGtCQUFhLEdBQWlCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFakQsdUJBQWtCLEdBRXRCLElBQUksZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxvQkFBZSxHQUE0QixJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxnQkFBVyxHQUFzQyxJQUFJLGVBQWUsQ0FFMUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVGLHVCQUFrQixHQUFHLEtBQUssQ0FBQztRQUUzQixzQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUVyQyx3QkFBbUIsR0FBaUIsWUFBWSxDQUFDLElBQUksQ0FBQztRQVN0RCxlQUFVLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQUM1Qix3QkFBbUIsR0FBRyxLQUFLLENBQUM7UUFDNUIsNEJBQXVCLEdBQWdEO1lBQ3JFLFVBQVUsRUFBRSxDQUFDO1lBQ2IsV0FBVyxFQUFFLENBQUM7U0FDZixDQUFDO1FBRU0sdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUM3QyxtQkFBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQ2xELEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUNILENBQUM7UUFDSyxnQkFBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQy9DLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFDbEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUNILENBQUM7UUFuREEsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUEzR0QsSUFBSSxhQUFhLENBQUMsYUFBNkI7UUFDN0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7SUFDdEMsQ0FBQztJQUVELElBQUksa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xDLENBQUM7SUFFRCxJQUFJLFlBQVksQ0FBQyxNQUFjO1FBQzdCLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1lBQzVCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7YUFDaEQ7WUFDRCxvRUFBb0U7WUFDcEUsaURBQWlEO1lBQ2pELDJEQUEyRDtZQUMzRCxJQUNFLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxnQkFBZ0I7Z0JBQzNDLElBQUksQ0FBQyxhQUFhLEtBQUssQ0FBQyxFQUN4QjtnQkFDQSxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7b0JBQ3BFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtTQUNGO0lBQ0gsQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDbEIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7U0FDbEM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxpQkFBaUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFDSSxlQUFlO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELElBQWEsU0FBUyxDQUFDLE1BQXVCO1FBQzVDLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtZQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO1lBQ2pDLE9BQU87U0FDUjtRQUNELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFTLE1BQU0sWUFBWSxNQUFNLEVBQUU7WUFDL0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2pCLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7U0FDekM7UUFDRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBRUQsSUFBSSxVQUFVLENBQUMsQ0FBVTtRQUN2QixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxJQUNJLGNBQWMsQ0FBQyxDQUFTO1FBQzFCLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLCtFQUErRTtRQUMvRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQTZERCxlQUFlO1FBQ2IsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLGdCQUFnQixFQUFFO1lBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLO2dCQUMxQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFlBQVk7Z0JBQ2pELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1NBQzlCO1FBRUQsSUFBSSxNQUFNLEVBQUU7WUFDVixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztTQUNIO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3BCLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7YUFDbEQsSUFBSSxDQUNILE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztnQkFDaEMsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLEVBQ0YsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNQLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUNIO2FBQ0EsU0FBUyxDQUFDLENBQUMsT0FBZSxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQ0wsQ0FBQztRQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsZUFBZTthQUNqQixJQUFJLENBQ0gsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNQLElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3hEO1FBQ0gsQ0FBQyxDQUFDLEVBQ0YsUUFBUSxFQUFFLEVBQ1YsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ1QsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxtQkFBbUI7b0JBQ3RCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzt3QkFDbkIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxjQUFjO3dCQUM3QixDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztnQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ2Isd0JBQXdCLElBQUkseUJBQzFCLElBQUksQ0FBQyxtQkFDUCxFQUFFLENBQ0gsQ0FBQztnQkFDRixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3hEO1FBQ0gsQ0FBQyxDQUFDLEVBQ0YsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQ3pDO2FBQ0EsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEO1FBQ0gsQ0FBQyxDQUFDLENBQ0wsQ0FBQztRQUVGLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQUVELGdCQUFnQjtRQUNkLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRTtZQUMxRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3RFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ3hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3BDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDdkU7UUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7O21IQWpRVSxzQkFBc0I7dUdBQXRCLHNCQUFzQix3VEN0Q25DLG1ZQU1NOzJGRGdDTyxzQkFBc0I7a0JBTmxDLFNBQVM7K0JBQ0UsNkJBQTZCO29HQTZEbkMsZUFBZTtzQkFEbEIsTUFBTTtnQkFZTSxTQUFTO3NCQUFyQixLQUFLO2dCQXVCRixjQUFjO3NCQURqQixLQUFLO2dCQXlDd0MsYUFBYTtzQkFBMUQsU0FBUzt1QkFBQyxlQUFlLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDOztBQWtJNUMsTUFBTSxDQUFOLElBQVksWUFJWDtBQUpELFdBQVksWUFBWTtJQUN0QiwrQ0FBSSxDQUFBO0lBQ0osbUVBQWMsQ0FBQTtJQUNkLCtEQUFZLENBQUE7QUFDZCxDQUFDLEVBSlcsWUFBWSxLQUFaLFlBQVksUUFJdkI7QUFFRCxNQUFNLFVBQVUsaUJBQWlCO0lBQy9CLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO0lBQzNCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztJQUU3QixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUNsQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFDeEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztJQUNsQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7SUFDNUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO0lBQzdCLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUNoQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXpCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDN0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQ2hDLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFFM0IsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2IsRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7S0FDeEI7SUFFRCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQ29tcG9uZW50LFxyXG4gIFZpZXdDaGlsZCxcclxuICBFbGVtZW50UmVmLFxyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgT25EZXN0cm95LFxyXG4gIE91dHB1dCxcclxuICBJbnB1dFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1xyXG4gIFN1YnNjcmlwdGlvbixcclxuICBCZWhhdmlvclN1YmplY3QsXHJcbiAgT2JzZXJ2YWJsZSxcclxuICBmcm9tRXZlbnQsXHJcbiAgU3ViamVjdCxcclxuICB0aW1lclxyXG59IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge1xyXG4gIGZpbHRlcixcclxuICB0YXAsXHJcbiAgbWFwLFxyXG4gIGRlYm91bmNlVGltZSxcclxuICBwYWlyd2lzZSxcclxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSVZpcnR1YWxSZXBlYXQgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LmJhc2UnO1xyXG5pbXBvcnQgeyBkZWdsaXRjaEZhbHNlIH0gZnJvbSAnLi9yeGpzLm9wZXJhdG9ycyc7XHJcblxyXG5leHBvcnQgY29uc3QgU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQgPSAyMDA7IC8vIGluIG1pbGxpc2Vjb25kc1xyXG5cclxuY29uc3QgSU5WQUxJRF9QT1NJVElPTiA9IC0xO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXInLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXIuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyLnNjc3MnXVxyXG59KVxyXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LWNsYXNzLXN1ZmZpeFxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdENvbnRhaW5lciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcbiAgc2V0IHZpcnR1YWxSZXBlYXQodmlydHVhbFJlcGVhdDogSVZpcnR1YWxSZXBlYXQpIHtcclxuICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXQgPSB2aXJ0dWFsUmVwZWF0O1xyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJlbnRTY3JvbGxTdGF0ZSgpOiBTQ1JPTExfU1RBVEUge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRTY3JvbGxTdGF0ZTtcclxuICB9XHJcblxyXG4gIHNldCBob2xkZXJIZWlnaHQoaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgIGlmICh0eXBlb2YgaGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aGlzLl9ob2xkZXJIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIGlmICh0aGlzLl9ob2xkZXJIZWlnaHQgPT09IDApIHtcclxuICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFdoZW4gaW5pdGlhbGl6YXRpb24sIHRoZSBsaXN0LWhvbGRlciBkb2Vzbid0IG5vdCBoYXZlIGl0cyBoZWlnaHQuXHJcbiAgICAgIC8vIFNvIHRoZSBzY3JvbGxUb3Agc2hvdWxkIGJlIGRlbGF5ZWQgZm9yIHdhaXRpbmdcclxuICAgICAgLy8gdGhlIGxpc3QtaG9sZGVyIHJlbmRlcmVkIGJpZ2dlciB0aGFuIHRoZSBsaXN0LWNvbnRhaW5lci5cclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgIT09IElOVkFMSURfUE9TSVRJT04gJiZcclxuICAgICAgICB0aGlzLl9ob2xkZXJIZWlnaHQgIT09IDBcclxuICAgICAgKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9pbml0aWFsU2Nyb2xsVG9wO1xyXG4gICAgICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFRvcCA9IElOVkFMSURfUE9TSVRJT047XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldCBob2xkZXJIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9ob2xkZXJIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBnZXQgaG9sZGVySGVpZ2h0SW5QeCgpOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuX2hvbGRlckhlaWdodCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5faG9sZGVySGVpZ2h0ICsgJ3B4JztcclxuICAgIH1cclxuICAgIHJldHVybiAnMTAwJSc7XHJcbiAgfVxyXG5cclxuICBnZXQgdHJhbnNsYXRlWUluUHgoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZVkgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2Nyb2xsIHN0YXRlIGNoYW5nZVxyXG4gICAqL1xyXG4gIGdldCBzY3JvbGxTdGF0ZUNoYW5nZSgpOiBPYnNlcnZhYmxlPFNDUk9MTF9TVEFURT4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXHJcbiAgICovXHJcbiAgQE91dHB1dCgpXHJcbiAgZ2V0IHNjcm9sbFBvc2l0aW9uJCgpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbFBvc2l0aW9uLmFzT2JzZXJ2YWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogY29udGFpbmVyIHdpZHRoIGFuZCBoZWlnaHQuXHJcbiAgICovXHJcbiAgZ2V0IHNpemVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxbbnVtYmVyLCBudW1iZXJdPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2l6ZUNoYW5nZS5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIEBJbnB1dCgpIHNldCByb3dIZWlnaHQoaGVpZ2h0OiBzdHJpbmcgfCBudW1iZXIpIHtcclxuICAgIGlmIChoZWlnaHQgPT09ICdhdXRvJykge1xyXG4gICAgICB0aGlzLl9hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5fYXV0b0hlaWdodENvbXB1dGVkID0gZmFsc2U7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgaGVpZ2h0ID09PSAnc3RyaW5nJyB8fCA8YW55PmhlaWdodCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICBoZWlnaHQgPSBOdW1iZXIoaGVpZ2h0KTtcclxuICAgIH1cclxuICAgIGlmIChpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdyb3dIZWlnaHQgY2FuIG5vdCBiZSBOYU4nKTtcclxuICAgIH1cclxuICAgIGlmIChoZWlnaHQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0aGlzLl9yb3dIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIHRoaXMuX2F1dG9IZWlnaHQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldCBwcm9jZXNzaW5nKGw6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuX3Byb2Nlc3NpbmdTdWJqZWN0Lm5leHQobCk7XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKVxyXG4gIHNldCBzY3JvbGxQb3NpdGlvbihwOiBudW1iZXIpIHtcclxuICAgIC8vIHRoaXMubG9nZ2VyLmxvZygncCcsIHApO1xyXG4gICAgdGhpcy5saXN0Q29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID0gcDtcclxuICAgIC8vIGlmIGxpc3QtaG9sZGVyIGhhcyBubyBoZWlnaHQgYXQgdGhlIGNlcnRhaW4gdGltZS4gc2Nyb2xsVG9wIHdpbGwgbm90IGJlIHNldC5cclxuICAgIGlmICghdGhpcy5faG9sZGVySGVpZ2h0KSB7XHJcbiAgICAgIHRoaXMuX2luaXRpYWxTY3JvbGxUb3AgPSBwO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChwKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVJVGltZWxpbmVNZXRlciBpcyBvcHRpb25hbCBpbmplY3Rpb24uIHdoZW4gdGhpcyBjb21wb25lbnQgdXNlZCBpbnNpZGUgYSBVSVRpbWVsaW5lTWV0ZXIuXHJcbiAgICogaXQgaXMgcmVzcG9uc2libGUgdG8gdXBkYXRlIHRoZSBzY3JvbGxZXHJcbiAgICogQHBhcmFtIF90aW1lbGluZU1ldGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGxvZ2dlcjogTG9nZ2VyU2VydmljZSkge1xyXG4gICAgdGhpcy5zY3JvbGxiYXJTdHlsZSA9ICdub3JtYWwnO1xyXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCA9IGdldFNjcm9sbEJhcldpZHRoKCk7XHJcbiAgfVxyXG4gIHByaXZhdGUgX2hvbGRlckhlaWdodCA9IDA7XHJcbiAgcHJpdmF0ZSBfY29udGFpbmVyV2lkdGggPSAwO1xyXG4gIHByaXZhdGUgX2NvbnRhaW5lckhlaWdodCA9IDA7XHJcbiAgcHVibGljIHRyYW5zbGF0ZVkgPSAwO1xyXG5cclxuICBwcml2YXRlIF9zdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcclxuXHJcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RhdGVDaGFuZ2U6IEJlaGF2aW9yU3ViamVjdDxcclxuICAgIFNDUk9MTF9TVEFURVxyXG4gID4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFNDUk9MTF9TVEFURS5JRExFKTtcclxuICBwcml2YXRlIF9zY3JvbGxQb3NpdGlvbjogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KDApO1xyXG4gIHByaXZhdGUgX3NpemVDaGFuZ2U6IEJlaGF2aW9yU3ViamVjdDxbbnVtYmVyLCBudW1iZXJdPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8XHJcbiAgICBbbnVtYmVyLCBudW1iZXJdXHJcbiAgPihbMCwgMF0pO1xyXG5cclxuICBwcml2YXRlIF9pZ25vcmVTY3JvbGxFdmVudCA9IGZhbHNlO1xyXG5cclxuICBwcml2YXRlIF9pbml0aWFsU2Nyb2xsVG9wID0gSU5WQUxJRF9QT1NJVElPTjtcclxuXHJcbiAgcHJpdmF0ZSBfY3VycmVudFNjcm9sbFN0YXRlOiBTQ1JPTExfU1RBVEUgPSBTQ1JPTExfU1RBVEUuSURMRTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnbGlzdENvbnRhaW5lcicsIHtzdGF0aWM6IHRydWV9ICkgIGxpc3RDb250YWluZXI6IEVsZW1lbnRSZWY7XHJcblxyXG4gIHNjcm9sbGJhclN0eWxlOiBzdHJpbmc7XHJcbiAgc2Nyb2xsYmFyV2lkdGg6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBfdmlydHVhbFJlcGVhdDogSVZpcnR1YWxSZXBlYXQ7XHJcblxyXG4gIHByaXZhdGUgX3Jvd0hlaWdodCA9IDEwMDtcclxuICBfYXV0b0hlaWdodCA9IGZhbHNlO1xyXG4gIF9hdXRvSGVpZ2h0Q29tcHV0ZWQgPSBmYWxzZTtcclxuICBfYXV0b0hlaWdodFZhcmlhYmxlID0gZmFsc2U7XHJcbiAgX2F1dG9IZWlnaHRWYXJpYWJsZURhdGE6IHsgaXRlbXNDb3VudDogbnVtYmVyOyB0b3RhbEhlaWdodDogbnVtYmVyIH0gPSB7XHJcbiAgICBpdGVtc0NvdW50OiAwLFxyXG4gICAgdG90YWxIZWlnaHQ6IDBcclxuICB9O1xyXG5cclxuICBwcml2YXRlIF9wcm9jZXNzaW5nU3ViamVjdCA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XHJcbiAgcHVibGljIHByb2Nlc3NpbmdSYXckID0gdGhpcy5fcHJvY2Vzc2luZ1N1YmplY3QucGlwZShcclxuICAgIHRhcChzdGF0ZSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmxvZygncHJvY2Vzc2luZ1JhdyQgJyArIHN0YXRlKTtcclxuICAgIH0pXHJcbiAgKTtcclxuICBwdWJsaWMgcHJvY2Vzc2luZyQgPSB0aGlzLl9wcm9jZXNzaW5nU3ViamVjdC5waXBlKFxyXG4gICAgZGVnbGl0Y2hGYWxzZSg1MDApLFxyXG4gICAgdGFwKHN0YXRlID0+IHtcclxuICAgICAgdGhpcy5sb2dnZXIubG9nKCdwcm9jZXNzaW5nJCAnICsgc3RhdGUpO1xyXG4gICAgfSlcclxuICApO1xyXG5cclxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5zY3JvbGxiYXJTdHlsZSA9PT0gJ2hpZGUtc2Nyb2xsYmFyJykge1xyXG4gICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5yaWdodCA9XHJcbiAgICAgICAgMCAtIHRoaXMuc2Nyb2xsYmFyV2lkdGggKyAncHgnO1xyXG4gICAgICB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPVxyXG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcclxuICAgICAgICBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJykuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXHJcbiAgICAgIGZyb21FdmVudCh0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXHJcbiAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICBmaWx0ZXIoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faWdub3JlU2Nyb2xsRXZlbnQpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9pZ25vcmVTY3JvbGxFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoKHNjcm9sbFk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5fc2Nyb2xsUG9zaXRpb24ubmV4dChzY3JvbGxZKTtcclxuICAgICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24uYWRkKFxyXG4gICAgICB0aGlzLnNjcm9sbFBvc2l0aW9uJFxyXG4gICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgdGFwKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRTY3JvbGxTdGF0ZSA9PT0gU0NST0xMX1NUQVRFLklETEUpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50U2Nyb2xsU3RhdGUgPSBTQ1JPTExfU1RBVEUuU0NST0xMSU5HX0RPV047XHJcbiAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dCh0aGlzLl9jdXJyZW50U2Nyb2xsU3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgIHBhaXJ3aXNlKCksXHJcbiAgICAgICAgICBtYXAocGFpciA9PiB7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhwYWlyWzFdIC0gcGFpclswXSkgPiAxMCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTY3JvbGxTdGF0ZSA9XHJcbiAgICAgICAgICAgICAgICBwYWlyWzFdIC0gcGFpclswXSA+IDBcclxuICAgICAgICAgICAgICAgICAgPyBTQ1JPTExfU1RBVEUuU0NST0xMSU5HX0RPV05cclxuICAgICAgICAgICAgICAgICAgOiBTQ1JPTExfU1RBVEUuU0NST0xMSU5HX1VQO1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZyhcclxuICAgICAgICAgICAgICAgIGBzY3JvbGxQb3NpdGlvbiBwYWlyOiAke3BhaXJ9IF9jdXJyZW50U2Nyb2xsU3RhdGU6ICR7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTY3JvbGxTdGF0ZVxyXG4gICAgICAgICAgICAgICAgfWBcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIHRoaXMuX3Njcm9sbFN0YXRlQ2hhbmdlLm5leHQodGhpcy5fY3VycmVudFNjcm9sbFN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgICBkZWJvdW5jZVRpbWUoU0NST0xMX1NUT1BfVElNRV9USFJFU0hPTEQpXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRTY3JvbGxTdGF0ZSAhPT0gU0NST0xMX1NUQVRFLklETEUpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsU3RhdGVDaGFuZ2UubmV4dChTQ1JPTExfU1RBVEUuSURMRSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgfVxyXG5cclxuICBnZXRSb3dIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9yb3dIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBnZXRDb250YWluZXJTaXplKCk6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSB7XHJcbiAgICBpZiAodGhpcy5saXN0Q29udGFpbmVyICYmIHRoaXMubGlzdENvbnRhaW5lci5uYXRpdmVFbGVtZW50KSB7XHJcbiAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmxpc3RDb250YWluZXIubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgdGhpcy5fY29udGFpbmVyV2lkdGggPSByZWN0LndpZHRoIC0gdGhpcy5zY3JvbGxiYXJXaWR0aDtcclxuICAgICAgdGhpcy5fY29udGFpbmVySGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XHJcbiAgICAgIHJldHVybiB7IHdpZHRoOiB0aGlzLl9jb250YWluZXJXaWR0aCwgaGVpZ2h0OiB0aGlzLl9jb250YWluZXJIZWlnaHQgfTtcclxuICAgIH1cclxuICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zY3JvbGxQb3NpdGlvbiA9IDA7XHJcbiAgICB0aGlzLl92aXJ0dWFsUmVwZWF0LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuZ2V0Q29udGFpbmVyU2l6ZSgpO1xyXG4gICAgdGhpcy5fc2l6ZUNoYW5nZS5uZXh0KFt3aWR0aCwgaGVpZ2h0XSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZW51bSBTQ1JPTExfU1RBVEUge1xyXG4gIElETEUsXHJcbiAgU0NST0xMSU5HX0RPV04sXHJcbiAgU0NST0xMSU5HX1VQXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JvbGxCYXJXaWR0aCgpIHtcclxuICBjb25zdCBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICBpbm5lci5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICBpbm5lci5zdHlsZS5oZWlnaHQgPSAnMjAwcHgnO1xyXG5cclxuICBjb25zdCBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIG91dGVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICBvdXRlci5zdHlsZS50b3AgPSAnMHB4JztcclxuICBvdXRlci5zdHlsZS5sZWZ0ID0gJzBweCc7XHJcbiAgb3V0ZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG4gIG91dGVyLnN0eWxlLndpZHRoID0gJzIwMHB4JztcclxuICBvdXRlci5zdHlsZS5oZWlnaHQgPSAnMTUwcHgnO1xyXG4gIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcclxuICBjb25zdCB3MSA9IGlubmVyLm9mZnNldFdpZHRoO1xyXG4gIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XHJcbiAgbGV0IHcyID0gaW5uZXIub2Zmc2V0V2lkdGg7XHJcblxyXG4gIGlmICh3MSA9PT0gdzIpIHtcclxuICAgIHcyID0gb3V0ZXIuY2xpZW50V2lkdGg7XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcclxuXHJcbiAgcmV0dXJuIHcxIC0gdzI7XHJcbn1cclxuIiwiPGRpdiBjbGFzcz1cImdjLXZpcnR1YWwtcmVwZWF0LXNjcm9sbGVyXCIgI2xpc3RDb250YWluZXIgW25nQ2xhc3NdPVwic2Nyb2xsYmFyU3R5bGVcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJnYy12aXJ0dWFsLXJlcGVhdC1jb250YWluZXItaG9sZGVyXCIgW3N0eWxlLmhlaWdodF09XCJob2xkZXJIZWlnaHRJblB4XCI+XHJcbiAgICA8L2Rpdj5cclxuICAgIDxkaXYgY2xhc3M9XCJnYy12aXJ0dWFsLXJlcGVhdC1vZmZzZXR0ZXJcIiByb2xlPVwicHJlc2VudGF0aW9uXCIgW3N0eWxlLnRyYW5zZm9ybV09XCIndHJhbnNsYXRlWSgnKyB0cmFuc2xhdGVZSW5QeCArJyknXCI+XHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgPC9kaXY+XHJcbjwvZGl2PiJdfQ==