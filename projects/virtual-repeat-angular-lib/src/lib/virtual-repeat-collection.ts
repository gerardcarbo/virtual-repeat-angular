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

import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { LoggerService } from './logger.service';

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
        _viewContainerRef: ViewContainerRef,
        logger: LoggerService) {
        super(_virtualRepeatContainer, _differs, _template, _viewContainerRef, logger)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('virtualRepeatOf' in changes) {
            // React on virtualRepeatOf only once all inputs have been initialized
            const value = changes['virtualRepeatOf'].currentValue;
            if (this._collection == undefined) {
                this._collection = value;
                this.requestMeasure.next();
            } else if (!this._differ && value) {
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
                // this.logger.log('new item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(currentIndex, 0, item.item);
            } else if (currentIndex == null) {
                // remove item
                this.logger.log('remove item', item, adjustedPreviousIndex, currentIndex);
                isMeasurementRequired = true;
                this._collection.splice(adjustedPreviousIndex, 1);
            } else {
                // move item
                this.logger.log('move item', item, adjustedPreviousIndex, currentIndex);
                this._collection.splice(currentIndex, 0, this._collection.splice(adjustedPreviousIndex, 1)[0]);
            }
        });

        changes.forEachIdentityChange((record: any) => {
            this._collection[record.currentIndex] = record.item;
        });

        if (isMeasurementRequired) {
            this.requestMeasure.next();
        } else {
            this.requestLayout.next();
        }
    }

    protected measure() {
        this.logger.log("measure: enter");
        this._collectionLength = !this._collection || this._collection.length === 0 ? 0 : this._collection.length;
        this._isInMeasure = true;
        this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * this._collectionLength;
        this._isInMeasure = false;
        this.requestLayout.next();
        this.logger.log("measure: exit");
    }

    protected createView(index: number): Promise<ViewRef> {
        let item = this._collection[index];
        let view = this.createViewForItem(index, item);
        return Promise.resolve(view);
    }
}

export function getTypeNameForDebugging(type: any): string {
    return type['name'] || typeof type;
}
