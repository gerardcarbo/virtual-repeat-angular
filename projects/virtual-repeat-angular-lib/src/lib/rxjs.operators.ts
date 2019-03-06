import { Observable, empty, of, timer } from 'rxjs';
import { flatMap, delay } from 'rxjs/operators';
import { LoggerService } from './logger.service';

const logger = new LoggerService();

/**
 * If observable value has not changed act as throttleTime, but if changed notify it inmediatly.
 * @param {number} throttleTime throttle time in miliseconds.
 */
export function throttleTimeUntilChanged(throttleTime: number) {
  return (source: Observable<any>) => {
    return new Observable(observer => {
      let lastSeen = {};
      let lastSeenTime = 0;

      return source
        .pipe(
          flatMap((value: any) => {
            // logger.log(`throttleTimeUntilChanged: value: ${value} last: ${lastSeen}`);
            const now = Date.now();
            if (value === lastSeen && now - lastSeenTime < throttleTime) {
              return empty();
            } else {
              lastSeen = value;
              lastSeenTime = now;
              return of(lastSeen);
            }
          })
        )
        .subscribe(observer);
    });
  };
}

/**
 * Remove spurious changes on a boolean observable.
 * @param {number} glitchSize max size of the gitches (in miliseconds) to be removed.
 */
export function deglitch(glitchSize: number) {
  return (source: Observable<boolean>) => {
    return new Observable(observer => {
      let currentState: boolean;
      let lastState: boolean;
      let lastStateTime: number;

      return source
        .pipe(
          flatMap((value: boolean) => {
            // logger.log(`deglitch: value: ${value} currentState: ${currentState} `);
            lastStateTime = Date.now();
            lastState = value;
            if (currentState === undefined) {
              currentState = value;
              return of(value);
            }
            if (value === currentState) {
              return empty();
            } else {
              return of(value).pipe(
                delay(glitchSize),
                flatMap((value_: boolean) => {
                  const elapsed = Date.now() - lastStateTime;
                  // logger.log(`deglitch -> delay elapsed: ${elapsed} value_: ${value_} lastState: ${lastState} currentState: ${currentState} `);

                  if (value_ !== lastState) {
                    if (lastState === currentState) {
                      // logger.log(`deglitch -> delay lastState === currentState -> empty()`);
                      return empty();
                    } else {
                      // logger.log(`deglitch -> delay elapsed: ${elapsed} lastState !== currentState -> ${lastState}`);
                      currentState = lastState;
                      return of(currentState);
                    }
                  }
                  // logger.log(`deglitch -> delay value_ !== lastState -> ${value_}`);
                  if (elapsed < glitchSize) {
                    // logger.log(`deglitch -> delay ${elapsed} < glitchSize -> empty()`);
                    return empty();
                  }
                  currentState = value_;
                  return of(currentState);
                })
              );
            }
          })
        )
        .subscribe(observer);
    });
  };
}

/**
 * Remove spurious falses on a boolean observable.
 * @param {number} glitchSize max size of the gitches (in miliseconds) to be removed.
 */
export function deglitchFalse(glitchSize: number) {
  return (source: Observable<boolean>) => {
    return new Observable(observer => {
      let currentState: boolean;
      let lastState: boolean;
      let lastStateTime: number;

      return source
        .pipe(
          flatMap((value: boolean) => {
            // logger.log(`deglitchFalse: value: ${value} currentState: ${currentState} `);
            lastStateTime = Date.now();
            lastState = value;
            if (currentState === undefined || (value === true && currentState !== value)) {
              currentState = value;
              return of(value);
            }
            if (value === currentState) {
              return empty();
            } else {
              return of(value).pipe(
                delay(glitchSize),
                flatMap((value_: boolean) => {
                  const elapsed = Date.now() - lastStateTime;
                  // logger.log(`deglitchFalse -> delay elapsed: ${elapsed} value_: ${value_} lastState: ${lastState} currentState: ${currentState} `);

                  if (value_ !== lastState) {
                    if (lastState === currentState) {
                      // logger.log(`deglitchFalse -> delay lastState === currentState -> empty()`);
                      return empty();
                    } else {
                      // logger.log(`deglitchFalse -> delay elapsed: ${elapsed} lastState !== currentState -> ${lastState}`);
                      currentState = lastState;
                      return of(currentState);
                    }
                  }
                  // logger.log(`deglitchFalse -> delay value_ !== lastState -> ${value_}`);
                  if (elapsed < glitchSize) {
                    // logger.log(`deglitchFalse -> delay ${elapsed} < glitchSize -> empty()`);
                    return empty();
                  }
                  currentState = value_;
                  return of(currentState);
                })
              );
            }
          })
        )
        .subscribe(observer);
    });
  };
}

