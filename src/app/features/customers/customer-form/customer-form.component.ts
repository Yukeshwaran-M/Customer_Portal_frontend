import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  Customer,
  CustomerPayload,
  CustomerStatus,
  RISK_LEVELS,
  RiskLevel,
  STATUSES,
} from '../../../core/models/customer.model';
import { CustomerService } from '../../../core/services/customer.service';
import {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  trimmedLength,
  uniqueEmailValidator,
} from '../../../shared/validators/form-validators';

type TextField = 'fullName' | 'email' | 'phone' | 'city';

const ERROR_MESSAGES: Record<TextField, Record<string, string>> = {
  fullName: {
    required: 'Full name is required.',
    minTrimmed: 'Full name must be at least 3 characters.',
    maxTrimmed: 'Full name cannot be longer than 80 characters.',
  },
  email: {
    required: 'Email is required.',
    pattern: 'Enter a valid email address, e.g. name@example.com.',
    duplicateEmail: 'A customer with this email already exists.',
  },
  phone: {
    required: 'Phone number is required.',
    pattern: 'Phone number must be exactly 10 digits.',
  },
  city: {
    required: 'City is required.',
    maxTrimmed: 'City cannot be longer than 60 characters.',
  },
};

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
})
export class CustomerFormComponent implements OnChanges {
  /** null = add mode, a customer = edit mode */
  @Input() customer: Customer | null = null;
  @Input() saving = false;
  @Input() cities: readonly string[] = [];
  @Output() save = new EventEmitter<CustomerPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly statuses = STATUSES;
  readonly riskLevels = RISK_LEVELS;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, trimmedLength(3, 80)]],
    email: [
      '',
      {
        validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
        asyncValidators: [uniqueEmailValidator(this.customers, () => this.customer?.id ?? null)],
      },
    ],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    city: ['', [Validators.required, trimmedLength(1, 60)]],
    status: ['Active' as CustomerStatus, Validators.required],
    riskLevel: ['Low' as RiskLevel, Validators.required],
    reviewRequired: false,
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly customers: CustomerService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer']) {
      const customer = this.customer;
      this.form.reset({
        fullName: customer?.fullName ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        city: customer?.city ?? '',
        status: customer?.status ?? 'Active',
        riskLevel: customer?.riskLevel ?? 'Low',
        reviewRequired: customer?.reviewRequired ?? false,
      });
    }
  }

  get isSubmitDisabled(): boolean {
    return this.form.invalid || this.form.pending || this.saving;
  }

  errorMessage(field: TextField): string | null {
    const control = this.form.controls[field];
    if (!(control.touched || control.dirty) || !control.errors) {
      return null;
    }
    const key = Object.keys(control.errors)[0];
    return ERROR_MESSAGES[field][key] ?? 'This value is not valid.';
  }

  markEmailDuplicate(): void {
    const email = this.form.controls.email;
    email.setErrors({ duplicateEmail: true });
    email.markAsTouched();
  }

  onSubmit(): void {
    if (this.isSubmitDisabled) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      phone: value.phone,
      city: value.city.trim(),
      status: value.status,
      riskLevel: value.riskLevel,
      reviewRequired: value.reviewRequired,
    });
  }
}
