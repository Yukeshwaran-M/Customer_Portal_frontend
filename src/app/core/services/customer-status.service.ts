import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, filter, finalize, switchMap, tap } from 'rxjs';
import { Customer, CustomerStatus } from '../models/customer.model';
import { getErrorMessage } from '../utils/error.util';
import { ConfirmService } from './confirm.service';
import { CustomerService } from './customer.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class CustomerStatusService {
  private readonly busySubject = new BehaviorSubject<ReadonlySet<string>>(new Set<string>());
  /** Ids of customers with a status change in flight. */
  readonly busyIds$ = this.busySubject.asObservable();

  constructor(
    private readonly customers: CustomerService,
    private readonly confirmService: ConfirmService,
    private readonly notifications: NotificationService,
  ) {}

  /** Emits the updated customer only when the user confirmed AND the API succeeded. */
  toggle(customer: Customer): Observable<Customer> {
    if (this.busySubject.value.has(customer.id)) {
      return EMPTY; // already in flight: ignore repeated submissions
    }

    const target: CustomerStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    const verb = target === 'Active' ? 'Activate' : 'Deactivate';

    return this.confirmService
      .confirm({
        title: `${verb} customer`,
        message: `Are you sure you want to ${verb.toLowerCase()} ${customer.fullName} (${customer.id})?`,
        confirmText: verb,
        danger: target === 'Inactive',
      })
      .pipe(
        filter((confirmed) => confirmed),
        tap(() => this.setBusy(customer.id, true)),
        switchMap(() =>
          this.customers.updateStatus(customer.id, target).pipe(
            tap(() => this.notifications.success(`${customer.fullName} is now ${target.toLowerCase()}.`)),
            catchError((error: unknown) => {
              this.notifications.error(getErrorMessage(error, 'Unable to change the customer status.'));
              return EMPTY;
            }),
            finalize(() => this.setBusy(customer.id, false)),
          ),
        ),
      );
  }

  private setBusy(id: string, busy: boolean): void {
    const next = new Set(this.busySubject.value);
    if (busy) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.busySubject.next(next);
  }
}
