import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerSummary } from '../../../core/models/customer.model';
import { CustomerStatsComponent } from './customer-stats.component';

describe('CustomerStatsComponent', () => {
  let fixture: ComponentFixture<CustomerStatsComponent>;
  let component: CustomerStatsComponent;
  const summary: CustomerSummary = { total: 10, active: 6, inactive: 4, needsReview: 4, cities: [] };
  const values = (): string[] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.display-6')).map((el) => el.textContent?.trim() ?? '');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [CustomerStatsComponent] }).compileComponents();
    fixture = TestBed.createComponent(CustomerStatsComponent);
    component = fixture.componentInstance;
  });

  it('shows a placeholder while the summary is not available', () => {
    fixture.detectChanges();
    expect(values()).toEqual(['–', '–', '–', '–']);
  });

  it('shows total, active, inactive and needs-review counts', () => {
    component.summary = summary;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(values()).toEqual(['10', '6', '4', '4']);
  });
});
