import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MOCK_CUSTOMERS } from '../../../core/data/mock-customers';
import { Customer } from '../../../core/models/customer.model';
import { CustomerTableComponent } from './customer-table.component';

describe('CustomerTableComponent', () => {
  let fixture: ComponentFixture<CustomerTableComponent>;
  let component: CustomerTableComponent;

  const toggleButtons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-test="toggle-status"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CustomerTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerTableComponent);
    component = fixture.componentInstance;
    // CUS-1001 Active, CUS-1002 Active, CUS-1003 Inactive
    component.customers = MOCK_CUSTOMERS.slice(0, 3);
    fixture.detectChanges();
  });

  it('renders a row per customer', () => {
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(3);
  });

  it('offers Deactivate for active and Activate for inactive customers', () => {
    expect(toggleButtons().map((b) => b.textContent?.trim())).toEqual(['Deactivate', 'Deactivate', 'Activate']);
  });

  it('disables the action only for the customer with an operation in flight', () => {
    component.busyIds = new Set(['CUS-1002']);
    fixture.detectChanges();
    expect(toggleButtons().map((b) => b.disabled)).toEqual([false, true, false]);
  });

  it('emits the customer when the status button is clicked', () => {
    const emitted: Customer[] = [];
    component.toggleStatus.subscribe((customer) => emitted.push(customer));
    toggleButtons()[2].click();
    expect(emitted.map((c) => c.id)).toEqual(['CUS-1003']);
  });
});
