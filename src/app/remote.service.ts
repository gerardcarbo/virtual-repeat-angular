import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {

  constructor(private http: HttpClient) {
  }

  getCount() {
    return 5000;
  }

  getPage(page: number) : Observable<any> {
    console.log("RemoteService:getPage:",page)
    return this.http.get('https://jsonplaceholder.typicode.com/photos?_page='+(page+1)); //starts at page 1
  }
}
