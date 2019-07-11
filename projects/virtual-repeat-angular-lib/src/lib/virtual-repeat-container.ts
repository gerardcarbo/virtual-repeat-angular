import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Output,
  Input
} from '@angular/core';
import {
  Subscription,
  BehaviorSubject,
  Observable,
  fromEvent,
  Subject,
  timer
} from 'rxjs';
import {
  filter,
  tap,
  map,
  debounceTime,
  pairwise,
} from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { IVirtualRepeat } from './virtual-repeat.base';
import { deglitchFalse } from './rxjs.operators';

export const SCROLL_STOP_TIME_THRESHOLD = 200; // in milliseconds

const INVALID_POSITION = -1;

@Component({
  selector: 'gc-virtual-repeat-container',
  templateUrl: './virtual-repeat-container.html',
  styleUrls: ['./virtual-repeat-container.scss']
})
// tslint:disable-next-line:component-class-suffix
export class VirtualRepeatContainer implements AfterViewInit, OnDestroy {
  set virtualRepeat(virtualRepeat: IVirtualRepeat) {
    this._virtualRepeat = virtualRepeat;
  }

  get currentScrollState(): SCROLL_STATE {
    return this._currentScrollState;
  }

  set holderHeight(height: number) {
    if (typeof height !== 'undefined') {
      this._holderHeight = height;
      if (this._holderHeight === 0) {
        this.listContainer.nativeElement.scrollTop = 0;
      }
      // When initialization, the list-holder doesn't not have its height.
      // So the scrollTop should be delayed for waiting
      // the list-holder rendered bigger than the list-container.
      if (
        this._initialScrollTop !== INVALID_POSITION &&
        this._holderHeight !== 0
      ) {
        setTimeout(() => {
          this.listContainer.nativeElement.scrollTop = this._initialScrollTop;
          this._initialScrollTop = INVALID_POSITION;
        });
      }
    }
  }

  get holderHeight(): number {
    return this._holderHeight;
  }

  get holderHeightInPx(): string {
    if (this._holderHeight) {
      return this._holderHeight + 'px';
    }
    return '100%';
  }

  get translateYInPx(): string {
    return this.translateY + 'px';
  }

  /**
   * scroll state change
   */
  get scrollStateChange(): Observable<SCROLL_STATE> {
    return this._scrollStateChange.asObservable();
  }

  /**
   * current scroll position.
   */
  @Output()
  get scrollPosition$(): Observable<number> {
    return this._scrollPosition.asObservable();
  }

  /**
   * container width and height.
   */
  get sizeChange(): Observable<[number, number]> {
    return this._sizeChange.asObservable();
  }

  @Input() set rowHeight(height: string | number) {
    if (height === 'auto') {
      this._autoHeight = true;
      this._autoHeightComputed = false;
      return;
    }
    if (typeof height === 'string' || <any>height instanceof String) {
      height = Number(height);
    }
    if (isNaN(height)) {
      throw Error('rowHeight can not be NaN');
    }
    if (height !== undefined) {
      this._rowHeight = height;
      this._autoHeight = false;
    }
  }

  set processing(l: boolean) {
    this._processingSubject.next(l);
  }

  @Input()
  set scrollPosition(p: number) {
    // this.logger.log('p', p);
    this.listContainer.nativeElement.scrollTop = p;
    // if list-holder has no height at the certain time. scrollTop will not be set.
    if (!this._holderHeight) {
      this._initialScrollTop = p;
    }
    this._scrollPosition.next(p);
  }

  /**
   * UITimelineMeter is optional injection. when this component used inside a UITimelineMeter.
   * it is responsible to update the scrollY
   * @param _timelineMeter
   */
  constructor(protected logger: LoggerService) {
    this.scrollbarStyle = 'normal';
    this.scrollbarWidth = getScrollBarWidth();
  }
  private _holderHeight = 0;
  private _containerWidth = 0;
  private _containerHeight = 0;
  public translateY = 0;

  private _subscription: Subscription = new Subscription();

  private _scrollStateChange: BehaviorSubject<
    SCROLL_STATE
  > = new BehaviorSubject(SCROLL_STATE.IDLE);
  private _scrollPosition: BehaviorSubject<number> = new BehaviorSubject(0);
  private _sizeChange: BehaviorSubject<[number, number]> = new BehaviorSubject<
    [number, number]
  >([0, 0]);

  private _ignoreScrollEvent = false;

  private _initialScrollTop = INVALID_POSITION;

  private _currentScrollState: SCROLL_STATE = SCROLL_STATE.IDLE;

  @ViewChild('listContainer', {static: true} )  listContainer: ElementRef;

  scrollbarStyle: string;
  scrollbarWidth: number;

  private _virtualRepeat: IVirtualRepeat;

  private _rowHeight = 100;
  _autoHeight = false;
  _autoHeightComputed = false;
  _autoHeightVariable = false;
  _autoHeightVariableData: { itemsCount: number; totalHeight: number } = {
    itemsCount: 0,
    totalHeight: 0
  };

  private _processingSubject = new Subject<boolean>();
  public processingRaw$ = this._processingSubject.pipe(
    tap(state => {
      this.logger.log('processingRaw$ ' + state);
    })
  );
  public processing$ = this._processingSubject.pipe(
    deglitchFalse(500),
    tap(state => {
      this.logger.log('processing$ ' + state);
    })
  );

  ngAfterViewInit(): void {
    if (this.scrollbarStyle === 'hide-scrollbar') {
      this.listContainer.nativeElement.style.right =
        0 - this.scrollbarWidth + 'px';
      this.listContainer.nativeElement.style.paddingRight =
        this.scrollbarWidth + 'px';
    }

    if (window) {
      this._subscription.add(
        fromEvent(window, 'resize').subscribe(() => {
          this.resize();
        })
      );
    }
    this._subscription.add(
      fromEvent(this.listContainer.nativeElement, 'scroll')
        .pipe(
          filter(() => {
            if (this._ignoreScrollEvent) {
              this._ignoreScrollEvent = false;
              return false;
            }
            return true;
          }),
          map(() => {
            return this.listContainer.nativeElement.scrollTop;
          })
        )
        .subscribe((scrollY: number) => {
          this._scrollPosition.next(scrollY);
        })
    );

    this._subscription.add(
      this.scrollPosition$
        .pipe(
          tap(() => {
            if (this._currentScrollState === SCROLL_STATE.IDLE) {
              this._currentScrollState = SCROLL_STATE.SCROLLING_DOWN;
              this._scrollStateChange.next(this._currentScrollState);
            }
          }),
          pairwise(),
          map(pair => {
            if (Math.abs(pair[1] - pair[0]) > 10) {
              this._currentScrollState =
                pair[1] - pair[0] > 0
                  ? SCROLL_STATE.SCROLLING_DOWN
                  : SCROLL_STATE.SCROLLING_UP;
              this.logger.log(
                `scrollPosition pair: ${pair} _currentScrollState: ${
                  this._currentScrollState
                }`
              );
              this._scrollStateChange.next(this._currentScrollState);
            }
          }),
          debounceTime(SCROLL_STOP_TIME_THRESHOLD)
        )
        .subscribe(() => {
          if (this._currentScrollState !== SCROLL_STATE.IDLE) {
            this._scrollStateChange.next(SCROLL_STATE.IDLE);
          }
        })
    );

    setTimeout(() => {
      this.resize();
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  getRowHeight(): number {
    return this._rowHeight;
  }

  getContainerSize(): { width: number; height: number } {
    if (this.listContainer && this.listContainer.nativeElement) {
      const rect = this.listContainer.nativeElement.getBoundingClientRect();
      this._containerWidth = rect.width - this.scrollbarWidth;
      this._containerHeight = rect.height;
      return { width: this._containerWidth, height: this._containerHeight };
    }
    return { width: 0, height: 0 };
  }

  reset() {
    this.scrollPosition = 0;
    this._virtualRepeat.reset();
  }

  resize() {
    const { width, height } = this.getContainerSize();
    this._sizeChange.next([width, height]);
  }
}

export enum SCROLL_STATE {
  IDLE,
  SCROLLING_DOWN,
  SCROLLING_UP
}

export function getScrollBarWidth() {
  const inner = document.createElement('p');
  inner.style.width = '100%';
  inner.style.height = '200px';

  const outer = document.createElement('div');
  outer.style.position = 'absolute';
  outer.style.top = '0px';
  outer.style.left = '0px';
  outer.style.visibility = 'hidden';
  outer.style.width = '200px';
  outer.style.height = '150px';
  outer.style.overflow = 'hidden';
  outer.appendChild(inner);

  document.body.appendChild(outer);
  const w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  let w2 = inner.offsetWidth;

  if (w1 === w2) {
    w2 = outer.clientWidth;
  }

  document.body.removeChild(outer);

  return w1 - w2;
}
