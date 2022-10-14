import { Directive, Input, isDevMode } from '@angular/core';
import { VirtualRepeatBase } from './virtual-repeat.base';
import * as i0 from "@angular/core";
import * as i1 from "./virtual-repeat-container";
import * as i2 from "./logger.service";
// tslint:disable-next-line:directive-class-suffix
export class VirtualRepeatAsynch extends VirtualRepeatBase {
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
VirtualRepeatAsynch.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAsynch, deps: [{ token: i1.VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: i2.LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeatAsynch.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatAsynch, selector: "[virtualRepeatAsynch]", inputs: { virtualRepeatAsynchOf: "virtualRepeatAsynchOf", virtualRepeatAsynchForTrackBy: "virtualRepeatAsynchForTrackBy", virtualRepeatAsynchForTemplate: "virtualRepeatAsynchForTemplate" }, usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAsynch, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[virtualRepeatAsynch]'
                }]
        }], ctorParameters: function () { return [{ type: i1.VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: i2.LoggerService }]; }, propDecorators: { virtualRepeatAsynchOf: [{
                type: Input
            }], virtualRepeatAsynchForTrackBy: [{
                type: Input
            }], virtualRepeatAsynchForTemplate: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYXN5bmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvc3JjL2xpYi92aXJ0dWFsLXJlcGVhdC1hc3luY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNILFNBQVMsRUFFVCxLQUFLLEVBQ0wsU0FBUyxFQVdaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBb0IsTUFBTSx1QkFBdUIsQ0FBQzs7OztBQWE1RSxrREFBa0Q7QUFDbEQsTUFBTSxPQUFPLG1CQUF1QixTQUFRLGlCQUFvQjtJQThCNUQsWUFBWSx1QkFBK0MsRUFDdkQsUUFBeUIsRUFDekIsU0FBd0MsRUFDeEMsaUJBQW1DLEVBQ25DLE1BQXFCO1FBRXJCLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUEvQkQsSUFDSSw2QkFBNkIsQ0FBQyxFQUFzQjtRQUNwRCxJQUFJLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxFQUFFO1lBQ3ZELElBQVMsT0FBTyxJQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQ1IsNENBQTRDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUk7b0JBQ2xFLGtHQUFrRztvQkFDbEcsd0JBQXdCLENBQUMsQ0FBQzthQUNqQztTQUNKO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUksNkJBQTZCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQsSUFDSSw4QkFBOEIsQ0FBQyxLQUFvQztRQUNuRSxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQVdELFdBQVcsQ0FBQyxPQUFzQjtRQUM5QixJQUFJLHVCQUF1QixJQUFJLE9BQU8sRUFBRTtZQUNwQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsNEVBQTRFO1lBQzVFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUM1RCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUV6QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUVTLE9BQU87UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUNsQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUM7WUFDaEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ2pHLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFrQjtRQUNsRCxJQUFJLElBQWEsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7WUFDOUYsc0VBQXNFO1lBQ3RFLE1BQU0sU0FBUyxHQUF1QyxJQUFLLENBQUM7WUFDNUQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3pGLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUNwRTtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDakQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7O2dIQTlFUSxtQkFBbUI7b0dBQW5CLG1CQUFtQjsyRkFBbkIsbUJBQW1CO2tCQUwvQixTQUFTO21CQUFDO29CQUNQLDhDQUE4QztvQkFDOUMsUUFBUSxFQUFFLHVCQUF1QjtpQkFDcEM7Z09BTVkscUJBQXFCO3NCQUE3QixLQUFLO2dCQUdGLDZCQUE2QjtzQkFEaEMsS0FBSztnQkFrQkYsOEJBQThCO3NCQURqQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIERpcmVjdGl2ZSxcclxuICAgIEVtYmVkZGVkVmlld1JlZixcclxuICAgIElucHV0LFxyXG4gICAgaXNEZXZNb2RlLFxyXG4gICAgSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgTmdJdGVyYWJsZSxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIE9uRGVzdHJveSxcclxuICAgIE9uSW5pdCxcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIFRyYWNrQnlGdW5jdGlvbixcclxuICAgIFZpZXdDb250YWluZXJSZWYsXHJcbiAgICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRCYXNlLCBWaXJ0dWFsUmVwZWF0Um93IH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC5iYXNlJztcclxuaW1wb3J0IHsgVmlydHVhbFJlcGVhdENvbnRhaW5lciB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vbG9nZ2VyLnNlcnZpY2UnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQXN5bmNoQ29sbGVjdGlvbjxUPiB7XHJcbiAgICBnZXRMZW5ndGgoKTogUHJvbWlzZTxudW1iZXI+O1xyXG4gICAgZ2V0SXRlbShpOiBudW1iZXIpOiBQcm9taXNlPFQ+O1xyXG59XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkaXJlY3RpdmUtc2VsZWN0b3JcclxuICAgIHNlbGVjdG9yOiAnW3ZpcnR1YWxSZXBlYXRBc3luY2hdJ1xyXG59KVxyXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6ZGlyZWN0aXZlLWNsYXNzLXN1ZmZpeFxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFJlcGVhdEFzeW5jaDxUPiBleHRlbmRzIFZpcnR1YWxSZXBlYXRCYXNlPFQ+IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9jb2xsZWN0aW9uOiBJQXN5bmNoQ29sbGVjdGlvbjxUPjtcclxuXHJcbiAgICBASW5wdXQoKSB2aXJ0dWFsUmVwZWF0QXN5bmNoT2Y6IE5nSXRlcmFibGU8VD47XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb25gICtcclxuICAgICAgICAgICAgICAgICAgICBgIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KClcclxuICAgIHNldCB2aXJ0dWFsUmVwZWF0QXN5bmNoRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyOiBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyLFxyXG4gICAgICAgIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICAgICAgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcclxuICAgICAgICBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcclxuICAgICAgICBsb2dnZXI6IExvZ2dlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKF92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLCBfZGlmZmVycywgX3RlbXBsYXRlLCBfdmlld0NvbnRhaW5lclJlZiwgbG9nZ2VyKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCd2aXJ0dWFsUmVwZWF0QXN5bmNoT2YnIGluIGNoYW5nZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXRhY2hBbGxWaWV3cygpO1xyXG4gICAgICAgICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0QXN5bmNoT2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdEFzeW5jaE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uID0gdmFsdWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlLm5leHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG1lYXN1cmUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7IHJldHVybjsgfVxyXG4gICAgICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uZ2V0TGVuZ3RoKCkudGhlbigobGVuZ3RoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb25MZW5ndGggPSBsZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuaG9sZGVySGVpZ2h0ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRSb3dIZWlnaHQoKSAqIGxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0TGF5b3V0Lm5leHQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlVmlldyhpbmRleDogbnVtYmVyLCBhZGRCZWZvcmU6IGJvb2xlYW4pOiBQcm9taXNlPFZpZXdSZWY+IHtcclxuICAgICAgICBsZXQgdmlldzogVmlld1JlZjtcclxuICAgICAgICBpZiAoIXRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2F1dG9IZWlnaHRWYXJpYWJsZSAmJiAhISh2aWV3ID0gdGhpcy5fcmVjeWNsZXIucmVjb3ZlclZpZXcoKSkpIHtcclxuICAgICAgICAgICAgLy8gcmVjb3ZlciByZWN5Y2xlZCB2aWV3cy4gV2lsbCBiZSBmaWxsZWQgd2l0aCBuZXcgaXRlbSBvbmNlIHJlY2VpdmVkLlxyXG4gICAgICAgICAgICBjb25zdCBlbWJlZFZpZXcgPSAoPEVtYmVkZGVkVmlld1JlZjxWaXJ0dWFsUmVwZWF0Um93Pj52aWV3KTtcclxuICAgICAgICAgICAgZW1iZWRWaWV3LmNvbnRleHQuaW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgZW1iZWRWaWV3LnJvb3ROb2Rlc1swXS5zdHlsZS5oZWlnaHQgPSB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmdldFJvd0hlaWdodCgpICsgJ3B4JztcclxuICAgICAgICAgICAgZW1iZWRWaWV3LmNvbnRleHQuJGltcGxpY2l0ID0gdGhpcy5lbXB0eUl0ZW0oZW1iZWRWaWV3LmNvbnRleHQuJGltcGxpY2l0KTtcclxuICAgICAgICAgICAgdmlldy5yZWF0dGFjaCgpO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmluc2VydCh2aWV3LCAoYWRkQmVmb3JlID8gMCA6IHVuZGVmaW5lZCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZ2V0SXRlbShpbmRleCkudGhlbigoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZpZXdGb3JJdGVtKGluZGV4LCBpdGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdfQ==