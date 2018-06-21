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
  ViewContainerRef
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatBase, VirtualRepeatRow } from './virtual-repeat.base';

export interface IReactiveCollection<T> {
  length$: Observable<number>;
  items$: Observable<{ index: number, item: T }>
  connect():void;
  disconnect():void;  
  requestLength():void;
  requestItem(index: number):void;
}

@Directive({
  selector: '[virtualRepeatReactive]'
})
export class VirtualRepeatReactive<T> extends VirtualRepeatBase<T> implements OnChanges, OnInit, OnDestroy {

  protected _collection: IReactiveCollection<T>;
  protected _length = -1;
  
  @Input() virtualRepeatReactiveOf: NgIterable<T>;

  @Input()
  set virtualRepeatReactiveForTrackBy(fn: TrackByFunction<T>) {
    if (isDevMode() && fn != null && typeof fn !== 'function') {
      if (<any>console && <any>console.warn) {
        console.warn(
          `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
          `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
      }
    }
    this._trackByFn = fn;
  }

  get virtualRepeatReactiveForTrackBy(): TrackByFunction<T> {
    return this._trackByFn;
  }

  @Input()
  set virtualRepeatReactiveForTemplate(value: TemplateRef<VirtualRepeatRow>) {
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
    if ('virtualRepeatReactiveOf' in changes) {
      // React on virtualRepeatReactiveOf only once all inputs have been initialized
      const value = changes['virtualRepeatReactiveOf'].currentValue;
      this._collection = value;
      console.log("ngOnChanges: this._collection asigned.");

      this._subscription.add(this._collection.length$.subscribe((lenght) => this.onLength(lenght)));
      this._subscription.add(this._collection.items$.subscribe((data) => this.onItem(data)));
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this._collection.connect();
    this.requestMeasure.next();
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this._collection.disconnect();
  }

  protected measure() {
    console.log("measure: enter");
    if (!this._collection){
      console.log("measure: !this._collection. Exit");
      return;
    } 

    console.log("measure: requestLength -> onLength");
    this._collection.requestLength();
  }

  onLength(length) {
    console.log("onLength: enter", this._length, length);
    this._isInMeasure = true;      
    this._length = length;
    this._virtualRepeatContainer.holderHeight = this._virtualRepeatContainer._rowHeight * length;
    // calculate a approximate number of which a view can contain
    this.calculateScrapViewsLimit();
    this._isInMeasure = false;     
    console.log("onLength: requestLayout");
    this.requestLayout.next(); 
  }

  protected layout() {
    console.log('layout: on layout');
    this._isInLayout = true;
    let { width, height } = this._virtualRepeatContainer.measure();
    this._containerWidth = width;
    this._containerHeight = height;
    if (!this._collection) {
      // detach all views without recycle them.
      console.log('layout: !this._collection. detachAllViews');
      this._isInLayout = false;
      return this.detachAllViews();
    }

    if (this._length == 0) {
      console.log('layout: this._isInLayout = false. detachAllViews');
      this._isInLayout = false;
      return this.detachAllViews();
    }
    this.findPositionInRange(this._length);
    for (let i = 0; i < this._viewContainerRef.length; i++) {
      let child = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(i);
      this._viewContainerRef.detach(i);
      this._recycler.recycleView(child.context.index, child);
      i--;
    }
    this.insertViews(this._length);
    this._recycler.pruneScrapViews();
    this._isInLayout = false;
  }

  protected insertViews(collection_length: number) {
    if (this._viewContainerRef.length > 0) {
      let firstChild = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(0);
      let lastChild = <EmbeddedViewRef<VirtualRepeatRow>>this._viewContainerRef.get(this._viewContainerRef.length - 1);
      for (let i = firstChild.context.index - 1; i >= this._firstItemPosition; i--) {
        this.getView(collection_length, i);
      }
      for (let i = lastChild.context.index + 1; i <= this._lastItemPosition; i++) {
        let view = this.getView(collection_length, i);
      }
    } else {
      for (let i = this._firstItemPosition; i <= this._lastItemPosition; i++) {
        this.getView(collection_length, i);
      }
    }
  }

  protected getView(collection_length: number, position: number) {
    this._collection.requestItem(position);
  }

  onItem(data: { index: number, item: T }) {
    const { index, item } = data;
    let view = this._recycler.getView(index);
    if (!view) {
      view = this._template.createEmbeddedView(new VirtualRepeatRow(item, index, this._length));
    } else {
      (view as EmbeddedViewRef<VirtualRepeatRow>).context.$implicit = item;
      (view as EmbeddedViewRef<VirtualRepeatRow>).context.index = index;
      (view as EmbeddedViewRef<VirtualRepeatRow>).context.count = this._length;
    }
    return this.dispatchLayout(index, view, false);
  }

}
