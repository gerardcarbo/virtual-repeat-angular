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
  tableView = true;

  constructor(public asynchCollection: AsynchCollectionService<any>, public reactiveCollection: ReactiveCollectionService<any>){}

  ngOnInit(): void {
    setTimeout(() => {
        this.collection = MOCK_DATA;
    }, 0);
  }
}
