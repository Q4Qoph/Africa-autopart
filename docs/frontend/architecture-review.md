# Africa Auto Parts Architecture Review

## 1. Major Architectural Boundaries

This checkout is a frontend-only application. No backend source, migrations, ORM configuration, or database schema is present. The main boundaries are the React application shell, route and access guards, feature pages, Axios API modules, shared React contexts, and presentation assets. `src/frontend/package.json` is the authoritative package manifest; the root has no `package.json`.

## 2. Business Logic

Most business logic lives inside page components. Catalog search and fallback behavior are concentrated in `HomePage.tsx` and `pages/parts/PartsSearchPage.tsx`. Order, request, payment, admin, and supplier behavior lives in their respective page directories. API request construction and response normalization live in `src/frontend/src/api/`; smaller transformations live in `src/frontend/src/lib/`. Several pages are very large, especially `PartsSearchPage.tsx`, which combines fetching, fallback, filtering, pagination, cart, and modal behavior.

## 3. Data Flow

Pages collect form, URL, or navigation state, call an API module through Axios, normalize typed responses, and store results in local React state or React Query. Search results are also passed through router state and query parameters. Login stores the response token and role in `localStorage`; authenticated API calls manually add `Authorization: Bearer <token>`. React Query is used selectively, while most pages fetch through `useEffect`. `CartContext` and `ExternalCartContext` are separate in-memory carts.

## 4. External Services and APIs

Backend endpoint families cover users, suppliers, inventory, requests, orders, payments, images, parts, and VIN/catalog search. Stripe and M-Pesa are reached through backend payment endpoints. VIN fallback decoding is exposed through `/api/vehicles/vin/{vin}/decode` and is documented as NHTSA-backed. Other external dependencies include Azure Blob Storage image URLs, YouTube, `placehold.co`, Azure Static Web Apps, and Vercel configuration.

## 5. Technical Debt

- Legacy and new order systems coexist (`/api/Order` and `/api/NewOrder`).
- Catalog behavior is split across `catalogApi`, `partNewApi`, `partsApi`, `vinApi`, and `PartsSeed`.
- Payment code is split between `paymentApi` and `invPaymentApi`.
- Axios setup and auth-header helpers are duplicated.
- Search contains compatibility adapters and hardcoded fallbacks such as `CRETA` and category values.
- No test runner is configured; `tests/` contains only `.gitkeep`.
- ESLint suppression comments, `any` usages, and the template frontend README indicate unfinished cleanup.

## 6. Security and Reliability Concerns

The bearer token is stored in `localStorage`, and route role checks are client-side, so the backend must enforce authorization independently. Some inventory mutation and upload wrappers do not attach auth headers. Spreadsheet seeding is exposed through a routed UI. Upload validation, remote image URL validation, payment idempotency, Axios timeouts, centralized error handling, token expiry, and retry behavior are not visibly centralized. `ExternalCartContext` identifies parts by name, which can merge distinct supplier listings.

## 7. Areas to Modify Carefully

Treat catalog pagination, VIN fallback, DTO contracts, legacy/new order and payment flows, numeric roles, auth persistence, payment callbacks, cart identity, supplier/admin mutations, translation keys, and image storage as high-risk areas. The recent Git history shows frequent catalog and payment endpoint changes, so verify backend contracts before changing API calls.

## 8. Database and Testing Status

The repository contains no database schema or backend tests. CI currently runs `npm ci`, `npm run lint`, and `npm run build` under Node 20 from `src/frontend`. The existing `tests/` directory is reserved for future cross-cutting tests.
