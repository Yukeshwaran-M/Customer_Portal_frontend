import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PAGE_SIZES, PageSize } from '../../core/models/customer.model';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() page = 1;
  @Input() pageSize: PageSize = 10;
  @Input() totalCount = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<PageSize>();

  readonly pageSizes = PAGE_SIZES;
  readonly pageSizeControl = new FormControl<PageSize>(10, { nonNullable: true });
  private readonly destroy$ = new Subject<void>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get firstItem(): number {
    return this.totalCount === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get lastItem(): number {
    return Math.min(this.page * this.pageSize, this.totalCount);
  }

  /** Window of up to 5 page numbers around the current page. */
  get pages(): number[] {
    const total = this.totalPages;
    const start = Math.max(1, Math.min(this.page - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  ngOnInit(): void {
    this.pageSizeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((size) => this.pageSizeChange.emit(size));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize']) {
      this.pageSizeControl.setValue(this.pageSize, { emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goTo(target: number): void {
    if (target < 1 || target > this.totalPages || target === this.page) {
      return;
    }
    this.pageChange.emit(target);
  }
}
