import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeat } from './virtual-repeat-collection';
import { VirtualRepeatAsynch } from './virtual-repeat-asynch';
import { VirtualRepeatReactive } from './virtual-repeat-reactive';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    VirtualRepeatContainer,
    VirtualRepeat,
    VirtualRepeatAsynch,
    VirtualRepeatReactive
  ],
  exports: [
    VirtualRepeatContainer,
    VirtualRepeat,
    VirtualRepeatAsynch,
    VirtualRepeatReactive
  ]
})
export class VirtualRepeatAngularLibModule { }
