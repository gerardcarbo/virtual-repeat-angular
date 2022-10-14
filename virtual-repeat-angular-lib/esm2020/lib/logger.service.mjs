import { noop } from 'rxjs';
import { Injectable } from "@angular/core";
import * as i0 from "@angular/core";
export class LoggerService {
    constructor() {
        const bLog = Boolean(localStorage.getItem('gcvra_log')); // enable log
        const filterLog = localStorage.getItem('gcvra_log_filter'); // filter log lines (; separated list)
        let filterLogTerms;
        if (filterLog) {
            filterLogTerms = filterLog
                .split(';')
                .map(term => term.trim().toLowerCase())
                .filter(term => !!term);
        }
        if (bLog) {
            if (filterLog) {
                this.log = function (text, ...args) {
                    let done = false;
                    filterLogTerms.forEach(term => {
                        if (!done && text.toLowerCase().indexOf(term) !== -1) {
                            console.log(text, ...args);
                            done = true;
                        }
                    });
                    return;
                };
            }
            else {
                this.log = function (text, ...args) {
                    console.log(text, ...args);
                };
            }
        }
        else {
            this.log = noop;
        }
    }
}
LoggerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: LoggerService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
LoggerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: LoggerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: LoggerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi9zcmMvbGliL2xvZ2dlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFHM0MsTUFBTSxPQUFPLGFBQWE7SUFFeEI7UUFDRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYTtRQUN0RSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7UUFDbEcsSUFBSSxjQUF3QixDQUFDO1FBQzdCLElBQUksU0FBUyxFQUFFO1lBQ2IsY0FBYyxHQUFHLFNBQVM7aUJBQ3ZCLEtBQUssQ0FBQyxHQUFHLENBQUM7aUJBQ1YsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO2lCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0I7UUFDRCxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksU0FBUyxFQUFFO2dCQUNiLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBUyxJQUFZLEVBQUUsR0FBRyxJQUFXO29CQUM5QyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7b0JBQ2pCLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQzVCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQzs0QkFDM0IsSUFBSSxHQUFHLElBQUksQ0FBQzt5QkFDYjtvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFDSCxPQUFPO2dCQUNULENBQUMsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBUyxJQUFZLEVBQUUsR0FBRyxJQUFXO29CQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUM3QixDQUFDLENBQUM7YUFDSDtTQUNGO2FBQU07WUFDTCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztTQUNqQjtJQUNILENBQUM7OzBHQWhDVSxhQUFhOzhHQUFiLGFBQWE7MkZBQWIsYUFBYTtrQkFEekIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG5vb3AgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9nZ2VyU2VydmljZSB7XG4gIGxvZzogYW55O1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBiTG9nID0gQm9vbGVhbihsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2N2cmFfbG9nJykpOyAvLyBlbmFibGUgbG9nXG4gICAgY29uc3QgZmlsdGVyTG9nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2djdnJhX2xvZ19maWx0ZXInKTsgLy8gZmlsdGVyIGxvZyBsaW5lcyAoOyBzZXBhcmF0ZWQgbGlzdClcbiAgICBsZXQgZmlsdGVyTG9nVGVybXM6IHN0cmluZ1tdO1xuICAgIGlmIChmaWx0ZXJMb2cpIHtcbiAgICAgIGZpbHRlckxvZ1Rlcm1zID0gZmlsdGVyTG9nXG4gICAgICAgIC5zcGxpdCgnOycpXG4gICAgICAgIC5tYXAodGVybSA9PiB0ZXJtLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAuZmlsdGVyKHRlcm0gPT4gISF0ZXJtKTtcbiAgICB9XG4gICAgaWYgKGJMb2cpIHtcbiAgICAgIGlmIChmaWx0ZXJMb2cpIHtcbiAgICAgICAgdGhpcy5sb2cgPSBmdW5jdGlvbih0ZXh0OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICBmaWx0ZXJMb2dUZXJtcy5mb3JFYWNoKHRlcm0gPT4ge1xuICAgICAgICAgICAgaWYgKCFkb25lICYmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRlcm0pICE9PSAtMSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0LCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2cgPSBmdW5jdGlvbih0ZXh0OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2codGV4dCwgLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nID0gbm9vcDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==