import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ApiError } from '../models/api-error';
import { CustomerPayload, DEFAULT_FILTERS } from '../models/customer.model';
import { CustomerService } from './customer.service';

describe('CustomerService (HTTP)', () => {
  let service: CustomerService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/customers`;

  const payload: CustomerPayload = {
    fullName: 'Test User',
    email: 'test.user@example.com',
    phone: '9000000000',
    city: 'Chennai',
    status: 'Active',
    riskLevel: 'Low',
    reviewRequired: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CustomerService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends every filter as a query parameter and omits an empty search', () => {
    service
      .getCustomers({ ...DEFAULT_FILTERS, status: 'Active', city: 'Chennai', page: 2, pageSize: 5 })
      .subscribe();

    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('status')).toBe('Active');
    expect(req.request.params.get('city')).toBe('Chennai');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('5');
    expect(req.request.params.get('sortBy')).toBe('updatedAt');
    expect(req.request.params.has('search')).toBeFalse();
    req.flush({ items: [], totalCount: 0 });
  });

  it('sends a trimmed search term', () => {
    service.getCustomers({ ...DEFAULT_FILTERS, search: '  kumar ' }).subscribe();
    const req = http.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get('search')).toBe('kumar');
    req.flush({ items: [], totalCount: 0 });
  });

  it('maps the duplicate-email response of create() to an ApiError with a code', () => {
    let error: unknown;
    service.create(payload).subscribe({ error: (e: unknown) => (error = e) });

    http
      .expectOne(baseUrl)
      .flush(
        { message: 'A customer with this email already exists.', code: 'DUPLICATE_EMAIL' },
        { status: 409, statusText: 'Conflict' },
      );

    expect(error instanceof ApiError).toBeTrue();
    expect((error as ApiError).code).toBe('DUPLICATE_EMAIL');
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).message).toContain('already exists');
  });

  it('shows a friendly message when the API cannot be reached', () => {
    let error: unknown;
    service.getSummary().subscribe({ error: (e: unknown) => (error = e) });

    http.expectOne(`${baseUrl}/summary`).error(new ProgressEvent('error'));

    expect((error as ApiError).code).toBe('NETWORK');
    expect((error as ApiError).message).toContain('Unable to reach the server');
  });

  it('falls back to a generic message when the error body is not in the expected shape', () => {
    let error: unknown;
    service.getById('CUS-1001').subscribe({ error: (e: unknown) => (error = e) });

    http.expectOne(`${baseUrl}/CUS-1001`).flush('<html>boom</html>', { status: 500, statusText: 'Server Error' });

    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).message).toBe('Something went wrong. Please try again.');
  });

  it('reads the taken flag for the duplicate-email check and passes excludeId', () => {
    let taken: boolean | undefined;
    service.isEmailTaken(' A@b.com ', 'CUS-1001').subscribe((value) => (taken = value));

    const req = http.expectOne((r) => r.url === `${baseUrl}/email-exists`);
    expect(req.request.params.get('email')).toBe('A@b.com');
    expect(req.request.params.get('excludeId')).toBe('CUS-1001');
    req.flush({ taken: true });

    expect(taken).toBeTrue();
  });

  it('updates the status with PATCH and the new status in the body', () => {
    service.updateStatus('CUS-1001', 'Inactive').subscribe();
    const req = http.expectOne(`${baseUrl}/CUS-1001/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'Inactive' });
    req.flush({});
  });

  it('uses PUT for updates and POST for creates', () => {
    service.update('CUS-1001', payload).subscribe();
    service.create(payload).subscribe();
    const put = http.expectOne(`${baseUrl}/CUS-1001`);
    const post = http.expectOne(baseUrl);
    expect(put.request.method).toBe('PUT');
    expect(post.request.method).toBe('POST');
    put.flush({});
    post.flush({});
  });
});
