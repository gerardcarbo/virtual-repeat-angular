import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeat } from './virtual-repeat';
import { VirtualRepeatAsynch } from './virtual-repeat-asynch';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    VirtualRepeatContainer,
    VirtualRepeat,
    VirtualRepeatAsynch
  ],
  exports: [
    VirtualRepeatContainer,
    VirtualRepeat,
    VirtualRepeatAsynch
  ]
})
export class VirtualRepeatAngularLibModule { }
