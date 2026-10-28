import { TestBed } from '@angular/core/testing';
import { ConfirmRequest, ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;
  let requests: ConfirmRequest[];
  let results: boolean[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmService);
    requests = [];
    results = [];
    service.request$.subscribe((request) => request && requests.push(request));
  });

  it('publishes a request and resolves with true when confirmed', () => {
    service.confirm({ title: 'Title', message: 'Message' }).subscribe((value) => results.push(value));
    expect(requests.length).toBe(1);
    requests[0].respond(true);
    expect(results).toEqual([true]);
  });

  it('resolves with false when cancelled', () => {
    service.confirm({ title: 'Title', message: 'Message' }).subscribe((value) => results.push(value));
    requests[0].respond(false);
    expect(results).toEqual([false]);
  });
});
