# VirtualRepeatAngular

Synchronous / Asynchronous Virtual Repeat implementation.

# Usage

Synchronous:

``` html
    <gc-virtual-repeat-container rowHeight="auto">
        <list-item-example *virtualRepeat="let row of collection; let i = index" [item]="row" [index]="i">
        </list-item-example>
    </gc-virtual-repeat-container>
```

Where 'collection' is an Array.

Asynchronous:

``` html
    <gc-virtual-repeat-container rowHeight="auto">
        <list-item-example *virtualRepeatAsynch="let row of asynchCollection; let i = index" [item]="row" [index]="i">
        </list-item-example>
    </gc-virtual-repeat-container>
```

Where asynchCollection implements:

``` typescript
interface IAsynchCollection {
    getLength(): Observable<number>;
    getItem(i: number): Observable<any>;
}
```

With auto-height (rowHeight="auto") the height of all rows is computed as the height of the first rendered row.

## Demo

See <a href="https://gerardcarbo.github.io/virtual-repeat-angular/" target="_blank">https://gerardcarbo.github.io/virtual-repeat-angular/</a> 

## License

MIT
