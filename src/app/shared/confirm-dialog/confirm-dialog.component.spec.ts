import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmService } from '../../core/services/confirm.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let service: ConfirmService;
  let results: boolean[];

  const open = (): void => {
    service.confirm({ title: 'Deactivate customer', message: 'Are you sure?', confirmText: 'Deactivate' })
      .subscribe((value) => results.push(value));
    fixture.detectChanges();
  };
  const query = <T extends Element>(selector: string): T | null => fixture.nativeElement.querySelector(selector);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [ConfirmDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    service = TestBed.inject(ConfirmService);
    results = [];
    fixture.detectChanges();
  });

  it('renders nothing until a confirmation is requested', () => {
    expect(query('.modal')).toBeNull();
  });

  it('shows the request and resolves true on confirm', () => {
    open();
    expect(query('.modal-title')?.textContent).toContain('Deactivate customer');
    query<HTMLButtonElement>('[data-test="confirm"]')?.click();
    fixture.detectChanges();
    expect(results).toEqual([true]);
    expect(query('.modal')).toBeNull();
  });

  it('resolves false on cancel and on Escape', () => {
    open();
    query<HTMLButtonElement>('[data-test="cancel"]')?.click();
    open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(results).toEqual([false, false]);
  });
});
