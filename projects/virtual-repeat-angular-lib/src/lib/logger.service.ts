import { isDevMode } from '@angular/core';

export class LoggerService {
  constructor() {
    var forceLog = Boolean(localStorage.getItem('gcvra_force_log'));  // force log even in devMode
    var filterLog = localStorage.getItem('gcvra_filter_log');         // filter log lines (; separated list)
    var filterLogTerms;
    if (filterLog) {
      filterLogTerms = filterLog.split(';').map(term => term.trim().toLowerCase()).filter(term => !!term);
    }
    if (isDevMode() || forceLog) {
      if (filterLog) {
        this.log = function (text: string, ...args) {
          var done = false;
          filterLogTerms.forEach(term => {
            if (!done && text.toLowerCase().indexOf(term) != -1) {
              console.log(text, ...args);
              done = true;
            }
          });
          return;
        }
      } else {
        this.log = function (text, ...args) {
          console.log(text, ...args);
        }
      }
    }
  }

  log(text, ...args) { }
}
