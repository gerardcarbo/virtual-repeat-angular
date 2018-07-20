import {
    Directive,
    EmbeddedViewRef,
    Input,
    isDevMode,
    IterableDiffers,
    NgIterable,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewContainerRef,
    ViewRef
} from '@angular/core';

import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
import { LoggerService } from './logger.service';

export interface IAsynchCollection<T> {
    getLength(): Promise<number>;
    getItem(i: number): Promise<T>;
}

@Directive({
    selector: '[virtualRepeatAsynch]'
})
export class VirtualRepeatAsynch<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {

    protected _collection: IAsynchCollection<T>;

    @Input() virtualRepeatAsynchOf: NgIterable<T>;

    @Input()
    set virtualRepeatAsynchForTrackBy(fn: TrackByFunction<T>) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (<any>console && <any>console.warn) {
                console.warn(
                    `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }

    get virtualRepeatAsynchForTrackBy(): TrackByFunction<T> {
        return this._trackByFn;
    }

    @Input()
    set virtualRepeatAsynchForTemplate(value: TemplateRef<VirtualRepeatRow>) {
        if (value) {
            this._template = value;
        }
    }

    constructor(_virtualRepeatContainer: VirtualRepeatContainer,
        _differs: IterableDiffers,
        _template: TemplateRef<VirtualRepeatRow>,
        _viewContainerRef: ViewContainerRef,
        logger: LoggerService
    ) {
        super(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('virtualRepeatAsynchOf' in changes) {
            // React on virtualRepeatAsynchOf only once all inputs have been initialized
            const value = changes['virtualRepeatAsynchOf'].currentValue;
            this._collection = value;

            this.requestMeasure.next();
        }
    }

    protected measure() {
        if (!this._collection) return;
        this._isInMeasure = true;
        this._virtualRepeatContainer.processing = true;
        this._collection.getLength().then((length) => {
            this._collectionLength = length;
            this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * length;
            this._isInMeasure = false;
            this.requestLayout.next();
        });
    }

    protected createView(index: number, addBefore: boolean): Promise<ViewRef> {
        let view;
        if (view = this._recycler.recoverView()) { //recover recycled views. Will be filled with new item once received.
            let embedView = (<EmbeddedViewRef<VirtualRepeatRow>>view);
            embedView.context.index = index;
            embedView.rootNodes[0].style.height = this._virtualRepeatContainer._rowHeight + "px";
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

