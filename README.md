# VirtualRepeatAngular

Synchronous / Asynchronous / Reactive Virtual Repeat implementation for Angular 2+. Supports variable height rows.

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
interface IAsynchCollection<T> {
    getLength(): Promise<number>;
    getItem(i: number): Promise<T>;
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
  connect(): void;
  disconnect(): void;  
  requestLength(): void;
  requestItem(index: number): void;
  
  length$: Observable<number>;
  items$: Observable<{ index: number, item: T }>
}
```

For each call to *requestLength()* the observable *length$* must emit a value. 
For each call to *requestItem()* the observable *requestItem$* must emit an item. 

## Parameters

* rowHeight *[number|'auto']*: item's row height in pixels. With auto-height (rowHeight="auto") the height of all rows is computed as the mean height of the first rendered page, if the height is fixed. Otherwise, if the height of each cell is variable, the mean height is updated for each row and the scroll size and position adjusted to it.

## Notes

* ```<gc-virtual-repeat-container>``` must be inserted inside an element with display: block and height: 100% to perform properly.
* Inside the container you can place any kind of HTML element that is full row, as shown in the demo using table's ```<tr>```.

# Demo

See <a href="https://gerardcarbo.github.io/virtual-repeat-angular/" target="_blank">https://gerardcarbo.github.io/virtual-repeat-angular/</a> 

# License

<a href="/LICENSE">MIT</a>

# Acknowledgements

Derived from previous work of <a href="https://nya.io/uncategorized/make-a-list-view-in-angular/">Bob Yuan</a> but using a offsetter div instead of absolute item positioning. Revamped also to support asynch and reactive collections, and variable height rows.
