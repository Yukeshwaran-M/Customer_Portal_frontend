import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'danger';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const AUTO_DISMISS_MS = 5000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastsSubject = new BehaviorSubject<readonly Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('danger', message);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }

  private show(type: ToastType, message: string): void {
    const toast: Toast = { id: this.nextId++, type, message };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.dismiss(toast.id), AUTO_DISMISS_MS);
  }
}
