import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NotificationService } from '../../core/services/notification.service';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let notifications: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [ToastContainerComponent] }).compileComponents();
    fixture = TestBed.createComponent(ToastContainerComponent);
    notifications = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('renders success and error toasts with the right role', fakeAsync(() => {
    notifications.success('Saved');
    notifications.error('Failed');
    fixture.detectChanges();
    const toasts: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.toast'));
    expect(toasts.map((t) => t.textContent?.trim())).toEqual(['Saved', 'Failed']);
    expect(toasts[1].getAttribute('role')).toBe('alert');
    tick(5000);
  }));

  it('removes a toast when closed', fakeAsync(() => {
    notifications.success('Saved');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.btn-close').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(0);
    tick(5000);
  }));
});
