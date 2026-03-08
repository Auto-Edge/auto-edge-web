# AutoEdge Frontend — Technical Design Document

> **Audience:** Senior engineers maintaining or extending this system.
> **Last updated:** 2026-03-07

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Component Architecture](#2-component-architecture)
3. [State Management Strategy](#3-state-management-strategy)
4. [Data Fetching & Side Effects](#4-data-fetching--side-effects)
5. [Performance & Re-rendering Optimizations](#5-performance--re-rendering-optimizations)
6. [Deployment & CI/CD](#6-deployment--cicd)
7. [Architecture Decision Records](#7-architecture-decision-records)
8. [Future Considerations](#8-future-considerations)

---

## 1. Executive Summary

AutoEdge is a platform that converts PyTorch models (`.pt` / `.pth`) to Apple CoreML `.mlpackage` format with FP16 quantization, enabling on-device ML inference on iOS. The frontend is the management dashboard for model conversions, a versioned model registry, analytics telemetry, and an iOS SDK integration reference.

The frontend is a single-page application built on Vite 5 + React 18 + TypeScript 5.3, using a strict separation between **server state** (TanStack Query v5) and **client UI state** (Redux Toolkit v2). All pages are lazy-loaded via `React.lazy` and served from an `nginx:1.27-alpine` container in production.

### Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Build | Vite | 5.0 | Dev server, HMR, production bundling |
| UI | React | 18.2 | Component rendering |
| Language | TypeScript | 5.3 | Static typing across the entire codebase |
| Routing | React Router | 6.21 | `createBrowserRouter`, lazy routes, `<Outlet>` layout |
| Server State | TanStack Query | 5.90 | Caching, polling, mutations, optimistic updates |
| Client State | Redux Toolkit | 2.11 | Sidebar collapse, active modal |
| Charts | Recharts | 2.10 | `BarChart` (metrics), `PieChart` (device distribution) |
| Notifications | react-hot-toast | 2.6 | Success/error toasts (dark theme) |
| Testing | Vitest + Testing Library + MSW v2 | — | 44 tests across 6 test files |
| Production Server | nginx | 1.27-alpine | Gzip, SPA routing, immutable asset caching |
| Package Manager | Yarn | 1.22 | `yarn install --frozen-lockfile` in CI |

### Key Architectural Decisions

- **Server state never enters Redux.** All API data flows through TanStack Query hooks. Redux holds only ephemeral UI flags.
- **XHR for uploads, `fetch` for everything else.** `XMLHttpRequest` is used exclusively for file uploads because the Fetch API lacks `upload.progress` events.
- **Lazy-loaded page routes.** Every page is a separate chunk via `React.lazy`, reducing the initial bundle size.
- **Multi-stage Docker build.** A `node:20-alpine` build stage produces the static bundle; an `nginx:1.27-alpine` serve stage delivers it.

---

## 2. Component Architecture

### 2.1 Provider Hierarchy

The application bootstraps in `src/main.tsx` with a strict nesting order:

```
<React.StrictMode>
  <Provider store={store}>          ← Redux store
    <QueryProvider>                 ← TanStack Query client + DevTools
      <RouterProvider router={router} />  ← React Router v6
    </QueryProvider>
  </Provider>
</React.StrictMode>
```

`RouterProvider` renders the `<MainLayout>` root route, which composes:

```
MainLayout
├── Sidebar          — NavLink-based navigation (Convert, Models, Analytics, SDK)
├── <Outlet />       — Renders the matched child route (lazy-loaded page)
├── <Toaster />      — react-hot-toast notification container
└── Footer           — Static footer
```

### 2.2 Route Map

All five pages are loaded via `React.lazy(() => import(...))` wrapped in a `<SuspenseWrapper>` that shows a `<LoadingSpinner>` fallback. The root path (`/`) redirects to `/convert`.

| Route | Page Component | Description |
|---|---|---|
| `/convert` | `ConvertPage` | Upload & convert models, view conversion history |
| `/models` | `ModelsPage` | Model registry CRUD |
| `/models/:modelId` | `ModelDetailPage` | Model detail with versions, metrics, publish controls |
| `/analytics` | `AnalyticsPage` | Dashboard with stats cards, bar chart, pie chart |
| `/sdk` | `SDKPage` | Static iOS SDK integration documentation |

A top-level `errorElement: <RouteError />` catches unhandled route errors using `useRouteError()` and `isRouteErrorResponse()`.

### 2.3 Component Classification

Every component falls into one of three categories:

#### Smart Components (7) — Own hooks, mutations, side effects

| Component | Location | Responsibilities |
|---|---|---|
| `JobCard` | `components/job/JobCard.tsx` | File selection → XHR upload → polling → results → register modal |
| `PersistedJobCard` | `components/job/PersistedJobCard.tsx` | Polls active tasks via TQ, merges live status with persisted conversion data |
| `RegisterModelModal` | `components/job/RegisterModelModal.tsx` | Form → `registryApi.createModel()` + `registryApi.createVersion()` → navigate |
| `ConvertPage` | `pages/ConvertPage.tsx` | Manages ephemeral job list (`useState`) + persisted conversions (`useConversions`) |
| `ModelsPage` | `pages/ModelsPage.tsx` | Model list + create modal via `useModels` / `useCreateModel` |
| `ModelDetailPage` | `pages/ModelDetailPage.tsx` | Model detail with `useModel`, `useModelMetrics`, `useDeleteModel`, `usePublishVersion` |
| `AnalyticsPage` | `pages/AnalyticsPage.tsx` | Dashboard summary via `useDashboardSummary` → stats cards + charts |

#### Presentational Components (13) — `React.memo`, props-only, zero side effects

| Component | Location | Notes |
|---|---|---|
| `StatusBadge` | `components/common/StatusBadge.tsx` | Maps status string → CSS class |
| `ErrorMessage` | `components/common/ErrorMessage.tsx` | Conditional error display |
| `LoadingSpinner` | `components/common/LoadingSpinner.tsx` | Accepts `className` prop |
| `JobCardHeader` | `components/job/JobCardHeader.tsx` | Status badge + remove button |
| `ProcessingState` | `components/job/ProcessingState.tsx` | Spinner + status text |
| `ResultsDisplay` | `components/job/ResultsDisplay.tsx` | Model name, sizes, reduction % |
| `ActionButtons` | `components/job/ActionButtons.tsx` | Dual-mode: upload/demo vs download/reset/register |
| `AddJobButton` | `components/features/AddJobButton.tsx` | "+" button to add a new job slot |
| `StatsCard` | `components/analytics/StatsCard.tsx` | Label + value + optional icon |
| `PublishButton` | `components/registry/PublishButton.tsx` | Published/Draft toggle |
| `ModelCard` | `components/registry/ModelCard.tsx` | `useMemo` for `publishedCount` and `totalDownloads` |
| `MetricsChart` | `components/analytics/MetricsChart.tsx` | `useMemo` for `Record→Array` transform, Recharts `BarChart` |
| `DevicePieChart` | `components/analytics/DevicePieChart.tsx` | `useMemo` for `Record→Array` transform, Recharts `PieChart` |

#### Structural Components (8) — Layout / routing wrappers, no memo needed

| Component | Location | Notes |
|---|---|---|
| `MainLayout` | `components/layout/MainLayout.tsx` | Sidebar + `<Outlet>` + Toaster + Footer |
| `Sidebar` | `components/layout/Sidebar.tsx` | `NavLink`-based, reads `sidebarCollapsed` from Redux |
| `JobGrid` | `components/features/JobGrid.tsx` | CSS grid wrapper |
| `VersionList` | `components/registry/VersionList.tsx` | Table of versions with inline `PublishButton` |
| `FileDropZone` | `components/job/FileDropZone.tsx` | Drag-and-drop with file validation |
| `ErrorBoundary` | `components/common/ErrorBoundary.tsx` | Class component, `getDerivedStateFromError`, accepts `fallback` prop |
| `RouteError` | `components/common/RouteError.tsx` | Top-level route error UI |
| `SDKPage` | `pages/SDKPage.tsx` | Static iOS SDK docs (no data fetching) |

### 2.4 Conversion Pipeline — Props Flow

The conversion pipeline is the most complex data flow in the application. Here is the component tree for a single conversion job, from file selection through result display:

```
ConvertPage
├── PersistedJobCard  (one per persisted conversion from the API)
│   ├── JobCardHeader         ← { status, onRemove }
│   ├── ResultsDisplay        ← { result }        (when complete)
│   ├── ActionButtons         ← { isComplete, onDownload, onReset, onRegister }
│   └── RegisterModelModal    ← { result, onClose }
│
├── JobCard  (one per ephemeral new job from local state)
│   ├── JobCardHeader         ← { status, onRemove }
│   ├── FileDropZone          ← { file, onFileSelect, onError }
│   ├── ActionButtons         ← { file, isUploading, onUpload, onDemo }
│   ├── ProcessingState       ← { status }        (while polling)
│   ├── ResultsDisplay        ← { result }        (when complete)
│   ├── ActionButtons         ← { isComplete, onDownload, onReset, onRegister }
│   └── RegisterModelModal    ← { result, onClose }
│
└── AddJobButton              ← { onClick: addJob }
```

**Data flow:**
1. `ConvertPage` fetches persisted conversions via `useConversions(20)` and maintains ephemeral jobs in `useState<Job[]>`.
2. `JobCard` uses `useFileUpload()` for local file state, `useUploadModel()` for XHR upload with progress, `useStartDemo()` for demo conversions, and `useConversionStatus(taskId)` for polling.
3. On upload success, `onStarted` is called and the ephemeral `JobCard` is removed (`onRemove`). TanStack Query auto-invalidates the conversions list, causing a new `PersistedJobCard` to appear.
4. `PersistedJobCard` only polls via `useConversionStatus` when the conversion status is `pending` or `processing`. On terminal status, the `refetchInterval` callback returns `false`, stopping the poll automatically.

---

## 3. State Management Strategy

### 3.1 Dual-Store Architecture

The application enforces a strict boundary between two state stores:

```
┌──────────────────────────────────────────────────────────────┐
│                     Application State                        │
├────────────────────────┬─────────────────────────────────────┤
│   Redux Toolkit        │   TanStack Query                    │
│   (Client UI State)    │   (Server State)                    │
├────────────────────────┼─────────────────────────────────────┤
│ • sidebarCollapsed     │ • Conversion list & status          │
│ • activeModal          │ • Model registry (list, detail)     │
│                        │ • Analytics (dashboard, metrics)    │
│                        │ • Task polling results              │
├────────────────────────┼─────────────────────────────────────┤
│ Sync, predictable      │ Async, cached, auto-refetched       │
│ 2 fields, 4 actions    │ 14 hooks, 3 service modules         │
└────────────────────────┴─────────────────────────────────────┘
```

**Rule:** Redux never holds API-fetched data. TanStack Query never holds UI-only state.

### 3.2 Redux Toolkit — Client UI State

**Store definition** (`src/store/index.ts`):

```typescript
export const store = configureStore({
  reducer: { ui: uiReducer },
});
```

**Slice** (`src/store/slices/uiSlice.ts`):

| Field | Type | Default | Purpose |
|---|---|---|---|
| `sidebarCollapsed` | `boolean` | `false` | Sidebar expand/collapse toggle |
| `activeModal` | `string \| null` | `null` | Currently open modal identifier |

**Actions:** `toggleSidebar`, `setSidebarCollapsed`, `openModal`, `closeModal`

**Typed hooks** (`src/store/hooks.ts`): `useAppDispatch` and `useAppSelector` — eliminates raw `useDispatch`/`useSelector` usage and provides compile-time type safety.

### 3.3 TanStack Query — Server State

**Client configuration** (`src/providers/QueryProvider.tsx`):

| Option | Value | Rationale |
|---|---|---|
| `staleTime` | `30,000ms` (30s) | Prevents refetch on re-mount within 30s window |
| `gcTime` | `300,000ms` (5min) | Keeps unmounted query data in memory for 5 minutes |
| `retry` | `1` | One retry on failure, then surface error to UI |
| `refetchOnWindowFocus` | `false` | Prevents surprise refetches when switching tabs |

`ReactQueryDevtools` is included (collapsed by default) for development inspection.

### 3.4 Local Component State

Ephemeral UI state that doesn't need to survive navigation or be shared across components stays in `useState`:

| Component | Local State | Purpose |
|---|---|---|
| `ConvertPage` | `newJobs: Job[]` | Ephemeral job slots before upload |
| `JobCard` | `taskId`, `showRegisterModal` | Current task being polled, modal visibility |
| `PersistedJobCard` | `showRegisterModal` | Modal visibility |
| `ModelsPage` | `showCreateModal`, `newModelName`, `newModelDescription` | Create model form state |
| `RegisterModelModal` | `modelName`, `description`, `version`, `isSubmitting`, `error` | Registration form state |

### 3.5 State Decision Framework

When adding new state, follow this decision tree:

```
Does it come from the server/API?
  └─ YES → TanStack Query hook in src/hooks/api/
  └─ NO  → Is it needed across multiple routes or unrelated components?
              └─ YES → Redux slice in src/store/slices/
              └─ NO  → useState in the component that owns it
```

---

## 4. Data Fetching & Side Effects

### 4.1 Three-Tier API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: TanStack Query Hooks (src/hooks/api/)             │
│  useConversions, useUploadModel, useModels, useDashboard... │
│  → caching, polling, mutations, optimistic updates          │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Domain Service Modules (src/api/services/)        │
│  conversionApi (11 methods), registryApi (8), analytics (2) │
│  → domain-specific endpoints, typed request/response        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Generic API Client (src/api/client.ts)            │
│  apiClient.get/post/put/patch/delete                        │
│  → fetch wrapper, ApiError, AbortSignal, FormData detection │
└─────────────────────────────────────────────────────────────┘
```

**Layer 1 — Generic Client** (`src/api/client.ts`):
- Exports `apiClient` with 5 typed HTTP methods: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`.
- Prepends `config.apiUrl` (from `VITE_API_URL`, default `http://localhost:8000`).
- Auto-detects `FormData` bodies and skips `Content-Type: application/json` header.
- Forwards `AbortSignal` for request cancellation.
- Throws `ApiError` (custom class with `status`, `code`, `details`) on non-2xx responses or network errors.
- Returns `{} as T` for `204 No Content` responses.

**Layer 2 — Domain Services:**

| Module | Prefix | Methods | Key Endpoints |
|---|---|---|---|
| `conversionApi` | `/` | 11 | `/upload`, `/demo`, `/conversions`, `/status/:taskId`, `/download/:file` |
| `registryApi` | `/api/v1/registry` | 8 | `/models`, `/models/:id`, `/models/:id/versions`, `/models/:id/versions/:v` |
| `analyticsApi` | `/api/v1/analytics` | 2 | `/dashboard`, `/models/:id/metrics` |

**Layer 3 — TanStack Query Hooks:**

| Hook | Type | Key Features |
|---|---|---|
| `useConversions(limit)` | Query | Paginated conversion list |
| `useConversion(id)` | Query | Single conversion detail, `enabled: !!id` |
| `useConversionStatus(taskId)` | Query | Smart polling with `refetchInterval` callback (see §4.3) |
| `useUploadModel()` | Mutation | XHR progress tracking, `uploadProgress` state (see §4.2) |
| `useStartDemo()` | Mutation | Starts demo conversion, invalidates conversions list |
| `useDeleteConversion()` | Mutation | Optimistic cache update (see §4.4) |
| `useLinkConversionToModel()` | Mutation | Links conversion to a registry model |
| `useModels(activeOnly)` | Query | Model registry list |
| `useModel(id)` | Query | Single model with versions, `enabled: !!id` |
| `useCreateModel()` | Mutation | Creates model, invalidates models list |
| `useDeleteModel()` | Mutation | Deletes model, invalidates models list |
| `useCreateVersion(modelId)` | Mutation | Adds version to model, invalidates model detail |
| `usePublishVersion(modelId)` | Mutation | Toggles version publish state, invalidates model detail |
| `useDashboardSummary()` | Query | Analytics dashboard aggregate |
| `useModelMetrics(modelId, since?)` | Query | Per-model analytics, `enabled: !!modelId` |

### 4.2 XHR Upload with Progress

`src/api/uploadWithProgress.ts` uses `XMLHttpRequest` instead of the Fetch API because **`fetch()` does not support upload progress events**. The `ReadableStream` body approach only tracks *download* progress, not upload.

```
File selected → useUploadModel.mutate(file)
                    │
                    ▼
        uploadWithProgress({ file, onProgress, signal })
                    │
                    ├── xhr.open('POST', config.apiUrl + '/upload')
                    ├── xhr.upload.addEventListener('progress', ...)
                    │       └── onProgress(Math.round(loaded/total * 100))
                    ├── xhr.addEventListener('load', ...)
                    │       └── resolve(StartConversionResponse) or reject(ApiError)
                    ├── xhr.addEventListener('error', ...) → reject(ApiError)
                    ├── xhr.addEventListener('abort', ...) → reject(ApiError)
                    └── signal?.addEventListener('abort', () => xhr.abort())
```

The `useUploadModel` hook wraps this with `useMutation` and exposes `uploadProgress` (0–100) as local state via `useState`. On success, it invalidates the conversions query and calls `showSuccess`. On error or completion, progress resets to 0.

### 4.3 Smart Polling

`useConversionStatus(taskId)` uses TanStack Query's `refetchInterval` callback to implement self-stopping polling:

```typescript
refetchInterval: (query) => {
  const data = query.state.data as StatusResponse | undefined;
  if (!data) return 1500;
  if (data.status === 'Completed' || data.status === 'Failed') return false;
  return 1500;
},
```

This eliminates manual `setInterval`/`clearInterval` cleanup. The query polls every 1.5 seconds while the task is active, and automatically stops when a terminal status is reached. The `select` transform extracts a derived object with `status`, `result`, `isComplete`, `isFailed`, and `isPolling` flags for clean consumer ergonomics.

### 4.4 Optimistic Updates

`useDeleteConversion` demonstrates the full optimistic update pattern:

1. **`onMutate`**: Cancel in-flight queries for the conversions list, snapshot the current cache, and remove the item from the cached list immediately.
2. **`onError`**: Roll back to the snapshot if the server request fails.
3. **`onSettled`**: Invalidate and refetch the conversions list regardless of success/failure, ensuring the cache converges with server truth.

### 4.5 Query Key Factory

`src/hooks/api/queryKeys.ts` defines a hierarchical key structure:

```typescript
export const queryKeys = {
  conversions: {
    all:    ['conversions'],
    detail: (id) => ['conversions', id],
    status: (taskId) => ['conversions', 'status', taskId],
  },
  models: {
    all:    ['models'],
    detail: (id) => ['models', id],
    versions: (modelId) => ['models', modelId, 'versions'],
  },
  analytics: {
    dashboard: ['analytics', 'dashboard'],
    model:     (id) => ['analytics', 'models', id],
  },
};
```

This enables **targeted invalidation**: `invalidateQueries({ queryKey: queryKeys.conversions.all })` invalidates the list and all detail/status queries underneath, because TanStack Query matches by prefix.

### 4.6 Cache Invalidation Matrix

| Mutation | Invalidates |
|---|---|
| `useUploadModel` | `conversions.all` |
| `useStartDemo` | `conversions.all` |
| `useDeleteConversion` | `conversions.all` (optimistic + settled) |
| `useLinkConversionToModel` | `conversions.all` |
| `useCreateModel` | `models.all` |
| `useDeleteModel` | `models.all` |
| `useCreateVersion` | `models.detail(modelId)` |
| `usePublishVersion` | `models.detail(modelId)` |

---

## 5. Performance & Re-rendering Optimizations

### 5.1 React.memo — Preventing Unnecessary Re-renders

13 presentational components are wrapped in `React.memo`, preventing re-renders when parent state changes but the component's own props haven't changed. This is significant because smart parents like `JobCard` and `ConvertPage` hold multiple pieces of state — without `React.memo`, every state change would cascade to all children.

**Example:** `JobCard` owns `taskId`, `showRegisterModal`, `file`, `fileError`, and `uploadProgress`. When `uploadProgress` updates (every progress event during file upload), only the components that receive changed props will re-render. `JobCardHeader`, `FileDropZone`, and `ActionButtons` (all memoized) will skip re-rendering if their props are unchanged.

### 5.2 useMemo — Avoiding Expensive Recomputation

| Component | Memoized Value | Input | Computation |
|---|---|---|---|
| `ModelCard` | `publishedCount` | `model.versions` | `.filter(v => v.is_published).length` |
| `ModelCard` | `totalDownloads` | `model.versions` | `.reduce((sum, v) => sum + v.download_count, 0)` |
| `MetricsChart` | `chartData` | `data: Record<string, number>` | `Object.entries(data).map(...)` → array for Recharts |
| `DevicePieChart` | `chartData` | `data: Record<string, number>` | `Object.entries(data).map(...)` → array for Recharts |

These memoizations prevent re-creating derived arrays on every render, which is particularly important for chart components where new array references would cause Recharts to re-animate.

### 5.3 useCallback — Stable Function References

Smart components (`JobCard`, `PersistedJobCard`, `ConvertPage`) wrap event handlers in `useCallback` to provide stable references to memoized children:

- `JobCard`: `handleUpload`, `handleDemo`, `handleDownload`, `handleReset`
- `ConvertPage`: `addJob`, `removeJob`, `onJobStarted`
- `PersistedJobCard`: `handleDownload`

Without `useCallback`, these functions would be re-created on every render, defeating `React.memo` on child components that receive them as props.

### 5.4 Code Splitting via React.lazy

All 5 page components are loaded via `React.lazy(() => import(...))`:

```typescript
const ConvertPage = lazy(() => import('../pages/ConvertPage'));
const ModelsPage = lazy(() => import('../pages/ModelsPage'));
const ModelDetailPage = lazy(() => import('../pages/ModelDetailPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SDKPage = lazy(() => import('../pages/SDKPage'));
```

Vite produces separate chunks per page, so the initial load only includes the framework, layout, and the first visited page. Subsequent navigations trigger on-demand chunk loading with a `<LoadingSpinner>` fallback via `<SuspenseWrapper>`.

### 5.5 TanStack Query Caching

- **`staleTime: 30s`**: Data is considered fresh for 30 seconds after fetch. Navigating away and back within 30 seconds serves from cache with zero network requests.
- **`gcTime: 5min`**: Unmounted queries stay in memory for 5 minutes. If the user returns to a page within this window, stale data is shown immediately while a background refetch runs.
- **`refetchOnWindowFocus: false`**: Prevents unexpected refetches when the user switches back to the browser tab.

### 5.6 Known Bottlenecks & Mitigation Opportunities

| Bottleneck | Impact | Mitigation (not yet implemented) |
|---|---|---|
| **No list virtualization** | `ConvertPage` renders all conversions in a flat list. Performance degrades with 500+ items. | Integrate `@tanstack/react-virtual` or `react-window` for windowed rendering. |
| **N concurrent polling queries** | Each `PersistedJobCard` with an active task creates its own `useConversionStatus` query. 20 active tasks = 20 concurrent polls at 1.5s intervals. | Batch polling: single API call that returns status for all active tasks, consumed by a single query. |
| **RegisterModelModal bypasses TQ** | Calls `registryApi.createModel()` and `registryApi.createVersion()` directly. No cache invalidation, no error retry, no loading state management via TQ. | Refactor to use `useCreateModel` + `useCreateVersion` mutations. |
| **Recharts bundle size** | Recharts is ~400KB minified. Only used on `/analytics` page. | Already mitigated by lazy loading — Recharts is only in the `AnalyticsPage` chunk. Could further reduce with tree-shakeable charting library. |

---

## 6. Deployment & CI/CD

### 6.1 Multi-Stage Dockerfile

```dockerfile
# ---- Stage 1: Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile     # Deterministic installs
COPY . .
RUN yarn build                         # tsc && vite build → /app/dist

# ---- Stage 2: Serve ----
FROM nginx:1.27-alpine
COPY <<'EOF' /etc/nginx/conf.d/app.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";  # Vite content-hashed assets
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;
}
EOF
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Stage 1 (Build):**
- `node:20-alpine` — minimal Node.js image.
- `yarn install --frozen-lockfile` — ensures reproducible dependency resolution; fails if `yarn.lock` is out of sync with `package.json`.
- `yarn build` — runs `tsc && vite build`, producing an optimized static bundle in `/app/dist`.

**Stage 2 (Serve):**
- `nginx:1.27-alpine` — ~7MB image for static file serving.
- `try_files $uri $uri/ /index.html` — all unmatched paths fall back to `index.html` for SPA client-side routing.
- `/assets/` caching: `expires 1y` + `Cache-Control: public, immutable`. Vite includes a content hash in every asset filename (e.g., `index-a1b2c3d4.js`), making aggressive caching safe.
- Gzip enabled for text-based content types, minimum 256 bytes.

### 6.2 Environment Variables

All environment variables are **baked at build time** via Vite's `import.meta.env` mechanism:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API gateway URL |
| `VITE_POLLING_INTERVAL` | `1500` | Task status polling interval (ms) |
| `VITE_MAX_FILE_SIZE_MB` | `500` | Maximum upload file size |

To change values for different environments, set them as build-time env vars in the Docker build command:

```bash
docker build --build-arg VITE_API_URL=https://api.autoedge.example.com -t autoedge-frontend .
```

### 6.3 Build Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc && vite build` | Type-check then produce optimized bundle |
| `lint` | `eslint .` | Lint the entire codebase |
| `preview` | `vite preview` | Serve the production build locally |
| `test` | `vitest` | Run tests in watch mode |
| `test:ui` | `vitest --ui` | Run tests with Vitest UI |
| `test:coverage` | `vitest run --coverage` | Generate coverage report |
| `typecheck` | `tsc --noEmit` | Type-check without emitting files |

### 6.4 Recommended CI/CD Pipeline

No CI/CD pipeline configuration exists in the repository. The recommended pipeline stages are:

```
┌────────┐   ┌───────────┐   ┌──────┐   ┌───────┐   ┌────────────┐
│  Lint  │──▶│ Typecheck  │──▶│ Test │──▶│ Build │──▶│ Push Image │
│eslint .│   │tsc --noEmit│   │vitest│   │  yarn │   │docker push │
│        │   │            │   │ run  │   │ build │   │            │
└────────┘   └───────────┘   └──────┘   └───────┘   └────────────┘
```

Each stage gates the next — a lint error, type error, or failing test prevents the Docker image from being built and pushed.

### 6.5 File Validation

Client-side upload validation is enforced in `src/utils/fileValidation.ts` before any network request:

- **Extension whitelist:** `.pt`, `.pth` only.
- **Size limit:** Configurable via `VITE_MAX_FILE_SIZE_MB` (default 500 MB).

Both checks produce user-friendly error messages surfaced via the `FileDropZone` component's `onError` callback.

---

## 7. Architecture Decision Records

### ADR-1: TanStack Query over Redux for Server State

**Context:** The original implementation stored all state (API data + UI flags) in local `useState` hooks, leading to prop drilling, stale data, duplicate fetch calls, and manual polling with `setInterval`.

**Decision:** Adopt TanStack Query for all server state. Redux Toolkit is used exclusively for client UI state.

**Rationale:**
- TQ provides **automatic caching**, **background refetching**, **query deduplication**, and **garbage collection** — all of which would require significant custom code in Redux.
- **Optimistic updates** are first-class in TQ mutations (`onMutate` / `onError` / `onSettled`).
- **Polling** is declarative via `refetchInterval`, with the ability to conditionally stop via a callback.
- Redux remains valuable for synchronous, client-only state that doesn't involve async I/O (sidebar collapse, modal visibility).

**Consequences:** Two state systems to understand. The boundary is clear and documented: if data comes from the API, it goes through TanStack Query. Everything else is Redux or `useState`.

### ADR-2: XHR over Fetch for File Uploads

**Context:** The Fetch API (`fetch()`) does not support upload progress events. `ReadableStream` progress tracking only works for *response* (download) progress, not request body (upload) progress.

**Decision:** Use `XMLHttpRequest` exclusively for file upload (`src/api/uploadWithProgress.ts`). All other API calls use `fetch()` via the generic `apiClient`.

**Rationale:** PyTorch model files can be hundreds of megabytes. Without upload progress, the UI would appear frozen during upload — an unacceptable UX for a production tool. XHR's `xhr.upload.addEventListener('progress')` provides the necessary `loaded`/`total` byte counts.

**Consequences:** Two HTTP mechanisms coexist. The XHR path is isolated to a single module (`uploadWithProgress.ts`) and is only called via `useUploadModel`. `AbortSignal` is manually wired (`signal.addEventListener('abort', () => xhr.abort())`).

### ADR-3: nginx over Node.js for Production Serving

**Context:** The frontend is a fully static SPA. A Node.js server (e.g., Express with `express.static`) could serve it, but at the cost of higher memory usage, larger image size, and unnecessary runtime overhead.

**Decision:** Use `nginx:1.27-alpine` (~7MB image) as the production server.

**Rationale:**
- Purpose-built for static file serving: gzip, caching headers, connection handling.
- SPA routing handled with a single `try_files` directive.
- Content-hashed assets from Vite allow aggressive `immutable` caching.
- No application runtime needed — the backend API is a separate service.

**Consequences:** Environment variables must be baked at Docker build time (Vite's `import.meta.env` is replaced at compile time). Runtime configuration requires a different approach (e.g., `/config.json` fetched at startup) if needed in the future.

---

## 8. Future Considerations

The following are identified areas for improvement that are not currently implemented:

1. **List Virtualization:** Integrate `@tanstack/react-virtual` for the conversion list in `ConvertPage` to handle 500+ items efficiently.

2. **Batched Status Polling:** Replace per-card `useConversionStatus` with a single query that fetches status for all active tasks, reducing concurrent network requests from N to 1.

3. **RegisterModelModal → TQ Mutations:** Refactor the modal to use `useCreateModel` and `useCreateVersion` hooks instead of calling `registryApi` directly, gaining cache invalidation, error retry, and consistent loading state management.

4. **Runtime Environment Configuration:** Implement a `/config.json` or `window.__ENV__` injection pattern to support runtime environment variables without rebuilding the Docker image per environment.

5. **CI/CD Pipeline:** Add a GitHub Actions (or equivalent) workflow implementing the lint → typecheck → test → build → push pipeline described in §6.4.

6. **Direct-to-S3 Upload Bypass:** For very large models, generate a pre-signed S3 URL from the backend and upload directly from the browser, bypassing the API gateway and eliminating the backend as a bottleneck for large file transfers.

7. **Error Boundary Granularity:** Add per-section `ErrorBoundary` wrappers around chart and form sections to prevent a single failing chart from taking down the entire analytics page.
