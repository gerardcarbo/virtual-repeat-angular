import { DoCheck, IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { LoggerService } from './logger.service';
import * as i0 from "@angular/core";
export declare class VirtualRepeat<T> extends VirtualRepeatBase<T> implements OnChanges, DoCheck, OnInit, OnDestroy {
    private _collection;
    virtualRepeatOf: NgIterable<T>;
    set virtualRepeatForTrackBy(fn: TrackByFunction<T>);
    get virtualRepeatForTrackBy(): TrackByFunction<T>;
    set virtualRepeatForTemplate(value: TemplateRef<VirtualRepeatRow>);
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<VirtualRepeatRow>, _viewContainerRef: ViewContainerRef, logger: LoggerService);
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    private applyChanges;
    protected measure(): void;
    protected createView(index: number): Promise<ViewRef>;
    static ɵfac: i0.ɵɵFactoryDeclaration<VirtualRepeat<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<VirtualRepeat<any>, "[virtualRepeat]", never, { "virtualRepeatOf": "virtualRepeatOf"; "virtualRepeatForTrackBy": "virtualRepeatForTrackBy"; "virtualRepeatForTemplate": "virtualRepeatForTemplate"; }, {}, never, never, false>;
}
export declare function getTypeNameForDebugging(type: any): string;
