import { Component, OnInit } from '@angular/core';
import { RemoteCollectionService } from './remote-collection.service';

const MOCK_DATA = require('./MOCK_DATA.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Demo';
  collection: {id: number, image: string, content: string}[] = [];

  constructor(public asynchCollection: RemoteCollectionService){}

  ngOnInit(): void {
    setTimeout(() => {
        this.collection = MOCK_DATA;
    }, 0);
  }
}
