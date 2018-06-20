import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 

import { AppComponent } from './app.component';
import { VirtualRepeatAngularLibModule } from 'virtual-repeat-angular-lib';
//import { VirtualRepeatAngularLibModule } from 'virtual-repeat-angular-lib/virtual-repeat-angular-lib.module';

import { ListItemExample } from './list-item/list-item.component';

declare var require: any;

@NgModule({
  declarations: [
    AppComponent,
    ListItemExample
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    VirtualRepeatAngularLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }