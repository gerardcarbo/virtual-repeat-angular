import { Observable, empty, of } from 'rxjs';
import { flatMap, delay } from 'rxjs/operators';
import { LoggerService } from './logger.service';
const logger = new LoggerService();
/**
 * If observable value has not changed act as throttleTime, but if changed notify it inmediatly.
 * @param throttleTime throttle time in miliseconds.
 */
export function throttleTimeUntilChanged(throttleTime) {
    return (source) => {
        return new Observable(observer => {
            let lastSeen = {};
            let lastSeenTime = 0;
            return source
                .pipe(flatMap((value) => {
                // logger.log(`throttleTimeUntilChanged: value: ${value} last: ${lastSeen}`);
                const now = Date.now();
                if (value === lastSeen && now - lastSeenTime < throttleTime) {
                    return empty();
                }
                else {
                    lastSeen = value;
                    lastSeenTime = now;
                    return of(lastSeen);
                }
            }))
                .subscribe(observer);
        });
    };
}
/**
 * Remove spurious changes on a boolean observable.
 * @param glitchSize max size of the gitches (in miliseconds) to be removed.
 */
export function deglitch(glitchSize) {
    return (source) => {
        return new Observable(observer => {
            let currentState;
            let lastState;
            let lastStateTime;
            return source
                .pipe(flatMap((value) => {
                // logger.log(`deglitch: value: ${value} currentState: ${currentState} `);
                lastStateTime = Date.now();
                lastState = value;
                if (currentState === undefined) {
                    currentState = value;
                    return of(value);
                }
                if (value === currentState) {
                    return empty();
                }
                else {
                    return of(value).pipe(delay(glitchSize), flatMap((value_) => {
                        const elapsed = Date.now() - lastStateTime;
                        // logger.log(`deglitch -> delay elapsed: ${elapsed} value_: ${value_} lastState: ${lastState} currentState: ${currentState} `);
                        if (value_ !== lastState) {
                            if (lastState === currentState) {
                                // logger.log(`deglitch -> delay lastState === currentState -> empty()`);
                                return empty();
                            }
                            else {
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
                    }));
                }
            }))
                .subscribe(observer);
        });
    };
}
/**
 * Remove spurious falses on a boolean observable.
 * @param glitchSize max size of the gitches (in miliseconds) to be removed.
 */
export function deglitchFalse(glitchSize) {
    return (source) => {
        return new Observable(observer => {
            let currentState;
            let lastState;
            let lastStateTime;
            return source
                .pipe(flatMap((value) => {
                // logger.log(`deglitchFalse: value: ${value} currentState: ${currentState} `);
                lastStateTime = Date.now();
                lastState = value;
                if (currentState === undefined || (value === true && currentState !== value)) {
                    currentState = value;
                    return of(value);
                }
                if (value === currentState) {
                    return empty();
                }
                else {
                    return of(value).pipe(delay(glitchSize), flatMap((value_) => {
                        const elapsed = Date.now() - lastStateTime;
                        // logger.log(`deglitchFalse -> delay elapsed: ${elapsed} value_: ${value_} lastState: ${lastState} currentState: ${currentState} `);
                        if (value_ !== lastState) {
                            if (lastState === currentState) {
                                // logger.log(`deglitchFalse -> delay lastState === currentState -> empty()`);
                                return empty();
                            }
                            else {
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
                    }));
                }
            }))
                .subscribe(observer);
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnhqcy5vcGVyYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi9zcmMvbGliL3J4anMub3BlcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBUyxNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0FBRW5DOzs7R0FHRztBQUNILE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxZQUFvQjtJQUMzRCxPQUFPLENBQUMsTUFBdUIsRUFBRSxFQUFFO1FBQ2pDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDL0IsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztZQUVyQixPQUFPLE1BQU07aUJBQ1YsSUFBSSxDQUNILE9BQU8sQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNyQiw2RUFBNkU7Z0JBQzdFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxLQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsR0FBRyxZQUFZLEdBQUcsWUFBWSxFQUFFO29CQUMzRCxPQUFPLEtBQUssRUFBRSxDQUFDO2lCQUNoQjtxQkFBTTtvQkFDTCxRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUNqQixZQUFZLEdBQUcsR0FBRyxDQUFDO29CQUNuQixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDckI7WUFDSCxDQUFDLENBQUMsQ0FDSDtpQkFDQSxTQUFTLENB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Q0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQ25CLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFDakIsT0FBTyxDQUFDLENBQUMsTUFBZSxFQUFFLEVBQUU7d0JBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxhQUFhLENBQUM7d0JBQzNDLHFJQUFxSTt3QkFFckksSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFOzRCQUN4QixJQUFJLFNBQVMsS0FBSyxZQUFZLEVBQUU7Z0NBQzlCLDhFQUE4RTtnQ0FDOUUsT0FBTyxLQUFLLEVBQUUsQ0FBQzs2QkFDaEI7aUNBQU07Z0NBQ0wsdUdBQXVHO2dDQUN2RyxZQUFZLEdBQUcsU0FBUyxDQUFDO2dDQUN6QixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQzs2QkFDekI7eUJBQ0Y7d0JBQ0QsMEVBQTBFO3dCQUMxRSxJQUFJLE9BQU8sR0FBRyxVQUFVLEVBQUU7NEJBQ3hCLDJFQUEyRTs0QkFDM0UsT0FBTyxLQUFLLEVBQUUsQ0FBQzt5QkFDaEI7d0JBQ0QsWUFBWSxHQUFHLE1BQU0sQ0FBQzt3QkFDdEIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFCLENBQUMsQ0FBQyxDQUNILENBQUM7aUJBQ0g7WUFDSCxDQUFDLENBQUMsQ0FDSDtpQkFDQSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZW1wdHksIG9mLCB0aW1lciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmbGF0TWFwLCBkZWxheSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vbG9nZ2VyLnNlcnZpY2UnO1xyXG5cclxuY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlclNlcnZpY2UoKTtcclxuXHJcbi8qKlxyXG4gKiBJZiBvYnNlcnZhYmxlIHZhbHVlIGhhcyBub3QgY2hhbmdlZCBhY3QgYXMgdGhyb3R0bGVUaW1lLCBidXQgaWYgY2hhbmdlZCBub3RpZnkgaXQgaW5tZWRpYXRseS5cclxuICogQHBhcmFtIHRocm90dGxlVGltZSB0aHJvdHRsZSB0aW1lIGluIG1pbGlzZWNvbmRzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm90dGxlVGltZVVudGlsQ2hhbmdlZCh0aHJvdHRsZVRpbWU6IG51bWJlcikge1xyXG4gIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPGFueT4pID0+IHtcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XHJcbiAgICAgIGxldCBsYXN0U2VlbiA9IHt9O1xyXG4gICAgICBsZXQgbGFzdFNlZW5UaW1lID0gMDtcclxuXHJcbiAgICAgIHJldHVybiBzb3VyY2VcclxuICAgICAgICAucGlwZShcclxuICAgICAgICAgIGZsYXRNYXAoKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLy8gbG9nZ2VyLmxvZyhgdGhyb3R0bGVUaW1lVW50aWxDaGFuZ2VkOiB2YWx1ZTogJHt2YWx1ZX0gbGFzdDogJHtsYXN0U2Vlbn1gKTtcclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBsYXN0U2VlbiAmJiBub3cgLSBsYXN0U2VlblRpbWUgPCB0aHJvdHRsZVRpbWUpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBsYXN0U2VlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIGxhc3RTZWVuVGltZSA9IG5vdztcclxuICAgICAgICAgICAgICByZXR1cm4gb2YobGFzdFNlZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIClcclxuICAgICAgICAuc3Vic2NyaWJlKG9ic2VydmVyKTtcclxuICAgIH0pO1xyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgc3B1cmlvdXMgY2hhbmdlcyBvbiBhIGJvb2xlYW4gb2JzZXJ2YWJsZS5cclxuICogQHBhcmFtIGdsaXRjaFNpemUgbWF4IHNpemUgb2YgdGhlIGdpdGNoZXMgKGluIG1pbGlzZWNvbmRzKSB0byBiZSByZW1vdmVkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZ2xpdGNoKGdsaXRjaFNpemU6IG51bWJlcikge1xyXG4gIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPGJvb2xlYW4+KSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xyXG4gICAgICBsZXQgY3VycmVudFN0YXRlOiBib29sZWFuO1xyXG4gICAgICBsZXQgbGFzdFN0YXRlOiBib29sZWFuO1xyXG4gICAgICBsZXQgbGFzdFN0YXRlVGltZTogbnVtYmVyO1xyXG5cclxuICAgICAgcmV0dXJuIHNvdXJjZVxyXG4gICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgZmxhdE1hcCgodmFsdWU6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgLy8gbG9nZ2VyLmxvZyhgZGVnbGl0Y2g6IHZhbHVlOiAke3ZhbHVlfSBjdXJyZW50U3RhdGU6ICR7Y3VycmVudFN0YXRlfSBgKTtcclxuICAgICAgICAgICAgbGFzdFN0YXRlVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgIGxhc3RTdGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFN0YXRlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICByZXR1cm4gb2YodmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gY3VycmVudFN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG9mKHZhbHVlKS5waXBlKFxyXG4gICAgICAgICAgICAgICAgZGVsYXkoZ2xpdGNoU2l6ZSksXHJcbiAgICAgICAgICAgICAgICBmbGF0TWFwKCh2YWx1ZV86IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSBsYXN0U3RhdGVUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAvLyBsb2dnZXIubG9nKGBkZWdsaXRjaCAtPiBkZWxheSBlbGFwc2VkOiAke2VsYXBzZWR9IHZhbHVlXzogJHt2YWx1ZV99IGxhc3RTdGF0ZTogJHtsYXN0U3RhdGV9IGN1cnJlbnRTdGF0ZTogJHtjdXJyZW50U3RhdGV9IGApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlXyAhPT0gbGFzdFN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RTdGF0ZSA9PT0gY3VycmVudFN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZXIubG9nKGBkZWdsaXRjaCAtPiBkZWxheSBsYXN0U3RhdGUgPT09IGN1cnJlbnRTdGF0ZSAtPiBlbXB0eSgpYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgLy8gbG9nZ2VyLmxvZyhgZGVnbGl0Y2ggLT4gZGVsYXkgZWxhcHNlZDogJHtlbGFwc2VkfSBsYXN0U3RhdGUgIT09IGN1cnJlbnRTdGF0ZSAtPiAke2xhc3RTdGF0ZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSA9IGxhc3RTdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvZihjdXJyZW50U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAvLyBsb2dnZXIubG9nKGBkZWdsaXRjaCAtPiBkZWxheSB2YWx1ZV8gIT09IGxhc3RTdGF0ZSAtPiAke3ZhbHVlX31gKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKGVsYXBzZWQgPCBnbGl0Y2hTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9nZ2VyLmxvZyhgZGVnbGl0Y2ggLT4gZGVsYXkgJHtlbGFwc2VkfSA8IGdsaXRjaFNpemUgLT4gZW1wdHkoKWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSA9IHZhbHVlXztcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mKGN1cnJlbnRTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBzcHVyaW91cyBmYWxzZXMgb24gYSBib29sZWFuIG9ic2VydmFibGUuXHJcbiAqIEBwYXJhbSBnbGl0Y2hTaXplIG1heCBzaXplIG9mIHRoZSBnaXRjaGVzIChpbiBtaWxpc2Vjb25kcykgdG8gYmUgcmVtb3ZlZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWdsaXRjaEZhbHNlKGdsaXRjaFNpemU6IG51bWJlcikge1xyXG4gIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPGJvb2xlYW4+KSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xyXG4gICAgICBsZXQgY3VycmVudFN0YXRlOiBib29sZWFuO1xyXG4gICAgICBsZXQgbGFzdFN0YXRlOiBib29sZWFuO1xyXG4gICAgICBsZXQgbGFzdFN0YXRlVGltZTogbnVtYmVyO1xyXG5cclxuICAgICAgcmV0dXJuIHNvdXJjZVxyXG4gICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgZmxhdE1hcCgodmFsdWU6IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgLy8gbG9nZ2VyLmxvZyhgZGVnbGl0Y2hGYWxzZTogdmFsdWU6ICR7dmFsdWV9IGN1cnJlbnRTdGF0ZTogJHtjdXJyZW50U3RhdGV9IGApO1xyXG4gICAgICAgICAgICBsYXN0U3RhdGVUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgbGFzdFN0YXRlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U3RhdGUgPT09IHVuZGVmaW5lZCB8fCAodmFsdWUgPT09IHRydWUgJiYgY3VycmVudFN0YXRlICE9PSB2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICByZXR1cm4gb2YodmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gY3VycmVudFN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG9mKHZhbHVlKS5waXBlKFxyXG4gICAgICAgICAgICAgICAgZGVsYXkoZ2xpdGNoU2l6ZSksXHJcbiAgICAgICAgICAgICAgICBmbGF0TWFwKCh2YWx1ZV86IGJvb2xlYW4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSBsYXN0U3RhdGVUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAvLyBsb2dnZXIubG9nKGBkZWdsaXRjaEZhbHNlIC0+IGRlbGF5IGVsYXBzZWQ6ICR7ZWxhcHNlZH0gdmFsdWVfOiAke3ZhbHVlX30gbGFzdFN0YXRlOiAke2xhc3RTdGF0ZX0gY3VycmVudFN0YXRlOiAke2N1cnJlbnRTdGF0ZX0gYCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWVfICE9PSBsYXN0U3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFN0YXRlID09PSBjdXJyZW50U3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ2dlci5sb2coYGRlZ2xpdGNoRmFsc2UgLT4gZGVsYXkgbGFzdFN0YXRlID09PSBjdXJyZW50U3RhdGUgLT4gZW1wdHkoKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ2dlci5sb2coYGRlZ2xpdGNoRmFsc2UgLT4gZGVsYXkgZWxhcHNlZDogJHtlbGFwc2VkfSBsYXN0U3RhdGUgIT09IGN1cnJlbnRTdGF0ZSAtPiAke2xhc3RTdGF0ZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSA9IGxhc3RTdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvZihjdXJyZW50U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAvLyBsb2dnZXIubG9nKGBkZWdsaXRjaEZhbHNlIC0+IGRlbGF5IHZhbHVlXyAhPT0gbGFzdFN0YXRlIC0+ICR7dmFsdWVffWApO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoZWxhcHNlZCA8IGdsaXRjaFNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZXIubG9nKGBkZWdsaXRjaEZhbHNlIC0+IGRlbGF5ICR7ZWxhcHNlZH0gPCBnbGl0Y2hTaXplIC0+IGVtcHR5KClgKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB2YWx1ZV87XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvZihjdXJyZW50U3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIClcclxuICAgICAgICAuc3Vic2NyaWJlKG9ic2VydmVyKTtcclxuICAgIH0pO1xyXG4gIH07XHJcbn1cclxuXHJcbiJdfQ==