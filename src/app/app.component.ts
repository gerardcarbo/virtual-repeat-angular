import { Component, OnInit } from '@angular/core';
import { AsynchCollectionService } from './asynch-collection.service';
import { ReactiveCollectionService } from './reactive-collection.service';

const MOCK_DATA = require('./MOCK_DATA.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  collection: {id: number, image: string, content: string}[] = [];
  config = {showCollection: true, showAsynch: true, showReactive: true};

  constructor(public asynchCollection: AsynchCollectionService<any>, public reactiveCollection: ReactiveCollectionService<any>){
    this.config = JSON.parse(localStorage.getItem('AppComponentConfig')) || this.config;
  }

  ngOnInit(): void {
    setTimeout(() => {
        this.collection = MOCK_DATA;
    }, 0); 
  }

  onChange() {
    localStorage.setItem('AppComponentConfig', JSON.stringify(this.config));
  }
}
