import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AsynchCollectionService } from './asynch-collection.service';
import { ReactiveCollectionFactory, ReactiveCollectionService } from './reactive-collection.service';
import { VirtualRepeatContainer } from 'virtual-repeat-angular/virtual-repeat-container';
import { IReactiveCollection } from 'virtual-repeat-angular/virtual-repeat-reactive';

const MOCK_DATA = require('./MOCK_DATA.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  collection: { id: number, image: string, content: string }[] = [];
  config = { showArray: true, tableViewArray: false, showAsynch: true, tableViewAsynch: false, showReactive: true, tableViewReactive: false };

  @ViewChild('reactiveVirtualRepeatList') reactiveVirtualRepeatList: VirtualRepeatContainer;
  @ViewChild('reactiveVirtualRepeatTable') reactiveVirtualRepeatTable: VirtualRepeatContainer;

  public itemsLoading: boolean = false;

  constructor(public asynchCollection: AsynchCollectionService<any>, public reactiveCollectionFactory: ReactiveCollectionFactory<any>,
    public reactiveCollection: ReactiveCollectionService<any>) {
    this.config = JSON.parse(localStorage.getItem('AppComponentConfig')) || this.config;
  }

  ngOnInit(): void {
    this.collection = MOCK_DATA;

    /*this.reactiveVirtualRepeatList.processing$.subscribe((loading: boolean) => {
      this.itemsLoading = loading;
    });

    this.reactiveVirtualRepeatTable.processing$.subscribe((loading: boolean) => {
      this.itemsLoading = loading;
    });*/
  }

  onChange() {
    localStorage.setItem('AppComponentConfig', JSON.stringify(this.config));
  }
}
