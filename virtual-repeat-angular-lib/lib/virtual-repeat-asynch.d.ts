import { IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { LoggerService } from './logger.service';
import * as i0 from "@angular/core";
export interface IAsynchCollection<T> {
    getLength(): Promise<number>;
    getItem(i: number): Promise<T>;
}
export declare class VirtualRepeatAsynch<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {
    protected _collection: IAsynchCollection<T>;
    virtualRepeatAsynchOf: NgIterable<T>;
    set virtualRepeatAsynchForTrackBy(fn: TrackByFunction<T>);
    get virtualRepeatAsynchForTrackBy(): TrackByFunction<T>;
    set virtualRepeatAsynchForTemplate(value: TemplateRef<VirtualRepeatRow>);
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<VirtualRepeatRow>, _viewContainerRef: ViewContainerRef, logger: LoggerService);
    ngOnChanges(changes: SimpleChanges): void;
    protected measure(): void;
    protected createView(index: number, addBefore: boolean): Promise<ViewRef>;
    static ɵfac: i0.ɵɵFactoryDeclaration<VirtualRepeatAsynch<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<VirtualRepeatAsynch<any>, "[virtualRepeatAsynch]", never, { "virtualRepeatAsynchOf": "virtualRepeatAsynchOf"; "virtualRepeatAsynchForTrackBy": "virtualRepeatAsynchForTrackBy"; "virtualRepeatAsynchForTemplate": "virtualRepeatAsynchForTemplate"; }, {}, never, never, false>;
}
