import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { VirtualRepeatAngularLibModule } from 'virtual-repeat-angular/virtual-repeat-angular-lib.module';
import { ListItemExample } from './list-item/list-item.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ListItemExample
      ],
      imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        VirtualRepeatAngularLibModule],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Virtual Repeat Angular');
  }));
  it('should contain 3 gc-virtual-repeat-container', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // console.log('gc-virtual-repeat-container', compiled.querySelectorAll('gc-virtual-repeat-container'));
    expect(compiled.querySelectorAll('gc-virtual-repeat-container').length).toBe(3);
  }));
});
