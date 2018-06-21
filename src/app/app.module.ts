import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { VirtualRepeatAngularLibModule } from 'virtual-repeat-angular/virtual-repeat-angular-lib.module';
//import { VirtualRepeatAngularLibModule } from 'virtual-repeat-angular';

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
    FormsModule,
    VirtualRepeatAngularLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }