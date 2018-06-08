import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VirtualRepeatAngularLibModule } from 'virtual-repeat-angular-lib';

import { ListItemExample } from './list-item/list-item.component';

declare var require: any;

@NgModule({
  declarations: [
    AppComponent,
    ListItemExample
  ],
  imports: [
    BrowserModule,
    VirtualRepeatAngularLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }