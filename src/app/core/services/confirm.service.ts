import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface ConfirmRequest {
  options: ConfirmOptions;
  respond: (confirmed: boolean) => void;
}

/** Promise-like confirmation: the dialog component renders `request$`. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly requestSubject = new BehaviorSubject<ConfirmRequest | null>(null);
  readonly request$ = this.requestSubject.asObservable();

  confirm(options: ConfirmOptions): Observable<boolean> {
    const result$ = new AsyncSubject<boolean>();
    this.requestSubject.next({
      options,
      respond: (confirmed: boolean) => {
        this.requestSubject.next(null);
        result$.next(confirmed);
        result$.complete();
      },
    });
    return result$.asObservable();
  }
}
