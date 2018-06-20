import {
    Directive,
    DoCheck,
    EmbeddedViewRef,
    Input,
    isDevMode,
    IterableChangeRecord,
    IterableChanges,
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

//import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
import { VirtualRepeatContainer } from './virtual-repeat-container';
//import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
//import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';

@Directive({
    selector: '[virtualRepeat]'
})
export class VirtualRepeat<T> extends VirtualRepeatBase<T> implements OnChanges, DoCheck, OnInit, OnDestroy {

    private _collection: any[];

    @Input() virtualRepeatOf: NgIterable<T>;

    @Input()
    set virtualRepeatForTrackBy(fn: TrackByFunction<T>) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (<any>console && <any>console.warn) {
                console.warn(
                    `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }

    get virtualRepeatForTrackBy(): TrackByFunction<T> {
        return this._trackByFn;
    }

    @Input()
    set virtualRepeatForTemplate(value: TemplateRef<VirtualRepeatRow>) {
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
        if ('virtualRepeatOf' in changes) {
            // React on virtualRepeatOf only once all inputs have been initialized
            const value = changes['virtualRepeatOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this._trackByFn);
                } catch (e) {
                    throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
    }

    ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.virtualRepeatOf);
            if (changes) {
                this.applyChanges(changes);
            }
        }
    }

    private applyChanges(changes: IterableChanges<T>) {
        if (!this._collection) {
            this._collection = [];
        }
        let isMeasurementRequired = false;

        changes.forEachOperation((item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
            if (item.previousIndex == null) {
                // new item
                // console.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(currentIndex, 0, item.item);
            } else if (currentIndex == null) {
                // remove item
                // console.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            } else {
                // move item
                // console.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });

        changes.forEachIdentityChange((record: any) => {
            this._collection[record.currentIndex] = record.item;
        });

        if (isMeasurementRequired) {
            this.requestMeasure();
        }

        this.requestLayout();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._recycler.clean();
    }

    protected measure() {
        let collectionNumber = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * collectionNumber;
        // calculate a approximate number of which a view can contain
        this.calculateScrapViewsLimit();
        this._isInMeasure = false;
        this._invalidate = true;
        this.requestLayout();
    }

    protected layout() {
        if (this._isInLayout) {
            return;
        }
        this._isInLayout = true;
        let { width, height } = this._virtualRepeatContainer.measure();
        this._containerWidth = width;
        this._containerHeight = height;
        if (!this._collection || this._collection.length === 0) {
            // detach all views without recycle them.
            for (let i = 0; i < this._viewContainerRef.length; i++) {
                let child = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
                this._viewContainerRef.detach(i);
                i--;
            }
            this._isInLayout = false;
            this._invalidate = false;
            return;
        }
        this.findPositionInRange(this._collection.length);
        for (let i = 0; i < this._viewContainerRef.length; i++) {
            let child = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
            this._viewContainerRef.detach(i);
            this._recycler.recycleView(child.context.index, child);
            i--;
        }
        this.insertViews();
        this._recycler.pruneScrapViews();
        this._isInLayout = false;
        this._invalidate = false;
    }

    protected insertViews() {
        if (this._viewContainerRef.length > 0) {
            let firstChild = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(0);
            let lastChild = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(this._viewContainerRef.length - 1);
            for (let i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
                let view = this.getView(i);
                this.dispatchLayout(i, view, true);
            }
            for (let i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
                let view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        } else {
            for (let i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
                let view = this.getView(i);
                this.dispatchLayout(i, view, false);
            }
        }
    }

    protected getView(position: number): ViewRef {
        let view = this._recycler.getView(position);
        let item = this._collection[position];
        let count = this._collection.length;
        if (!view) {
            view = this._template.createEmbeddedView(new VirtualRepeatRow(item, position, count));
        } else {
            (view as EmbeddedViewRef<VirtualRepeatRow>).context.$implicit = item;
            (view as EmbeddedViewRef<VirtualRepeatRow>).context.index = position;
            (view as EmbeddedViewRef<VirtualRepeatRow>).context.count = count;
        }
        return view;
    }
}


export function getTypeNameForDebugging(type: any): string {
    return type['name'] || typeof type;
}
