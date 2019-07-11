import { Component, OnInit, ViewChild } from '@angular/core';
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
    showArrayImages: true,
    tableViewArray: false,
    showAsynch: true,
    tableViewAsynch: false,
    showAsynchImages: true,
    showReactive: true,
    tableViewReactive: false,
    showReactiveImages: true
  };

  @ViewChild('reactiveVirtualRepeatContainerList', { static: false })
  reactiveVirtualRepeatContainerList: VirtualRepeatContainer;
  @ViewChild('reactiveVirtualRepeatContainerTable', { static: false })
  reactiveVirtualRepeatContainerTable: VirtualRepeatContainer;

  currentReactiveVirtualRepeatContainer: VirtualRepeatContainer;

  tableViewReactive = new FormControl('');

  collection: { id: number; image: string; content: string }[] = [];

  public processing = false;
  public version: string = environment.VERSION;
  public reactivePosition: number;
  public reactivePositionGoto: number;

  constructor(
    public asynchCollection: AsynchCollectionService<any>,
    public reactiveCollection: ReactiveCollectionService<any>
  ) {
    this.config =
      JSON.parse(localStorage.getItem('AppComponentConfig')) || this.config;
    this.reactiveCollection.connect();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.collection = MOCK_DATA;
    }, 100);

    // capture processing$ notifications to display loading progress (only in reactive for demo purposes)
    this.tableViewReactive.valueChanges.subscribe((viewTable: boolean) => {
      if (viewTable) {
        this.reactiveCollection.reset();
        setTimeout(() => {
          if (this.reactiveVirtualRepeatContainerTable) {
            this.currentReactiveVirtualRepeatContainer = this.reactiveVirtualRepeatContainerTable;
            this.subscribeToReactiveData();
          }
        }, 100);
      } else {
        this.reactiveCollection.reset();
        setTimeout(() => {
          if (this.reactiveVirtualRepeatContainerList) {
            this.currentReactiveVirtualRepeatContainer = this.reactiveVirtualRepeatContainerList;
            this.subscribeToReactiveData();
          }
        }, 100);
      }
    });
  }

  private subscribeToReactiveData() {
    this.currentReactiveVirtualRepeatContainer.processing$.subscribe((processing: boolean) => {
      this.processing = processing;
    });
    this.currentReactiveVirtualRepeatContainer.scrollPosition$.subscribe((position: number) => {
      this.reactivePosition = Math.round(position / this.currentReactiveVirtualRepeatContainer.getRowHeight());
    });
  }

  onChange() {
    localStorage.setItem('AppComponentConfig', JSON.stringify(this.config));
  }

  resetReactive() {
    this.reactiveCollection.reset();
  }

  gotoReactivePosition() {
    this.currentReactiveVirtualRepeatContainer.scrollPosition =
      this.reactivePositionGoto * this.currentReactiveVirtualRepeatContainer.getRowHeight();
  }
}
