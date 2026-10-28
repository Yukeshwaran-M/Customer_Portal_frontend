import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Customer, CustomerStatus } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  styleUrls: ['./customer-table.component.css'],
})
export class CustomerTableComponent {
  @Input() customers: readonly Customer[] = [];
  @Input() busyIds: ReadonlySet<string> | null = null;
  @Output() toggleStatus = new EventEmitter<Customer>();

  isBusy(id: string): boolean {
    return this.busyIds?.has(id) ?? false;
  }

  toggleLabel(customer: Customer): string {
    return customer.status === 'Active' ? 'Deactivate' : 'Activate';
  }

  badgeClass(status: CustomerStatus): string {
    return status === 'Active' ? 'text-bg-success' : 'text-bg-secondary';
  }

  trackById(_index: number, customer: Customer): string {
    return customer.id;
  }
}
