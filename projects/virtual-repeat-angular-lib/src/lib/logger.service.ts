import { isDevMode } from '@angular/core';

export class LoggerService {
  constructor() {
    const forceLog = Boolean(localStorage.getItem('gcvra_force_log'));  // force log even in devMode
    const filterLog = localStorage.getItem('gcvra_filter_log');         // filter log lines (; separated list)
    let filterLogTerms: string[];
    if (filterLog) {
      filterLogTerms = filterLog.split(';').map(term => term.trim().toLowerCase()).filter(term => !!term);
    }
    if (isDevMode() || forceLog) {
      if (filterLog) {
        this.log = function (text: string, ...args: any[]) {
          let done = false;
          filterLogTerms.forEach(term => {
            if (!done && text.toLowerCase().indexOf(term) !== -1) {
              console.log(text, ...args);
              done = true;
            }
          });
          return;
        };
      } else {
        this.log = function (text: string, ...args: any[]) {
          console.log(text, ...args);
        };
      }
    }
  }

  log(text: string, ...args: any[]) { }
}
