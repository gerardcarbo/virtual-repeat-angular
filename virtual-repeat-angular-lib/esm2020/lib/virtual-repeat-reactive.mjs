import { Directive, Input, isDevMode } from '@angular/core';
import { VirtualRepeatBase, Deferred } from './virtual-repeat.base';
import * as i0 from "@angular/core";
import * as i1 from "./virtual-repeat-container";
import * as i2 from "./logger.service";
// tslint:disable-next-line:directive-class-suffix
export class VirtualRepeatReactive extends VirtualRepeatBase {
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
VirtualRepeatReactive.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatReactive, deps: [{ token: i1.VirtualRepeatContainer }, { token: i0.IterableDiffers }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: i2.LoggerService }], target: i0.ɵɵFactoryTarget.Directive });
VirtualRepeatReactive.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.6", type: VirtualRepeatReactive, selector: "[virtualRepeatReactive]", inputs: { virtualRepeatReactiveForTrackBy: "virtualRepeatReactiveForTrackBy", virtualRepeatReactiveForTemplate: "virtualRepeatReactiveForTemplate", virtualRepeatReactiveOf: "virtualRepeatReactiveOf" }, usesInheritance: true, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatReactive, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[virtualRepeatReactive]'
                }]
        }], ctorParameters: function () { return [{ type: i1.VirtualRepeatContainer }, { type: i0.IterableDiffers }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: i2.LoggerService }]; }, propDecorators: { virtualRepeatReactiveForTrackBy: [{
                type: Input
            }], virtualRepeatReactiveForTemplate: [{
                type: Input
            }], virtualRepeatReactiveOf: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtcmVhY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi9zcmMvbGliL3ZpcnR1YWwtcmVwZWF0LXJlYWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBRVQsS0FBSyxFQUNMLFNBQVMsRUFXVixNQUFNLGVBQWUsQ0FBQztBQUl2QixPQUFPLEVBQUUsaUJBQWlCLEVBQW9CLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7O0FBb0N0RixrREFBa0Q7QUFDbEQsTUFBTSxPQUFPLHFCQUF5QixTQUFRLGlCQUFvQjtJQW1DaEUsWUFDRSxzQkFBOEMsRUFDOUMsT0FBd0IsRUFDeEIsUUFBdUMsRUFDdkMsZ0JBQWtDLEVBQ2xDLE1BQXFCO1FBRXJCLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBS3JFLG1CQUFjLEdBQTJDLEVBQUUsQ0FBQztJQUpwRSxDQUFDO0lBMUNELE1BQU0sQ0FBQyxzQkFBc0IsQ0FDM0IsR0FBNkIsRUFDN0IsR0FBWTtRQUVaLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQ0ksK0JBQStCLENBQUMsRUFBc0I7UUFDeEQsSUFBSSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsRUFBRTtZQUN6RCxJQUFTLE9BQU8sSUFBUyxPQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNyQyxPQUFPLENBQUMsSUFBSSxDQUNWLDRDQUE0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzs7Z0NBRXhDLENBQ3ZCLENBQUM7YUFDSDtTQUNGO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUks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TyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFDO0lBQ0gsQ0FBQztJQUVELFlBQVksQ0FBQyxVQUFtQjtRQUM5QixJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2Ysc0JBQXNCO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7U0FDMUI7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7O2tIQTdLVSxxQkFBcUI7c0dBQXJCLHFCQUFxQjsyRkFBckIscUJBQXFCO2tCQUxqQyxTQUFTO21CQUFDO29CQUNULDhDQUE4QztvQkFDOUMsUUFBUSxFQUFFLHlCQUF5QjtpQkFDcEM7Z09BV0ssK0JBQStCO3NCQURsQyxLQUFLO2dCQW1CRixnQ0FBZ0M7c0JBRG5DLEtBQUs7Z0JBT0csdUJBQXVCO3NCQUEvQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIElucHV0LFxuICBpc0Rldk1vZGUsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgTmdJdGVyYWJsZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVGVtcGxhdGVSZWYsXG4gIFRyYWNrQnlGdW5jdGlvbixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld1JlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRCYXNlLCBWaXJ0dWFsUmVwZWF0Um93LCBEZWZlcnJlZCB9IGZyb20gJy4vdmlydHVhbC1yZXBlYXQuYmFzZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0Q29udGFpbmVyIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1jb250YWluZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZWFjdGl2ZUNvbGxlY3Rpb25GYWN0b3J5PFQ+IHtcbiAgY3JlYXRlKCk6IElSZWFjdGl2ZUNvbGxlY3Rpb248VD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlYWN0aXZlQ29sbGVjdGlvbjxUPiB7XG4gIGxlbmd0aCQ6IE9ic2VydmFibGU8bnVtYmVyPjtcbiAgaXRlbXMkOiBPYnNlcnZhYmxlPHsgaW5kZXg6IG51bWJlcjsgaXRlbTogVCB9PjtcbiAgcmVzZXQkOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuXG4gIGNvbm5lY3QoKTogdm9pZDtcbiAgZGlzY29ubmVjdCgpOiB2b2lkO1xuXG4gIHJlc2V0KCk6IHZvaWQ7XG5cbiAgcmVxdWVzdExlbmd0aCgpOiB2b2lkO1xuICByZXF1ZXN0SXRlbShpbmRleDogbnVtYmVyKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIEZvckRpcmVjdGl2ZUNvbnRleHQ8VD4ge1xuICAkaW1wbGljaXQ6IFQ7XG4gIGluZGV4OiBudW1iZXI7XG4gIGZpcnN0OiBib29sZWFuO1xuICBsYXN0OiBib29sZWFuO1xuICBldmVuOiBib29sZWFuO1xuICBvZGQ6IGJvb2xlYW47XG4gIGNvdW50OiBudW1iZXI7XG59XG5cbkBEaXJlY3RpdmUoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6ZGlyZWN0aXZlLXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnW3ZpcnR1YWxSZXBlYXRSZWFjdGl2ZV0nXG59KVxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRpcmVjdGl2ZS1jbGFzcy1zdWZmaXhcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsUmVwZWF0UmVhY3RpdmU8VD4gZXh0ZW5kcyBWaXJ0dWFsUmVwZWF0QmFzZTxUPiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxUPihcbiAgICBkaXI6IFZpcnR1YWxSZXBlYXRSZWFjdGl2ZTxUPixcbiAgICBjdHg6IHVua25vd25cbiAgKTogY3R4IGlzIEZvckRpcmVjdGl2ZUNvbnRleHQ8VD4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgQElucHV0KClcbiAgc2V0IHZpcnR1YWxSZXBlYXRSZWFjdGl2ZUZvclRyYWNrQnkoZm46IFRyYWNrQnlGdW5jdGlvbjxUPikge1xuICAgIGlmIChpc0Rldk1vZGUoKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKDxhbnk+Y29uc29sZSAmJiA8YW55PmNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LlxuICAgICAgICAgIFNlZSBodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpL2NvbW1vbi9pbmRleC9OZ0Zvci1kaXJlY3RpdmUuaHRtbCMhI2NoYW5nZS1wcm9wYWdhdGlvblxuICAgICAgICAgIGZvciBtb3JlIGluZm9ybWF0aW9uLmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XG4gIH1cblxuICBnZXQgdmlydHVhbFJlcGVhdFJlYWN0aXZlRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4ge1xuICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XG4gIH1cblxuICBASW5wdXQoKVxuICBzZXQgdmlydHVhbFJlcGVhdFJlYWN0aXZlRm9yVGVtcGxhdGUodmFsdWU6IFRlbXBsYXRlUmVmPFZpcnR1YWxSZXBlYXRSb3c+KSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIEBJbnB1dCgpIHZpcnR1YWxSZXBlYXRSZWFjdGl2ZU9mOiBOZ0l0ZXJhYmxlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZpcnR1YWxSZXBlYXRDb250YWluZXI6IFZpcnR1YWxSZXBlYXRDb250YWluZXIsXG4gICAgZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxWaXJ0dWFsUmVwZWF0Um93PixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIGxvZ2dlcjogTG9nZ2VyU2VydmljZVxuICApIHtcbiAgICBzdXBlcih2aXJ0dWFsUmVwZWF0Q29udGFpbmVyLCBkaWZmZXJzLCB0ZW1wbGF0ZSwgdmlld0NvbnRhaW5lclJlZiwgbG9nZ2VyKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfY29sbGVjdGlvbjogSVJlYWN0aXZlQ29sbGVjdGlvbjxUPjtcblxuICBwcml2YXRlIF92aWV3RGVmZXJyZWRzOiB7IFtpbmRleDogbnVtYmVyXTogRGVmZXJyZWQ8Vmlld1JlZj4gfSA9IFtdO1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoJ3ZpcnR1YWxSZXBlYXRSZWFjdGl2ZU9mJyBpbiBjaGFuZ2VzKSB7XG4gICAgICB0aGlzLmRldGFjaEFsbFZpZXdzKCk7XG5cbiAgICAgIC8vIFJlYWN0IG9uIHZpcnR1YWxSZXBlYXRSZWFjdGl2ZU9mIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxuICAgICAgbGV0IHZhbHVlID0gY2hhbmdlc1sndmlydHVhbFJlcGVhdFJlYWN0aXZlT2YnXS5jdXJyZW50VmFsdWU7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlLmNyZWF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGlzIGZhY3Rvcnk/XG4gICAgICAgIHZhbHVlID0gdmFsdWUuY3JlYXRlKCk7IC8vIGNyZWF0ZSByZWFjdGl2ZSBjb2xsZWN0aW9uXG4gICAgICB9XG4gICAgICB0aGlzLl9jb2xsZWN0aW9uID0gdmFsdWU7XG4gICAgICB0aGlzLl9jb2xsZWN0aW9uLmNvbm5lY3QoKTtcbiAgICAgIHRoaXMubG9nZ2VyLmxvZygnbmdPbkNoYW5nZXM6IHRoaXMuX2NvbGxlY3Rpb24gYXNpZ25lZC4nKTtcblxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5sZW5ndGgkLnN1YnNjcmliZShcbiAgICAgICAgICBsZW5naHQgPT4gdGhpcy5vbkxlbmd0aChsZW5naHQpLFxuICAgICAgICAgIGVycm9yID0+IHtcbiAgICAgICAgICAgIHRoaXMub25MZW5ndGgoMCk7XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5pdGVtcyQuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLm9uSXRlbShkYXRhKTtcbiAgICAgICAgICB9IGNhdGNoIChleGMpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygnb25JdGVtOiBFeGNlcHRpb24nLCBleGMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgIHRoaXMuX2NvbGxlY3Rpb24ucmVzZXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgdGhpcy5yZXF1ZXN0TWVhc3VyZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbm5lY3QoKSB7XG4gICAgc3VwZXIuY29ubmVjdCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGRpc2Nvbm5lY3QoKSB7XG4gICAgc3VwZXIuZGlzY29ubmVjdCgpO1xuICAgIGlmICghIXRoaXMuX2NvbGxlY3Rpb24pIHtcbiAgICAgIHRoaXMuX2NvbGxlY3Rpb24uZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBtZWFzdXJlKCkge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnbWVhc3VyZTogZW50ZXInKTtcbiAgICBpZiAoIXRoaXMuX2NvbGxlY3Rpb24pIHtcbiAgICAgIHRoaXMubG9nZ2VyLmxvZygnbWVhc3VyZTogIXRoaXMuX2NvbGxlY3Rpb24uIEV4aXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl92aXJ0dWFsUmVwZWF0Q29udGFpbmVyLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgdGhpcy5sb2dnZXIubG9nKCdtZWFzdXJlOiByZXF1ZXN0TGVuZ3RoIC0+IG9uTGVuZ3RoJyk7XG4gICAgdGhpcy5fY29sbGVjdGlvbi5yZXF1ZXN0TGVuZ3RoKCk7XG4gIH1cblxuICBvbkxlbmd0aChsZW5ndGg6IG51bWJlcikge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnb25MZW5ndGg6IGVudGVyJywgdGhpcy5fY29sbGVjdGlvbkxlbmd0aCwgbGVuZ3RoKTtcblxuICAgIHRoaXMuX2lzSW5NZWFzdXJlID0gdHJ1ZTtcbiAgICB0aGlzLl9jb2xsZWN0aW9uTGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuaG9sZGVySGVpZ2h0ID0gdGhpcy5fdmlydHVhbFJlcGVhdENvbnRhaW5lci5nZXRSb3dIZWlnaHQoKSAqIGxlbmd0aDtcbiAgICAvLyBjYWxjdWxhdGUgYSBhcHByb3hpbWF0ZSBudW1iZXIgb2Ygd2hpY2ggYSB2aWV3IGNhbiBjb250YWluXG4gICAgdGhpcy5faXNJbk1lYXN1cmUgPSBmYWxzZTtcbiAgICB0aGlzLmxvZ2dlci5sb2coJ29uTGVuZ3RoOiByZXF1ZXN0TGF5b3V0Jyk7XG4gICAgaWYgKGxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVxdWVzdExheW91dC5uZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVWaWV3KGluZGV4OiBudW1iZXIsIGFkZEJlZm9yZTogYm9vbGVhbik6IFByb21pc2U8Vmlld1JlZj4ge1xuICAgIHRoaXMubG9nZ2VyLmxvZygnY3JlYXRlVmlldzogcmVxdWVzdEl0ZW06ICcsIGluZGV4KTtcbiAgICBsZXQgdmlldztcbiAgICBpZiAoIXRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuX2F1dG9IZWlnaHRWYXJpYWJsZSAmJiAhISh2aWV3ID0gdGhpcy5fcmVjeWNsZXIucmVjb3ZlclZpZXcoKSkpIHtcbiAgICAgIC8vIHJlY292ZXIgcmVjeWNsZWQgdmlld3MuIFdpbGwgYmUgZmlsbGVkIHdpdGggbmV3IGl0ZW0gb25jZSByZWNlaXZlZC5cbiAgICAgIGNvbnN0IGVtYmVkVmlldyA9IDxFbWJlZGRlZFZpZXdSZWY8VmlydHVhbFJlcGVhdFJvdz4+dmlldztcbiAgICAgIGVtYmVkVmlldy5jb250ZXh0LmluZGV4ID0gaW5kZXg7XG4gICAgICBlbWJlZFZpZXcucm9vdE5vZGVzWzBdLnN0eWxlLmhlaWdodCA9IHRoaXMuX3ZpcnR1YWxSZXBlYXRDb250YWluZXIuZ2V0Um93SGVpZ2h0KCkgKyAncHgnO1xuICAgICAgZW1iZWRWaWV3LmNvbnRleHQuJGltcGxpY2l0ID0gdGhpcy5lbXB0eUl0ZW0oZW1iZWRWaWV3LmNvbnRleHQuJGltcGxpY2l0KTtcbiAgICAgIGVtYmVkVmlldy5jb250ZXh0LnJlY3ljbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHZpZXcsIGFkZEJlZm9yZSA/IDAgOiB1bmRlZmluZWQpO1xuICAgICAgdmlldy5yZWF0dGFjaCgpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmxvZygnY3JlYXRlVmlldzogX3ZpZXdEZWZlcnJlZHMgYWRkOiAnLCBpbmRleCk7XG4gICAgdGhpcy5fdmlld0RlZmVycmVkc1tpbmRleF0gPSBuZXcgRGVmZXJyZWQoKTtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLnJlcXVlc3RJdGVtKGluZGV4KTtcblxuICAgIHJldHVybiB0aGlzLl92aWV3RGVmZXJyZWRzW2luZGV4XS5wcm9taXNlO1xuICB9XG5cbiAgb25JdGVtKGRhdGE6IHsgaW5kZXg6IG51bWJlcjsgaXRlbTogVCB9KSB7XG4gICAgY29uc3QgeyBpbmRleCwgaXRlbSB9ID0gZGF0YTtcbiAgICB0aGlzLmxvZ2dlci5sb2coJ29uSXRlbTogZW50ZXInLCBpbmRleCwgaXRlbSk7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuY3JlYXRlVmlld0Zvckl0ZW0oaW5kZXgsIGl0ZW0pO1xuICAgIGlmICh0aGlzLl92aWV3RGVmZXJyZWRzW2luZGV4XSkge1xuICAgICAgdGhpcy5sb2dnZXIubG9nKCdvbkl0ZW06IF92aWV3UHJvbWlzZXMgcmVzb2x2ZTogJywgaW5kZXgpO1xuICAgICAgdGhpcy5fdmlld0RlZmVycmVkc1tpbmRleF0ucmVzb2x2ZSh2aWV3KTtcbiAgICB9XG4gIH1cblxuICBvblByb2Nlc3NpbmcocHJvY2Vzc2luZzogYm9vbGVhbik6IGFueSB7XG4gICAgaWYgKCFwcm9jZXNzaW5nKSB7XG4gICAgICAvLyBwcm9jZXNzaW5nIGZpbmlzaGVkXG4gICAgICB0aGlzLmxvZ2dlci5sb2coJ29uUHJvY2Vzc2luZzogX3ZpZXdEZWZlcnJlZHMgZGVsZXRpbmcnKTtcbiAgICAgIHRoaXMuX3ZpZXdEZWZlcnJlZHMgPSBbXTtcbiAgICB9XG4gICAgc3VwZXIub25Qcm9jZXNzaW5nKHByb2Nlc3NpbmcpO1xuICB9XG59XG4iXX0=