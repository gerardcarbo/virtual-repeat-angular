import { VirtualRepeat } from './virtual-repeat-collection';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatContainer } from './virtual-repeat-container';
import { VirtualRepeatAsynch } from './virtual-repeat-asynch';
import { VirtualRepeatReactive } from './virtual-repeat-reactive';
import { LoggerService } from './logger.service';
import * as i0 from "@angular/core";
export class VirtualRepeatAngularLibModule {
}
VirtualRepeatAngularLibModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
VirtualRepeatAngularLibModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, declarations: [VirtualRepeatContainer,
        VirtualRepeat,
        VirtualRepeatAsynch,
        VirtualRepeatReactive], imports: [BrowserModule], exports: [VirtualRepeatContainer,
        VirtualRepeat,
        VirtualRepeatAsynch,
        VirtualRepeatReactive] });
VirtualRepeatAngularLibModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, providers: [
        LoggerService
    ], imports: [BrowserModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.6", ngImport: i0, type: VirtualRepeatAngularLibModule, decorators: [{
            type: NgModule,
            args: [{
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
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvdmlydHVhbC1yZXBlYXQtYW5ndWxhci1saWIvc3JjL2xpYi92aXJ0dWFsLXJlcGVhdC1hbmd1bGFyLWxpYi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7QUF1QmpELE1BQU0sT0FBTyw2QkFBNkI7OzBIQUE3Qiw2QkFBNkI7MkhBQTdCLDZCQUE2QixpQkFmdEMsc0JBQXNCO1FBQ3RCLGFBQWE7UUFDYixtQkFBbUI7UUFDbkIscUJBQXFCLGFBTnJCLGFBQWEsYUFZYixzQkFBc0I7UUFDdEIsYUFBYTtRQUNiLG1CQUFtQjtRQUNuQixxQkFBcUI7MkhBR1osNkJBQTZCLGFBVjdCO1FBQ1QsYUFBYTtLQUNkLFlBVkMsYUFBYTsyRkFrQkosNkJBQTZCO2tCQXBCekMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsYUFBYTtxQkFDZDtvQkFDRCxZQUFZLEVBQUU7d0JBQ1osc0JBQXNCO3dCQUN0QixhQUFhO3dCQUNiLG1CQUFtQjt3QkFDbkIscUJBQXFCO3FCQUN0QjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsYUFBYTtxQkFDZDtvQkFDRCxPQUFPLEVBQUU7d0JBQ1Asc0JBQXNCO3dCQUN0QixhQUFhO3dCQUNiLG1CQUFtQjt3QkFDbkIscUJBQXFCO3FCQUN0QjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpcnR1YWxSZXBlYXQgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbGxlY3Rpb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJyb3dzZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IFZpcnR1YWxSZXBlYXRDb250YWluZXIgfSBmcm9tICcuL3ZpcnR1YWwtcmVwZWF0LWNvbnRhaW5lcic7XG5pbXBvcnQgeyBWaXJ0dWFsUmVwZWF0QXN5bmNoIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1hc3luY2gnO1xuaW1wb3J0IHsgVmlydHVhbFJlcGVhdFJlYWN0aXZlIH0gZnJvbSAnLi92aXJ0dWFsLXJlcGVhdC1yZWFjdGl2ZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnZXIuc2VydmljZSc7XG5cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEJyb3dzZXJNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgVmlydHVhbFJlcGVhdENvbnRhaW5lcixcbiAgICBWaXJ0dWFsUmVwZWF0LFxuICAgIFZpcnR1YWxSZXBlYXRBc3luY2gsXG4gICAgVmlydHVhbFJlcGVhdFJlYWN0aXZlXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIExvZ2dlclNlcnZpY2VcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFZpcnR1YWxSZXBlYXRDb250YWluZXIsXG4gICAgVmlydHVhbFJlcGVhdCxcbiAgICBWaXJ0dWFsUmVwZWF0QXN5bmNoLFxuICAgIFZpcnR1YWxSZXBlYXRSZWFjdGl2ZVxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxSZXBlYXRBbmd1bGFyTGliTW9kdWxlIHsgfVxuIl19