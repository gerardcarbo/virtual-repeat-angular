import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AsynchCollectionService } from './asynch-collection.service';
import {
  ReactiveCollectionFactory,
  ReactiveCollectionService
} from './reactive-collection.service';
import { VirtualRepeatContainer } from 'virtual-repeat-angular/virtual-repeat-container';
import { FormControl } from '../../node_modules/@angular/forms';

const MOCK_DATA = require('./MOCK_DATA.json');

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  config = {
    showArray: true,
    tableViewArray: false,
    showAsynch: true,
    tableViewAsynch: false,
    showAsynchImages: true,
    showReactive: true,
    tableViewReactive: false,
    showReactiveImages: true,
  };

  @ViewChild('reactiveVirtualRepeatContainerList')
  reactiveVirtualRepeatContainerList: VirtualRepeatContainer;
  @ViewChild('reactiveVirtualRepeatContainerTable')
  reactiveVirtualRepeatContainerTable: VirtualRepeatContainer;

  tableViewReactive = new FormControl('');

  collection: { id: number; image: string; content: string }[] = [];
  public itemsLoading = false;

  public version: string = environment.VERSION;

  constructor(
    public asynchCollection: AsynchCollectionService<any>,
    public reactiveCollectionFactory: ReactiveCollectionFactory<any>,
    public reactiveCollection: ReactiveCollectionService<any>
  ) {
    this.config =
      JSON.parse(localStorage.getItem('AppComponentConfig')) || this.config;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.collection = MOCK_DATA;
    }, 100);

    //capture processing$ notifications to display loading progress (only in reactive for demo purposes)
    this.tableViewReactive.valueChanges.subscribe((viewTable: boolean) => {
      if (viewTable) {
        setTimeout(() => {
          this.reactiveVirtualRepeatContainerTable &&
            this.reactiveVirtualRepeatContainerTable.processing$.subscribe(
              (loading: boolean) => {
                this.itemsLoading = loading;
              }
            );
        }, 100);
      } else {
        setTimeout(() => {
          this.reactiveVirtualRepeatContainerList &&
            this.reactiveVirtualRepeatContainerList.processing$.subscribe(
              (loading: boolean) => {
                this.itemsLoading = loading;
              }
            );
        }, 100);
      }
    });
  }

  onChange() {
    localStorage.setItem('AppComponentConfig', JSON.stringify(this.config));
  }
}
