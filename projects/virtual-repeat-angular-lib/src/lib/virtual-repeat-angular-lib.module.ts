import { VirtualRepeat } from './virtual-repeat-collection';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatAsynch } from './virtual-repeat-asynch';
import { VirtualRepeatReactive } from './virtual-repeat-reactive';
import { LoggerService } from './logger.service';


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
  providers: [
    LoggerService
  ],
  exports: [
    VirtualRepeatContainer,
    VirtualRepeat,
    VirtualRepeatAsynch,
    VirtualRepeatReactive
  ]
})
export class VirtualRepeatAngularLibModule { }
