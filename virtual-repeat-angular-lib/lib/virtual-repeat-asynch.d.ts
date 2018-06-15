import { IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { Observable } from 'rxjs';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatRow, VirtualRepeatBase } from 'virtual-repeat-angular-lib/virtual-repeat.base';
export interface IAsynchCollection {
    getLength(): Observable<number>;
    getItem(i: number): Observable<any>;
}
export declare class VirtualRepeatAsynch<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {
    protected _collection: IAsynchCollection;
    virtualRepeatAsynchOf: NgIterable<T>;
    virtualRepeatAsynchForTrackBy: TrackByFunction<T>;
    virtualRepeatAsynchForTemplate: TemplateRef<VirtualRepeatRow>;
    constructor(_virtualRepeatContainer: VirtualRepeatContainer, _differs: IterableDiffers, _template: TemplateRef<VirtualRepeatRow>, _viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    protected measure(): void;
    protected layout(): void;
    protected insertViews(collection_length: number): void;
    protected getView(collection_length: number, position: number): Observable<ViewRef>;
}
