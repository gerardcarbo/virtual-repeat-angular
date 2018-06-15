import { DoCheck, IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { VirtualRepeatContainer } from 'virtual-repeat-angular-lib/virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
export declare class VirtualRepeat<T> extends VirtualRepeatBase<T> implements OnChanges, DoCheck, OnInit, OnDestroy {
    private _collection;
    virtualRepeatOf: NgIterable<T>;
    virtualRepeatForTrackBy: TrackByFunction<T>;
    virtualRepeatForTemplate: TemplateRef<VirtualRepeatRow>;
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<VirtualRepeatRow>, _viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    private applyChanges(changes);
    ngOnDestroy(): void;
    protected measure(): void;
    protected layout(): void;
    protected insertViews(): void;
    protected getView(position: number): ViewRef;
}
export declare function getTypeNameForDebugging(type: any): string;
