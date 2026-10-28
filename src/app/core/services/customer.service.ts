import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ERROR_CODES, ApiError, ApiErrorCode } from '../models/api-error';
import {
  Customer,
  CustomerFilters,
  CustomerPage,
  CustomerPayload,
  CustomerStatus,
  CustomerSummary,
} from '../models/customer.model';

/** Error body returned by the .NET API for every failure. */
interface ApiErrorBody {
  message?: unknown;
  code?: unknown;
}

const NETWORK_MESSAGE = 'Unable to reach the server. Check that the API is running and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

/**
 * HTTP implementation of the customer API. The public methods are identical to the earlier
 * in-memory mock, so no component needed to change.
 */
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly baseUrl = `${environment.apiBaseUrl}/customers`;

  constructor(private readonly http: HttpClient) {}

  getCustomers(filters: CustomerFilters): Observable<CustomerPage> {
    let params = new HttpParams()
      .set('status', filters.status)
      .set('city', filters.city)
      .set('sortBy', filters.sortBy)
      .set('sortDirection', filters.sortDirection)
      .set('page', filters.page)
      .set('pageSize', filters.pageSize);

    const search = filters.search.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<CustomerPage>(this.baseUrl, { params }).pipe(catchError((error) => this.toApiError(error)));
  }

  getSummary(): Observable<CustomerSummary> {
    return this.http
      .get<CustomerSummary>(`${this.baseUrl}/summary`)
      .pipe(catchError((error) => this.toApiError(error)));
  }

  getById(id: string): Observable<Customer> {
    return this.http
      .get<Customer>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(catchError((error) => this.toApiError(error)));
  }

  isEmailTaken(email: string, excludeId?: string | null): Observable<boolean> {
    let params = new HttpParams().set('email', email.trim());
    if (excludeId) {
      params = params.set('excludeId', excludeId);
    }
    return this.http.get<{ taken: boolean }>(`${this.baseUrl}/email-exists`, { params }).pipe(
      map((response) => response.taken),
      catchError((error) => this.toApiError(error)),
    );
  }

  create(payload: CustomerPayload): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, payload).pipe(catchError((error) => this.toApiError(error)));
  }

  update(id: string, payload: CustomerPayload): Observable<Customer> {
    return this.http
      .put<Customer>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload)
      .pipe(catchError((error) => this.toApiError(error)));
  }

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.http
      .patch<Customer>(`${this.baseUrl}/${encodeURIComponent(id)}/status`, { status })
      .pipe(catchError((error) => this.toApiError(error)));
  }

  /** One place that turns any HTTP failure into an ApiError the UI already understands. */
  private toApiError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new ApiError(GENERIC_MESSAGE, 500, 'SERVER_ERROR'));
    }
    if (error.status === 0) {
      return throwError(() => new ApiError(NETWORK_MESSAGE, 0, 'NETWORK'));
    }

    const body = (error.error ?? {}) as ApiErrorBody;
    const message = typeof body.message === 'string' && body.message ? body.message : GENERIC_MESSAGE;
    const code = API_ERROR_CODES.find((candidate) => candidate === body.code) as ApiErrorCode | undefined;
    return throwError(() => new ApiError(message, error.status, code));
  }
}
