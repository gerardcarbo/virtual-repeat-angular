# VirtualRepeatAngular

Synchronous / Asynchronous / Reactive Virtual Repeat implementation for Angular 2+.

# Usage

## Synchronous

``` html
<gc-virtual-repeat-container rowHeight="auto">
    <list-item-example *virtualRepeat="let row of collection; let i = index" [item]="row" [index]="i">
    </list-item-example>
</gc-virtual-repeat-container>
```

Where **collection** is an Array.

## Asynchronous

``` html
<gc-virtual-repeat-container rowHeight="auto">
    <list-item-example *virtualRepeatAsynch="let row of asynchCollection; let i = index" [item]="row" [index]="i">
    </list-item-example>
</gc-virtual-repeat-container>
```

Where **asynchCollection** object must implement:

``` typescript
interface IAsynchCollection {
    getLength(): Promise<number>;
    getItem(i: number): Promise<any>;
}
```

## Reactive


``` html
<gc-virtual-repeat-container rowHeight="auto">
    <list-item-example *virtualRepeatReactive="let row of reactiveCollection; let i = index" [item]="row" [index]="i">
    </list-item-example>
</gc-virtual-repeat-container>
```

Where **reactiveCollection** object must implement:

``` typescript
interface IReactiveCollection<T> {
  length$: Observable<number>;
  items$: Observable<{ index: number, item: T }>
  connect(): void;
  disconnect(): void;
  requestLength(): void;
  requestItem(index: number): void;
}
```

## Parameters

* rowHeight *[number|'auto']*: item's row height in pixels. With auto-height (rowHeight="auto") the height of all rows is computed as the height of the first rendered row. 

## Demo

See <a href="https://gerardcarbo.github.io/virtual-repeat-angular/" target="_blank">https://gerardcarbo.github.io/virtual-repeat-angular/</a> 

## License

<a href="/LICENSE">MIT</a>

## Acknowledgements

Derived from previous work of <a href="https://nya.io/uncategorized/make-a-list-view-in-angular/">Bob Yuan</a> but using a offsetter div instead of absolute item positioning.
