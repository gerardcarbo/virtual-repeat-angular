import { noop } from 'rxjs';
import { Injectable } from "@angular/core";

@Injectable()
export class LoggerService {
  log: any;
  constructor() {
    const bLog = Boolean(localStorage.getItem('gcvra_log')); // enable log
    const filterLog = localStorage.getItem('gcvra_log_filter'); // filter log lines (; separated list)
    let filterLogTerms: string[];
    if (filterLog) {
      filterLogTerms = filterLog
        .split(';')
        .map(term => term.trim().toLowerCase())
        .filter(term => !!term);
    }
    if (bLog) {
      if (filterLog) {
        this.log = function(text: string, ...args: any[]) {
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
        this.log = function(text: string, ...args: any[]) {
          console.log(text, ...args);
        };
      }
    } else {
      this.log = noop;
    }
  }
}
