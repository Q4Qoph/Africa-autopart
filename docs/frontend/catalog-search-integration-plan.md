# Africa AutoPart — Catalog & Search Integration Plan (V2)

**Author:** Frontend Engineering  
**Collaborator:** Joe (Backend Engineering)  
**Status:** Awaiting Approval  
**Target:** Africa AutoPart Frontend (`src/frontend`)  

---

## 1. Executive Summary & Context

We have analyzed:
1. **Catalog API Spec (v2 Request)**: The user requirements for a PartSouq/7zap-competitive catalog.
2. **Joe's Backend Documentation (`PartSearchRequestDto_API_Documentation.pdf`)**: Detailing `POST /api/parts/search` request filters and combinations.
3. **Live Swagger API & Azure Endpoints**: The live contracts tested directly against `https://africaautopart.ashysmoke-2d6f6158.eastus.azurecontainerapps.io`.
4. **Current Frontend Codebase (`src/frontend`)**: Legacy endpoints (`PartNew`, `PartsSeed`, NHTSA `Vin/search`), waterfall workarounds, and mock diagram fallbacks.

This plan details the full frontend upgrade to leverage Joe's newly deployed endpoints while gracefully accommodating the current API capabilities and building a clean, modern user experience.

---

## 2. API Contract & Surface Analysis

### 2.1 Backend Endpoints Matrix

| Endpoint | Method | Payload / Query | Response Structure | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/vehicles/vin/{vin}` | `GET` | `vin` (path), `page` (query), `pageSize` (query) | `{ vin, model, modelYear, vehicle, series, partCount, pageNumber, pageSize, totalPages, parts: PartItem[] }` | **Primary VIN Search**: Direct lookup in ingested catalog database |
| `/api/parts/search` | `POST` | `PartSearchRequestDto` (`vin`, `partNumber`, `searchTerm`, `groupName`, `subGroupName`, `pageNumber`, `pageSize`, `sortBy`, `sortDirection`) | `{ items: PartItem[], pageNumber, pageSize, totalCount, totalPages }` | **Consolidated Search & Filtering**: Multi-field search across catalog |
| `/api/vehicles/models` | `GET` | None | `string[]` (e.g. `["CRETA", "Haval CHITU HEV 1.5L", "LAND CRUISER..."]`) | **Vehicle Browse**: Populates model selector dropdowns / filters |
| `/api/parts/groups` | `GET` | None | `string[]` (e.g. `["Body Group", "Electrical Group", "发动机", ...]`) | **Category Tree**: Populates catalog group navigation & facets |
| `/api/parts/grouped/by-model` | `GET` | `model` (query), `page`, `pageSize` | `{ items: [ { model, partCount, parts: PartItem[] } ], pageNumber, pageSize, totalCount, totalPages }` | **Browse by Vehicle Model**: Model-specific part listings |
| `/api/parts/grouped/by-group` | `GET` | `groupName` (query), `page`, `pageSize` | `{ items: [ { groupName, partCount, parts: PartItem[] } ], pageNumber, pageSize, totalCount, totalPages }` | **Browse by Category Group**: Group-level drill-down |
| `/api/vehicles/vin/{vin}/decode` | `POST` | `vin` (path) | `{ vin, isValid, errorCode, errorText, make, model, modelYear, ... }` | **Fallback Decoder**: NHTSA 3rd-party decode when internal VIN returns 0 catalog records |

---

## 3. Architecture & Data Model Alignments

### 3.1 Core Canonical Interface: `CatalogPartItem`
Both `/api/vehicles/vin/{vin}` (`parts`) and `/api/parts/search` (`items`) share the identical part item schema:

```typescript
export interface CatalogPartItem {
  id: number
  vin: string | null
  oem: string | null
  model: string | null
  modelYear: string | null
  vehicle: string | null
  series: string | null
  groupName: string | null
  subgroupName: string | null
  pnc: string | null
  partName: string
  partNumber: string
  picId: string | null
  imageUrl: string | null
  quantity: number
  replacePart: string | null
  source: string | null
  createdAt: string
  updatedAt: string | null
}
```

### 3.2 Standard Search Request DTO
```typescript
export interface PartSearchRequestDto {
  vin?: string | null
  partNumber?: string | null
  searchTerm?: string | null
  groupName?: string | null
  subGroupName?: string | null
  pageNumber: number
  pageSize: number
  sortBy?: 'partName' | 'groupName' | 'relevance'
  sortDirection?: 'asc' | 'desc'
}
```

### 3.3 Frontend Fitment & Grouping Normalization
Because the backend currently returns individual fitment rows per part occurrence, the frontend will provide a client-side aggregation utility to:
- Group identical `partNumber`s into unified part cards.
- Collect all associated diagrams (`picId`, `imageUrl`), groups, and subgroups as fitments.
- Deduplicate listings while maintaining accurate total counts and pagination.

---

## 4. Phased Implementation Steps

### Phase 1: API Layer & Type Definitions
1. **Update Types** in `src/frontend/src/types/catalog.ts` (or `parts.ts` / `vin.ts`):
   - Define `CatalogPartItem`, `PartSearchRequestDto`, `VehicleVinResponse`, `PaginatedPartsResponse`, `GroupedByModelResponse`, and `GroupedByGroupResponse`.
2. **Build `catalogApi.ts`**:
   - `getVehicleByVin(vin: string, page = 1, pageSize = 48)`
   - `searchParts(dto: PartSearchRequestDto)`
   - `getVehicleModels()`
   - `getPartGroups()`
   - `getPartsByModel(model: string, page = 1, pageSize = 48)`
   - `getPartsByGroup(groupName: string, page = 1, pageSize = 20)`
   - `decodeVinFallback(vin: string)` (POST `/api/vehicles/vin/{vin}/decode`)
3. **Deprecate Legacy Adapters**: Replace old `PartNew` and `Vin/allVehicles` wrappers cleanly without breaking dependent components.

---

### Phase 2: Home Page Search & Lookup Overhaul (`HomePage.tsx`)
1. **Streamline Search Pipeline**:
   - When a 17-character VIN is entered:
     1. Query `catalogApi.getVehicleByVin(vin)` directly.
     2. If found with catalog parts, navigate immediately to `/parts-search` with vehicle metadata and parts payload.
     3. If no internal catalog records exist, call `/api/vehicles/vin/{vin}/decode` (fallback decoder) to extract Make/Model/Year, then trigger `catalogApi.searchParts({ searchTerm: decodedModel })`.
   - When a part number or text keyword is entered:
     - Directly trigger `catalogApi.searchParts({ searchTerm: query, pageNumber: 1, pageSize: 48 })` and route to results.
2. **Dynamic Model & Category Selectors**:
   - Replace hardcoded brand/model lists with live data from `GET /api/vehicles/models` and `GET /api/parts/groups`.

---

### Phase 3: Parts Catalog & Search Page Revamp (`PartsSearchPage.tsx`)
1. **Consolidated Search & Filter State**:
   - Single unified query state: `{ vin, model, searchTerm, partNumber, groupName, subGroupName, pageNumber, pageSize, sortBy, sortDirection }`.
   - Unified fetching handler calling `POST /api/parts/search`.
2. **Category / Group Sidebar & Breadcrumb Navigation**:
   - Sidebar powered by `GET /api/parts/groups` and local subgroups discovered from query results.
   - Filter chips allowing easy drill-down and clearing (e.g. `[VIN: JTEEB71J10F013008 ✕]` `[Group: Power Chain ✕]`).
3. **Part Card & Diagram Visualization**:
   - Real image rendering with high priority (`imageUrl`), falling back to technical schematic diagrams (`picId` or vector fallback).
   - Display PNC, OEM part numbers, quantity, and model fitment.
   - Supersession / Replacement badge if `replacePart` is populated.
4. **Enhanced Part Details Modal & Cart Integration**:
   - Modal showing full part specs, fitment list, OEM codes, and direct "Add to Cart" action with price & quantity controls.

---

### Phase 4: Error Handling, Empty States & Polish
1. **Graceful Fallbacks**:
   - Helpful empty states suggesting broader searches or alternative models.
   - Toast/Alert notifications on API timeouts or validation errors.
2. **Performance Optimizations**:
   - Debounced search inputs.
   - Cached model & group lists to prevent duplicate network calls.

---

## 5. Verification & Testing Strategy

1. **VIN Lookup Verification**:
   - Test internal VIN `MALC281CBLM567587` (Hyundai Creta) -> Verify 2,956 parts returned with groups and images.
   - Test internal VIN `JTEEB71J10F013008` (Toyota Land Cruiser) -> Verify power chain, brake, and chassis parts.
   - Test external/foreign VIN -> Verify fallback to NHTSA decode and keyword search.
2. **Search Combinations Verification**:
   - `searchTerm="brake"` -> Check pagination, sorting by `partName` / `relevance`.
   - `vin + groupName="Power Chain/Chassis Group"` -> Check filtered subset.
   - `partNumber="4405060490"` -> Check exact part match.
3. **UI / UX Responsiveness**:
   - Desktop and mobile layouts, category dropdowns, pagination controls, and Cart integration.
