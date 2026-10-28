import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('renders the brand, router outlet and global toast/confirm hosts', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.navbar-brand')?.textContent).toContain('Customer Operations Portal');
    expect(element.querySelector('router-outlet')).toBeTruthy();
    expect(element.querySelector('app-toast-container')).toBeTruthy();
    expect(element.querySelector('app-confirm-dialog')).toBeTruthy();
  });
});
