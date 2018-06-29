import {Component, Input, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

//import { VirtualRepeatContainer, SCROLL_STATE } from 'virtual-repeat-angular/virtual-repeat-container';
import {VirtualRepeatContainer, SCROLL_STATE} from 'virtual-repeat-angular';

@Component({
    selector: 'list-item-example',
    templateUrl: './list-item.html',
    styles: [`
        .list-item-example {
            width: 100%;
            height: 140px;
            padding: 1px;
            box-sizing: border-box; 
        }
        .list-item-wrapper {
            background-color: #fff;
            box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
        }
        .image {
            flex: 0 0 auto;
            width: 120px;
            padding: 10px;
            height: 120px;
        }
        .image > img {
            width: 100%;
            height: 100%;
            display: block;
        }
        .content {
            flex: 1 1 auto;
            padding: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .index-label {
            padding: 0.5rem;
            background-color: #eaeaea;
            height: 20px 
        }
    `]
})
export class ListItemExample implements OnDestroy {
    @Input() item;

    @Input() index;

    private _subscription = new Subscription();

    constructor(private _virtualRepeatContainer: VirtualRepeatContainer) {
        this._subscription.add(this._virtualRepeatContainer.scrollStateChange.subscribe((state: SCROLL_STATE) => {
        }));
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
