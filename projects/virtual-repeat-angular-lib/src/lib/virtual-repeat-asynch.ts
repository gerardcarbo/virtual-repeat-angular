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

import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
//import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib';
//import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';

export interface IAsynchCollection {
    getLength(): Observable<number>;
    getItem(i: number): Observable<any>;
}

@Directive({
    selector: '[virtualRepeatAsynch]'
})
export class VirtualRepeatAsynch<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {

    protected _collection: IAsynchCollection;
    protected _length = -1;

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
        _viewContainerRef: ViewContainerRef) {
        super(_virtualRepeatContainer, _differs, _template, _viewContainerRef)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('virtualRepeatAsynchOf' in changes) {
            // React on virtualRepeatAsynchOf only once all inputs have been initialized
            const value = changes['virtualRepeatAsynchOf'].currentValue;
            this._collection = value;

            this._virtualRepeatContainer._heightAutoComputed = false;

            this.requestMeasure();
        }
    }

    protected measure() {
        if (!this._collection) return;

        this._isInMeasure = true;
        this._collection.getLength().pipe(first()).subscribe((length) => {
            this._length = length;
            this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * length;
            // calculate a approximate number of which a view can contain
            this.calculateScrapViewsLimit();
            this._isInMeasure = false;
            this._invalidate = true;
            this.requestLayout();
        });
    }

    protected layout() {
        if (this._isInLayout) {
            return;
        }
        // console.log('on layout');
        this._isInLayout = true;
        let { width, height } = this._virtualRepeatContainer.measure();
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection) {
            // detach all views without recycle them.
            return this.detachAllViews();
        }

        if (this._length == 0) {
            return this.detachAllViews();
        }
        this.findPositionInRange(this._length);
        for (let i = 0; i < this._viewContainerRef.length; i++) {
            let child = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
            // if (child.context.index < this._firstItemPosition || child.context.index > this._lastItemPosition || this._invalidate) {
            this._viewContainerRef.detach(i);
            this._recycler.recycleView(child.context.index, child);
            i--;
            // }
        }
        this.insertViews(this._length);
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
    }

    protected insertViews(collection_length: number) {
        if (this._viewContainerRef.length > 0) {
            let firstChild = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(0);
            let lastChild = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(this._viewContainerRef.length - 1);
            for (let i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                this.getView(collection_length, i).subscribe((view) => {
                    this.dispatchLayout(i, view, true);
                });
            }
            for (let i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                let view = this.getView(collection_length, i).subscribe((view) => {
                    this.dispatchLayout(i, view, false);
                });
            }
        } else {
            for (let i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                this.getView(collection_length, i).subscribe((view) => {
                    this.dispatchLayout(i, view, false);
                });
            }
        }
    }

    protected getView(collection_length: number, position: number): Observable<ViewRef> {
        let view = this._recycler.getView(position);
        return this._collection.getItem(position)
            .pipe(
                first(),
                map((item) => {
                    if (!view) {
                        view = this._template.createEmbeddedView(new VirtualRepeatRow(item, position, collection_length));
                    } else {
                        (view as EmbeddedViewRef<VirtualRepeatRow>).context.$implicit = item;
                        (view as EmbeddedViewRef<VirtualRepeatRow>).context.index = position;
                        (view as EmbeddedViewRef<VirtualRepeatRow>).context.count = collection_length;
                    }
                    return view;
                })
            );
    }
}

