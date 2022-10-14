import { Directive, Input, isDevMode } from '@angular/core';
import { VirtualRepeatBase } from './virtual-repeat.base';
import * as i0 from "@angular/core";
import * as i1 from "./virtual-repeat-container";
import * as i2 from "./logger.service";
// tslint:disable-next-line:directive-class-suffix
export class VirtualRepeat extends VirtualRepeatBase {
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
VirtualRepeat.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeat, deps: [{ token: i1.VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: i2.LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeat.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeat, selector: "[virtualRepeat]", inputs: { virtualRepeatOf: "virtualRepeatOf", virtualRepeatForTrackBy: "virtualRepeatForTrackBy", virtualRepeatForTemplate: "virtualRepeatForTemplate" }, usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeat, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[virtualRepeat]'
                }]
        }], ctorParameters: function () { return [{ type: i1.VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: i2.LoggerService }]; }, propDecorators: { virtualRepeatOf: [{
                type: Input
            }], virtualRepeatForTrackBy: [{
                type: Input
            }], virtualRepeatForTemplate: [{
                type: Input
            }] } });
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3ZpcnR1YWwtcmVwZWF0LWFuZ3VsYXItbGliL3NyYy9saWIvdmlydHVhbC1yZXBlYXQtY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFDTCxTQUFTLEVBYVYsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLGlCQUFpQixFQUFvQixNQUFNLHVCQUF1QixDQUFDOzs7O0FBUTVFLGtEQUFrRDtBQUNsRCxNQUFNLE9BQU8sYUFBaUIsU0FBUSxpQkFBb0I7SUErQnhELFlBQ0UsdUJBQStDLEVBQy9DLFFBQXlCLEVBQ3pCLFNBQXdDLEVBQ3hDLGlCQUFtQyxFQUNuQyxNQUFxQjtRQUVyQixLQUFLLENBQ0gsdUJBQXVCLEVBQ3ZCLFFBQVEsRUFDUixTQUFTLEVBQ1QsaUJBQWlCLEVBQ2pCLE1BQU0sQ0FDUCxDQUFDO0lBQ0osQ0FBQztJQXZDRCxJQUNJLHVCQUF1QixDQUFDLEVBQXNCO1FBQ2hELElBQUksU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxPQUFPLEVBQUUsS0FBSyxVQUFVLEVBQUU7WUFDekQsSUFBUyxPQUFPLElBQVMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDckMsT0FBTyxDQUFDLElBQUksQ0FDViw0Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSTtvQkFDaEUsb0dBQW9HO29CQUNwRyx3QkFBd0IsQ0FDM0IsQ0FBQzthQUNIO1NBQ0Y7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSx1QkFBdUI7UUFDekIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxJQUNJLHdCQUF3QixDQUFDLEtBQW9DO1FBQy9ELElBQUksS0FBSyxFQUFFO1lBQ1QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBa0JELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLGlCQUFpQixJQUFJLE9BQU8sRUFBRTtZQUNoQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFdEIsc0VBQXNFO1lBQ3RFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUN0RCxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztnQkFDekIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUM1QjtpQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUU7Z0JBQ2pDLElBQUk7b0JBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNsRTtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxLQUFLOytCQUMzQyx1QkFBdUIsQ0FDaEMsS0FBSyxDQUNOLDZEQUE2RCxDQUFDLENBQUM7aUJBQzNFO2FBQ0Y7U0FDRjtJQUNILENBQUM7SUFFRCxTQUFTO1FBQ1AsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4RCxJQUFJLE9BQU8sRUFBRTtnQkFDWCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzVCO1NBQ0Y7SUFDSCxDQUFDO0lBRU8sWUFBWSxDQUFDLE9BQTJCO1FBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxxQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFFbEMsT0FBTyxDQUFDLGdCQUFnQixDQUN0QixDQUNFLElBQStCLEVBQy9CLHFCQUE2QixFQUM3QixZQUFvQixFQUNwQixFQUFFO1lBQ0YsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksRUFBRTtnQkFDOUIsV0FBVztnQkFDWCwwRUFBMEU7Z0JBQzFFLHFCQUFxQixHQUFHLElBQUksQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckQ7aUJBQU0sSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO2dCQUMvQixjQUFjO2dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUNiLGFBQWEsRUFDYixJQUFJLEVBQ0oscUJBQXFCLEVBQ3JCLFlBQVksQ0FDYixDQUFDO2dCQUNGLHFCQUFxQixHQUFHLElBQUksQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkQ7aUJBQU07Z0JBQ0wsWUFBWTtnQkFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDYixXQUFXLEVBQ1gsSUFBSSxFQUNKLHFCQUFxQixFQUNyQixZQUFZLENBQ2IsQ0FBQztnQkFDRixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FDckIsWUFBWSxFQUNaLENBQUMsRUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDckQsQ0FBQzthQUNIO1FBQ0gsQ0FBQyxDQUNGLENBQUM7UUFFRixPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtZQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxxQkFBcUIsRUFBRTtZQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzVCO2FBQU07WUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQUVTLE9BQU87UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxpQkFBaUI7WUFDcEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDO2dCQUNILENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWTtZQUN2QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQ3ZFLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVTLFVBQVUsQ0FBQyxLQUFhO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQzs7MEdBdkpVLGFBQWE7OEZBQWIsYUFBYTsyRkFBYixhQUFhO2tCQUx6QixTQUFTO21CQUFDO29CQUNULDhDQUE4QztvQkFDOUMsUUFBUSxFQUFFLGlCQUFpQjtpQkFDNUI7Z09BTVUsZUFBZTtzQkFBdkIsS0FBSztnQkFHRix1QkFBdUI7c0JBRDFCLEtBQUs7Z0JBbUJGLHdCQUF3QjtzQkFEM0IsS0FBSzs7QUFrSVIsTUFBTSxVQUFVLHVCQUF1QixDQUFDLElBQVM7SUFDL0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUM7QUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLFxyXG4gIERvQ2hlY2ssXHJcbiAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gIElucHV0LFxyXG4gIGlzRGV2TW9kZSxcclxuICBJdGVyYWJsZUNoYW5nZVJlY29yZCxcclxuICBJdGVyYWJsZUNoYW5nZXMsXHJcbiAgSXRlcmFibGVEaWZmZXJzLFxyXG4gIE5nSXRlcmFibGUsXHJcbiAgT25DaGFuZ2VzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBUZW1wbGF0ZVJlZixcclxuICBUcmFja0J5RnVuY3Rpb24sXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxuICBWaWV3UmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0QmFzZSwgVmlydHVhbFJlcGVhdFJvdyB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQuYmFzZSc7XHJcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuL2xvZ2dlci5zZXJ2aWNlJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkaXJlY3RpdmUtc2VsZWN0b3JcclxuICBzZWxlY3RvcjogJ1t2aXJ0dWFsUmVwZWF0XSdcclxufSlcclxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRpcmVjdGl2ZS1jbGFzcy1zdWZmaXhcclxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXQ8VD4gZXh0ZW5kcyBWaXJ0dWFsUmVwZWF0QmFzZTxUPlxyXG4gIGltcGxlbWVudHMgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfY29sbGVjdGlvbjogYW55W107XHJcblxyXG4gIEBJbnB1dCgpIHZpcnR1YWxSZXBlYXRPZjogTmdJdGVyYWJsZTxUPjtcclxuXHJcbiAgQElucHV0KClcclxuICBzZXQgdmlydHVhbFJlcGVhdEZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xyXG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICBgdHJhY2tCeSBtdXN0IGJlIGEgZnVuY3Rpb24sIGJ1dCByZWNlaXZlZCAke0pTT04uc3RyaW5naWZ5KGZuKX0uIGAgK1xyXG4gICAgICAgICAgICBgU2VlIGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvY29tbW9uL2luZGV4L05nRm9yLWRpcmVjdGl2ZS5odG1sIyEjY2hhbmdlLXByb3BhZ2F0aW9uLiBgICtcclxuICAgICAgICAgICAgYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgfVxyXG5cclxuICBnZXQgdmlydHVhbFJlcGVhdEZvclRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKVxyXG4gIHNldCB2aXJ0dWFsUmVwZWF0Rm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgdGhpcy5fdGVtcGxhdGUgPSB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgX3ZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgX3RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcclxuICAgIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgbG9nZ2VyOiBMb2dnZXJTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICBzdXBlcihcclxuICAgICAgX3ZpcnR1YWxSZXBlYXRDb250YWluZXIsXHJcbiAgICAgIF9kaWZmZXJzLFxyXG4gICAgICBfdGVtcGxhdGUsXHJcbiAgICAgIF92aWV3Q29udGFpbmVyUmVmLFxyXG4gICAgICBsb2dnZXJcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRPZicgaW4gY2hhbmdlcykge1xyXG4gICAgICB0aGlzLmRldGFjaEFsbFZpZXdzKCk7XHJcblxyXG4gICAgICAvLyBSZWFjdCBvbiB2aXJ0dWFsUmVwZWF0T2Ygb25seSBvbmNlIGFsbCBpbnB1dHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdE9mJ10uY3VycmVudFZhbHVlO1xyXG4gICAgICBpZiAodGhpcy5fY29sbGVjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbiA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMucmVxdWVzdE1lYXN1cmUubmV4dCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHZhbHVlKS5jcmVhdGUodGhpcy5fdHJhY2tCeUZuKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfSdcclxuICAgICAgICAgICAgICAgICAgICBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICApfScuIE5nRm9yIG9ubHkgc3VwcG9ydHMgYmluZGluZyB0byBJdGVyYWJsZXMgc3VjaCBhcyBBcnJheXMuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ0RvQ2hlY2soKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XHJcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLnZpcnR1YWxSZXBlYXRPZik7XHJcbiAgICAgIGlmIChjaGFuZ2VzKSB7XHJcbiAgICAgICAgdGhpcy5hcHBseUNoYW5nZXMoY2hhbmdlcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxUPikge1xyXG4gICAgaWYgKCF0aGlzLl9jb2xsZWN0aW9uKSB7XHJcbiAgICAgIHRoaXMuX2NvbGxlY3Rpb24gPSBbXTtcclxuICAgIH1cclxuICAgIGxldCBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSBmYWxzZTtcclxuXHJcbiAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oXHJcbiAgICAgIChcclxuICAgICAgICBpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxhbnk+LFxyXG4gICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyXHJcbiAgICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChpdGVtLnByZXZpb3VzSW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgLy8gbmV3IGl0ZW1cclxuICAgICAgICAgIC8vIHRoaXMubG9nZ2VyLmxvZygnbmV3IGl0ZW0nLCBpdGVtLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICBpc01lYXN1cmVtZW50UmVxdWlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5zcGxpY2UoY3VycmVudEluZGV4LCAwLCBpdGVtLml0ZW0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgIC8vIHJlbW92ZSBpdGVtXHJcbiAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coXHJcbiAgICAgICAgICAgICdyZW1vdmUgaXRlbScsXHJcbiAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleCxcclxuICAgICAgICAgICAgY3VycmVudEluZGV4XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaXNNZWFzdXJlbWVudFJlcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuX2NvbGxlY3Rpb24uc3BsaWNlKGFkanVzdGVkUHJldmlvdXNJbmRleCwgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIG1vdmUgaXRlbVxyXG4gICAgICAgICAgdGhpcy5sb2dnZXIubG9nKFxyXG4gICAgICAgICAgICAnbW92ZSBpdGVtJyxcclxuICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgYWRqdXN0ZWRQcmV2aW91c0luZGV4LFxyXG4gICAgICAgICAgICBjdXJyZW50SW5kZXhcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShcclxuICAgICAgICAgICAgY3VycmVudEluZGV4LFxyXG4gICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLnNwbGljZShhZGp1c3RlZFByZXZpb3VzSW5kZXgsIDEpWzBdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBhbnkpID0+IHtcclxuICAgICAgdGhpcy5fY29sbGVjdGlvbltyZWNvcmQuY3VycmVudEluZGV4XSA9IHJlY29yZC5pdGVtO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGlzTWVhc3VyZW1lbnRSZXF1aXJlZCkge1xyXG4gICAgICB0aGlzLnJlcXVlc3RNZWFzdXJlLm5leHQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVxdWVzdExheW91dC5uZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgbWVhc3VyZSgpIHtcclxuICAgIHRoaXMubG9nZ2VyLmxvZygnbWVhc3VyZTogZW50ZXInKTtcclxuICAgIHRoaXMuX2NvbGxlY3Rpb25MZW5ndGggPVxyXG4gICAgICAhdGhpcy5fY29sbGVjdGlvbiB8fCB0aGlzLl9jb2xsZWN0aW9uLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgID8gMFxyXG4gICAgICAgIDogdGhpcy5fY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICB0aGlzLl9pc0luTWVhc3VyZSA9IHRydWU7XHJcbiAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLmhvbGRlckhlaWdodCA9XHJcbiAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuZ2V0Um93SGVpZ2h0KCkgKiB0aGlzLl9jb2xsZWN0aW9uTGVuZ3RoO1xyXG4gICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcclxuICAgIHRoaXMucmVxdWVzdExheW91dC5uZXh0KCk7XHJcbiAgICB0aGlzLmxvZ2dlci5sb2coJ21lYXN1cmU6IGV4aXQnKTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBjcmVhdGVWaWV3KGluZGV4OiBudW1iZXIpOiBQcm9taXNlPFZpZXdSZWY+IHtcclxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jb2xsZWN0aW9uW2luZGV4XTtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmNyZWF0ZVZpZXdGb3JJdGVtKGluZGV4LCBpdGVtKTtcclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmlldyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcclxuICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xyXG59XHJcbiJdfQ==