import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DEFAULT_FILTERS } from '../../../core/models/customer.model';
import { CustomerFiltersComponent, SEARCH_DEBOUNCE_MS } from './customer-filters.component';

describe('CustomerFiltersComponent', () => {
  let fixture: ComponentFixture<CustomerFiltersComponent>;
  let component: CustomerFiltersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CustomerFiltersComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerFiltersComponent);
    component = fixture.componentInstance;
    component.cities = ['Chennai', 'Salem'];
    fixture.detectChanges();
  });

  it('debounces rapid typing and emits only the final term', fakeAsync(() => {
    const emitted: string[] = [];
    component.searchChange.subscribe((term) => emitted.push(term));
    const search = component.form.controls.search;

    search.setValue('k');
    tick(100);
    search.setValue('ku');
    tick(100);
    search.setValue('kumar ');
    tick(SEARCH_DEBOUNCE_MS - 1);
    expect(emitted).toEqual([]);
    tick(1);
    expect(emitted).toEqual(['kumar']);
  }));

  it('emits status, city and sort changes immediately', () => {
    const status: string[] = [];
    const cities: string[] = [];
    const sorts: string[] = [];
    component.statusChange.subscribe((value) => status.push(value));
    component.cityChange.subscribe((value) => cities.push(value));
    component.sortChange.subscribe((value) => sorts.push(`${value.sortBy}:${value.sortDirection}`));

    component.form.controls.status.setValue('Active');
    component.form.controls.city.setValue('Salem');
    component.form.controls.sort.setValue('fullName:asc');

    expect(status).toEqual(['Active']);
    expect(cities).toEqual(['Salem']);
    expect(sorts).toEqual(['fullName:asc']);
  });

  it('restores control values from filters (e.g. coming back from the details page)', () => {
    component.filters = { ...DEFAULT_FILTERS, search: 'priya', status: 'Active', city: 'Chennai' };
    component.ngOnChanges({ filters: { previousValue: DEFAULT_FILTERS, currentValue: component.filters, firstChange: true, isFirstChange: () => true } });
    expect(component.form.getRawValue()).toEqual({
      search: 'priya',
      status: 'Active',
      city: 'Chennai',
      sort: 'updatedAt:desc',
    });
  });

  it('enables Clear only when filters are active and emits on click', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();

    component.filters = { ...DEFAULT_FILTERS, status: 'Inactive' };
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();

    let cleared = false;
    component.filtersCleared.subscribe(() => (cleared = true));
    button.click();
    expect(cleared).toBeTrue();
  });
});
