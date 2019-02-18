import { TestBed, inject } from '@angular/core/testing';

import { LoggerService } from './logger.service';
import { Subject } from 'rxjs';
import { deglitch, throttleTimeUntilChanged } from './rxjs.operators';
import { tap } from 'rxjs/operators';

describe('RXJs operators', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    });
  });

  describe('throttleTimeUntilChanged', () => {
    it('should throttle Time', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        logger.log('should throttle Time');
        let count = 0;
        const test = new Subject<number>();
        test
          .pipe(
            throttleTimeUntilChanged(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              expect(state).toBe(1);
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(2);
              done();
            }
          });

        setTimeout(() => test.next(1), 0);
        setTimeout(() => test.next(1), 50);
        setTimeout(() => test.next(1), 75);
        setTimeout(() => test.next(1), 120);
        setTimeout(() => test.complete(), 150);
      })();
    });

    it('should detect change', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        let count = 0;
        const test = new Subject<number>();
        logger.log('should detect change');
        test
          .pipe(
            throttleTimeUntilChanged(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              if (count === 1 || count === 3) {
                expect(state).toBe(2);
              } else {
                expect(state).toBe(1);
              }
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(4);
              done();
            }
          });

        setTimeout(() => test.next(1), 0);
        setTimeout(() => test.next(2), 50);
        setTimeout(() => test.next(1), 75);
        setTimeout(() => test.next(2), 120);
        setTimeout(() => test.complete(), 150);
      })();
    });

    it('should throttle Time and detect change', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        logger.log('should throttle Time and detect change');
        let count = 0;
        const test = new Subject<number>();
        test
          .pipe(
            throttleTimeUntilChanged(200),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              if (count === 1) {
                expect(state).toBe(2);
              } else {
                expect(state).toBe(1);
              }
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(3);
              done();
            }
          });

        setTimeout(() => test.next(1), 0);
        setTimeout(() => test.next(2), 50);
        setTimeout(() => test.next(1), 75);
        setTimeout(() => test.next(1), 200);
        setTimeout(() => test.complete(), 250);
      })();
    });
  });

  describe('deglitch', () => {
    it('should change simple', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        let finalState;
        let count = 0;
        const test = new Subject<boolean>();
        test
          .pipe(
            deglitch(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              finalState = state;
              if (count === 0) {
                expect(state).toBe(false);
              } else {
                expect(state).toBe(true);
              }
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(finalState).toBe(true);
              done();
            }
          });

        setTimeout(() => test.next(false), 0);
        setTimeout(() => test.next(true), 500);
        setTimeout(() => test.complete(), 650);
      })();
    });

    it('should deglitch simple (0-->1->0)', function(done) {
      inject([LoggerService], function(service: LoggerService) {
        let finalState;
        const test = new Subject<boolean>();
        let count = 0;
        test
          .pipe(
            deglitch(100),
            tap(state => {
              finalState = state;
              expect(state).toBeFalsy();
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(1); // 0
              expect(finalState).toBeFalsy();
              done();
            }
          });
        setTimeout(() => test.next(false), 0);
        setTimeout(() => test.next(true), 500);
        setTimeout(() => test.next(false), 550);
        setTimeout(() => test.complete(), 650);
      })();
    });

    it('should NOT deglitch simple (glitch time > glitchSize) (0-->1-->0)', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        let finalState;
        let count = 0;
        const test = new Subject<boolean>();
        test
          .pipe(
            deglitch(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              finalState = state;
              if (count === 0) {
                expect(state).toBe(false);
              } else if (count === 1) {
                expect(state).toBe(true);
              } else {
                expect(state).toBe(false);
              }
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(3); // 0->1->0
              expect(finalState).toBeFalsy();
              done();
            }
          });

        setTimeout(() => test.next(false), 0);
        setTimeout(() => test.next(true), 500);
        setTimeout(() => test.next(false), 650); // greater then deglitchSize
        setTimeout(() => test.complete(), 700);
      })();
    });

    it('should deglitch double (0-->1->0->1)', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        let finalState;
        let count = 0;
        const test = new Subject<boolean>();
        test
          .pipe(
            deglitch(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              finalState = state;
              if (count === 0) {
                expect(state).toBe(false);
              }
              if (count === 1) {
                expect(state).toBe(true);
              }
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(2); // 2 transitions 0->1
              expect(finalState).toBe(true);
              done();
            }
          });

        setTimeout(() => test.next(false), 0);
        setTimeout(() => test.next(true), 500);
        setTimeout(() => test.next(false), 550);
        setTimeout(() => test.next(true), 600);
        setTimeout(() => test.complete(), 650);
      })();
    });

    it('should deglitch double (0-->1-->0->1)', function(done) {
      inject([LoggerService], function(logger: LoggerService) {
        let finalState;
        let count = 0;
        const test = new Subject<boolean>();
        test
          .pipe(
            deglitch(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              finalState = state;
              if (count === 0) {
                expect(state).toBe(false);
              }
              if (count === 1) {
                expect(state).toBe(true);
              }
              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(2); // 0->1
              expect(finalState).toBe(true);
              done();
            }
          });

        setTimeout(() => test.next(false), 0);
        setTimeout(() => test.next(true), 500);
        setTimeout(() => test.next(false), 650);
        setTimeout(() => test.next(true), 700);
        setTimeout(() => test.complete(), 750);
      })();
    });

    it('should NOT deglitch double (0-->1-->0-->1)', function(done: DoneFn) {
      inject([LoggerService], function(logger: LoggerService) {
        let finalState;
        let count = 0;
        const test = new Subject<boolean>();
        test
          .pipe(
            deglitch(100),
            tap(state => {
              logger.log('test: tap: ' + state + ' count: ' + count);
              finalState = state;
              if (count === 0) {
                expect(state).toBe(false);
              }
              if (count === 1) {
                expect(state).toBe(true);
              }
              if (count === 2) {
                expect(state).toBe(false);
              }
              if (count === 3) {
                expect(state).toBe(true);
              }

              count++;
            })
          )
          .subscribe({
            complete: () => {
              expect(count).toBe(4); // 0->1->0->1
              expect(finalState).toBe(true);
              done();
            }
          });

        setTimeout(() => test.next(false), 0);
        setTimeout(() => test.next(true), 500);
        setTimeout(() => test.next(false), 650);
        setTimeout(() => test.next(true), 800);
        setTimeout(() => test.complete(), 850);
      })();
    });
  });
});

// Check logging disabled times
/*function log1() {

}
let logArg;
function log2(arg) {
  logArg = arg;
}
function log3(arg) {
  console.log(arg);
}

const t0 = Date.now();
for (let i = 0; i < 1000000; i++) {
  log1();
}
const t1 = Date.now();
console.log('log1: ' + (t1 - t0));

for (let i = 0; i < 1000000; i++) {
  log1(`a ${i}`);
}
const t2 = Date.now();
console.log('log1: ' + (t2 - t1));

for (let i = 0; i < 1000000; i++) {
  log2(`a ${i}`);
}
const t3 = Date.now();
console.log('log2: ' + (t3 - t2));

for (let i = 0; i < 1000000; i++) {
  log1('a ' + i);
}
const t4 = Date.now();
console.log('log3: ' + (t4 - t3));*/
