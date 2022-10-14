import { IterableDiffers, NgIterable, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, ViewRef } from '@angular/core';
import { Observable } from 'rxjs';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';
import { LoggerService } from './logger.service';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import * as i0 from "@angular/core";
export interface IReactiveCollectionFactory<T> {
    create(): IReactiveCollection<T>;
}
export interface IReactiveCollection<T> {
    length$: Observable<number>;
    items$: Observable<{
        index: number;
        item: T;
    }>;
    reset$: Observable<boolean>;
    connect(): void;
    disconnect(): void;
    reset(): void;
    requestLength(): void;
    requestItem(index: number): void;
}
interface ForDirectiveContext<T> {
    $implicit: T;
    index: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
    count: number;
}
export declare class VirtualRepeatReactive<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {
    static ngTemplateContextGuard<T>(dir: VirtualRepeatReactive<T>, ctx: unknown): ctx is ForDirectiveContext<T>;
    set virtualRepeatReactiveForTrackBy(fn: TrackByFunction<T>);
    get virtualRepeatReactiveForTrackBy(): TrackByFunction<T>;
    set virtualRepeatReactiveForTemplate(value: TemplateRef<VirtualRepeatRow>);
    virtualRepeatReactiveOf: NgIterable<T>;
    constructor(virtualRepeatContainer: VirtualRepeatContainer, differs: IterableDiffers, template: TemplateRef<VirtualRepeatRow>, viewContainerRef: ViewContainerRef, logger: LoggerService);
    protected _collection: IReactiveCollection<T>;
    private _viewDeferreds;
    ngOnChanges(changes: SimpleChanges): void;
    protected connect(): void;
    protected disconnect(): void;
    protected measure(): void;
    onLength(length: number): void;
    protected createView(index: number, addBefore: boolean): Promise<ViewRef>;
    onItem(data: {
        index: number;
        item: T;
    }): void;
    onProcessing(processing: boolean): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<VirtualRepeatReactive<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<VirtualRepeatReactive<any>, "[virtualRepeatReactive]", never, { "virtualRepeatReactiveForTrackBy": "virtualRepeatReactiveForTrackBy"; "virtualRepeatReactiveForTemplate": "virtualRepeatReactiveForTemplate"; "virtualRepeatReactiveOf": "virtualRepeatReactiveOf"; }, {}, never, never, false>;
}
export {};
