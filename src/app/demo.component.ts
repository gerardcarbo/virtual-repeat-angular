import { Component, OnInit } from '@angular/core';

const MOCK_DATA = require('./MOCK_DATA.json');

@Component({
  selector: 'virtual-repeat-angular-demo-app',
  template: `
  <div class="demo-container" *ngIf="collection">
    <infinite-list [rowHeight]="140" [newScrollPosition]="newPosition" (scrollPosition)="onScrollPositionChange($event)">
        <list-item-example *infiniteFor="let row of collection; let i = index" [item]="row" [index]="i">

        </list-item-example>
    </infinite-list>
  </div>`, 
  styles: [`
        .demo-container {
            width: 100%;
            height: 100%;
            position: relative;
            background-color: #f0f0f0;
        }
        infinite-list {
            width: 600px;
            height: 100%;
            display: block;
        }
    `]
})
export class DemoComponent implements OnInit {

  collection: {id: number, image: string, content: string}[] = [];

  newPosition = 0;

  onScrollPositionChange(p: number) {
      console.log(p);
  }

  ngOnInit(): void {

      this.newPosition = 5000;

      setTimeout(() => {
          this.collection = MOCK_DATA;
      }, 3000);

      // setTimeout(() => {
      //     this.collection = MOCK_DATA.filter(item => item.id % 2 === 0);
      //     // console.log('current collection', this.collection);
      // }, 5000);
      //
      // setTimeout(() => {
      //     this.collection = MOCK_DATA.filter(item => true);
      //     // console.log('current collection', this.collection);
      // }, 7000);
  }
}
