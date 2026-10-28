import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ApiError } from '../../../core/models/api-error';
import { Customer, CustomerPayload } from '../../../core/models/customer.model';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { getErrorMessage } from '../../../core/utils/error.util';
import { CustomerFormComponent } from '../customer-form/customer-form.component';

interface EditorViewModel {
  mode: 'add' | 'edit';
  state: 'loading' | 'ready' | 'error';
  customer: Customer | null;
}

const LOADING_EDIT: EditorViewModel = { mode: 'edit', state: 'loading', customer: null };

@Component({
  selector: 'app-customer-editor-page',
  templateUrl: './customer-editor-page.component.html',
  styleUrls: ['./customer-editor-page.component.css'],
})
export class CustomerEditorPageComponent implements OnDestroy {
  @ViewChild(CustomerFormComponent) private customerForm?: CustomerFormComponent;

  saving = false;
  private readonly destroy$ = new Subject<void>();

  readonly cities$ = this.customers.getSummary().pipe(
    map((summary) => summary.cities),
    catchError(() => of<string[]>([])),
  );

  /** Re-evaluated on every route change, so add/edit/switching between customers all work. */
  readonly vm$: Observable<EditorViewModel> = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => {
      if (id === null) {
        return of<EditorViewModel>({ mode: 'add', state: 'ready', customer: null });
      }
      return this.customers.getById(id).pipe(
        map((customer): EditorViewModel => ({ mode: 'edit', state: 'ready', customer })),
        catchError(() => of<EditorViewModel>({ mode: 'edit', state: 'error', customer: null })),
        startWith(LOADING_EDIT),
      );
    }),
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly customers: CustomerService,
    private readonly notifications: NotificationService,
  ) {}

  onSave(payload: CustomerPayload, customer: Customer | null): void {
    if (this.saving) {
      return; // prevent double submission
    }
    this.saving = true;

    const request$ = customer ? this.customers.update(customer.id, payload) : this.customers.create(payload);

    request$
      .pipe(
        finalize(() => (this.saving = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (saved) => {
          this.notifications.success(customer ? `${saved.fullName} was updated.` : `${saved.fullName} was added.`);
          void this.router.navigate(customer ? ['/customers', saved.id] : ['/customers']);
        },
        error: (error: unknown) => {
          // the form is untouched, so the user's input is preserved
          if (error instanceof ApiError && error.code === 'DUPLICATE_EMAIL') {
            this.customerForm?.markEmailDuplicate();
          }
          this.notifications.error(getErrorMessage(error, 'Unable to save the customer. Please try again.'));
        },
      });
  }

  onCancel(customer: Customer | null): void {
    void this.router.navigate(customer ? ['/customers', customer.id] : ['/customers']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
