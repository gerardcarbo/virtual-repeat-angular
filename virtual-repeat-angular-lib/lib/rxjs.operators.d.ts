import { Observable } from 'rxjs';
/**
 * If observable value has not changed act as throttleTime, but if changed notify it inmediatly.
 * @param throttleTime throttle time in miliseconds.
 */
export declare function throttleTimeUntilChanged(throttleTime: number): (source: Observable<any>) => Observable<unknown>;
/**
 * Remove spurious changes on a boolean observable.
 * @param glitchSize max size of the gitches (in miliseconds) to be removed.
 */
export declare function deglitch(glitchSize: number): (source: Observable<boolean>) => Observable<unknown>;
/**
 * Remove spurious falses on a boolean observable.
 * @param glitchSize max size of the gitches (in miliseconds) to be removed.
 */
export declare function deglitchFalse(glitchSize: number): (source: Observable<boolean>) => Observable<unknown>;
