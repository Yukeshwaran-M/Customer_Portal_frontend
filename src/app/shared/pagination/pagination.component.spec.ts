import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PaginationComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.totalCount = 23;
    component.pageSize = 5;
    component.page = 5;
    fixture.detectChanges();
  });

  it('computes total pages and the visible range', () => {
    expect(component.totalPages).toBe(5);
    expect(component.firstItem).toBe(21);
    expect(component.lastItem).toBe(23);
    expect(fixture.nativeElement.textContent).toContain('Showing 21–23 of 23');
  });

  it('emits the requested page and ignores out-of-range requests', () => {
    const emitted: number[] = [];
    component.pageChange.subscribe((page) => emitted.push(page));
    component.goTo(4);
    component.goTo(6);
    component.goTo(5);
    expect(emitted).toEqual([4]);
  });

  it('emits when the page size changes', () => {
    const emitted: number[] = [];
    component.pageSizeChange.subscribe((size) => emitted.push(size));
    component.pageSizeControl.setValue(20);
    expect(emitted).toEqual([20]);
  });

  it('shows 0–0 when there are no records', () => {
    component.totalCount = 0;
    component.page = 1;
    expect(component.firstItem).toBe(0);
    expect(component.lastItem).toBe(0);
  });
});
