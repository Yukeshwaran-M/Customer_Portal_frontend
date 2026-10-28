# Customer Operations Portal (Frontend – Step 1)

Angular 15 + TypeScript (strict) + Bootstrap 5, talking to the .NET API at `environment.apiBaseUrl` (http://localhost:5000/api).

## Versions
- Angular / Angular CLI: 15.x
- Node.js: 18.x LTS recommended (14.20, 16.13 or 18.10+ officially supported by Angular 15)
- Bootstrap: 5.3

## Run
```bash
npm install
npm start          # http://localhost:4200
npm test           # Karma + Jasmine (needs Chrome)
npm run build      # production build
```

## Architecture
- `core/` models, utils, services (`CustomerService` wraps HttpClient and maps every failure to an `ApiError`)
- `shared/` pagination, confirm dialog, toasts, validators
- `features/customers/` lazy-loaded module: list (smart), stats / filters / table / form (presentational), editor page, details
- Filters live in one `BehaviorSubject`; `combineLatest` + `switchMap` cancels stale requests; 300 ms debounce only on the search box
- `CustomerListStateService` keeps search/filters when you open details and come back
- `CustomerStatusService` handles confirm -> call -> feedback -> busy tracking for both list and details

## Reproducing API errors (simulated by the .NET API, see its appsettings.json -> MockBehavior)
| Case | How |
|---|---|
| Failed list request | search `error` |
| Empty result | search `zzz` |
| Failed save | save a customer with email `fail@test.com` |
| Failed status change | activate/deactivate `CUS-1008` |
| Duplicate email | any existing email, any case or surrounding spaces |
| Delays | MinDelayMs / MaxDelayMs in the API's appsettings.json |

## Assumptions and limitations
- Any user is treated as authorized (no login)
- Details/edit pages are routes (`/customers/:id`, `/customers/:id/edit`)
