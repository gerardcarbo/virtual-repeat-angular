import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeat } from './virtual-repeat';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    VirtualRepeatContainer,
    VirtualRepeat
  ],
  exports: [
    VirtualRepeatContainer,
    VirtualRepeat
  ]
})
export class VirtualRepeatAngularLibModule { }
