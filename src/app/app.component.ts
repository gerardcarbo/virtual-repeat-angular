import { Component, OnInit } from '@angular/core';

const MOCK_DATA = require('./MOCK_DATA.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  collection: {id: number, image: string, content: string}[] = [];

  newPosition = 0;

  ngOnInit(): void {

    this.newPosition = 5000;

    setTimeout(() => {
        this.collection = MOCK_DATA;
    }, 3000);
  }
}
