import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

export class LoggerService {

  constructor() {
    var forceLog=Boolean(localStorage.getItem('virtual_repeat_angular_force_log'));
    if(isDevMode() || forceLog){
      this.log = function(text,...args){
          console.log(text,...args);
      }
    } 
  }

  log(text,...args){}
}
