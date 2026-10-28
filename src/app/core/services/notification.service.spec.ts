import { fakeAsync, tick, TestBed } from '@angular/core/testing';
import { Toast, NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toasts: readonly Toast[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    service.toasts$.subscribe((value) => (toasts = value));
  });

  it('adds success and error toasts', fakeAsync(() => {
    service.success('Saved');
    service.error('Failed');
    expect(toasts.map((t) => t.type)).toEqual(['success', 'danger']);
    tick(5000);
  }));

  it('dismisses a toast manually', fakeAsync(() => {
    service.success('Saved');
    service.dismiss(toasts[0].id);
    expect(toasts.length).toBe(0);
    tick(5000);
  }));

  it('auto-dismisses after 5 seconds', fakeAsync(() => {
    service.success('Saved');
    tick(4999);
    expect(toasts.length).toBe(1);
    tick(1);
    expect(toasts.length).toBe(0);
  }));
});
