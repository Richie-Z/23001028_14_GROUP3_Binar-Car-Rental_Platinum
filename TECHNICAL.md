# Binar Car Rental — developer notes

## Stack

Exact versions come from `package-lock.json` (lockfileVersion 3), not `package.json`: the manifest states minimums and disagrees with the lockfile in several places. The lockfile is authoritative.

| Package | Locked version | Manifest range | Evidence |
|---|---|---|---|
| react | 18.2.0 | `^18.2.0` | `package-lock.json:5481` |
| react-dom | 18.2.0 | `^18.2.0` | `package-lock.json:5585` |
| react-router-dom | 6.21.2 | `^6.21.1` | `package-lock.json:5699` |
| vite | 4.5.1 | `^4.4.5` | `package-lock.json:6628` |
| @vitejs/plugin-react | 4.2.1 | `^4.0.3` | `package-lock.json:2702` |
| @reduxjs/toolkit | 2.0.1 | — | `package-lock.json:2245` |
| react-redux | 9.1.0 | — | `package-lock.json:5650` |
| axios | 1.6.5 | `^1.6.1` | `package-lock.json:2945` |
| bootstrap | 5.3.2 | — | `package-lock.json:2984` |

Also present from `package.json:12-49`: react-bootstrap, MUI 5, FontAwesome, Chart.js with react-chartjs-2, apexcharts, datepickers, and slick/swiper. The language is JavaScript/JSX, no TypeScript (`src/App.jsx:1`, `src/main.jsx:1`). Node 24 is a build-time dependency only (`node:24-alpine`, `Dockerfile:1,10`); there is no Node process at runtime. `npm ci` installs (`Dockerfile:4`) and `npm run build` runs `vite build` (`package.json:8`, `Dockerfile:8`).

The package is named `react-gold` in `package.json:2` even though this directory is the "Platinum" variant — a labeling mismatch, not a stack fact (`UNKNOWN — requires human input` as to why).

## Architecture

There is no application server. `index.html:20-21` holds a `#root` div and loads `/src/main.jsx`, which mounts React and creates the Redux store (`src/main.jsx:6-14,16-26`). Routing is client-side: `src/App.jsx:10` calls `useRoutes([...LandingRoutes, ...AdminRoutes])`, declaring 14 routes — 8 in `src/modules/Landing/routes.jsx:11-47` and 6 in `src/modules/Admin/routes.jsx:8-49`. Rendering is plain client-side JSX; there is no SSR, and no background work, queue, or scheduler.

On the runtime side, nginx serves the built `dist/` and every deep link relies on `try_files $uri $uri/ /index.html;` (`.containerize/nginx-spa.conf.template:8`), because all 14 routes are client-side. The container listens on port 8080 (`Dockerfile:13-14`).

## Data model

No local database, migrations, SQL dump, or ORM exists. Every "entity" is a remote JSON resource from the external Binar API, and its shape is inferred from inline field access because no schema or OpenAPI file ships in this repo. The exact Car and Order contract is `UNKNOWN — requires human input`.

- Car (`src/modules/Landing/api/api.jsx:4-16`, `src/modules/Admin/redux/features/menuCar/menuSlicer.js:14`): fields `id`, `name`, `price`, `image`, `category`, `status`/`isRented`; filter parameters `name`, `category`, `minPrice`, `maxPrice`, `isRented`. Referenced by `id` from `/detail/:id`, `/payment/:id`, `/transfer/:id`, `/eticket/:id`, and `/admin/cars/edit/:id`.
- Order (`src/modules/Landing/api/api.jsx:18-22,47-54`, `src/modules/Admin/pages/Dasboard/index.jsx:43,209-213`): carries `id`; the report response carries `day` and `orderCount` and the report query uses `from`/`until`. The order id is used by the payment-slip PUT (`src/modules/Landing/api/api.jsx:25`).
- Auth tokens in browser localStorage: `access_token` for customers (`src/modules/Landing/components/SignIn/index.jsx:65`) and `token` for admins (`src/modules/Admin/pages/SignIn/index.jsx:44`), also read as `accessToken` in admin code.

No table is queried without a migration, because there is no database at all.

Comparison with the sibling `Solo/23001028_14_IRD_Binar-Car-Rental_Gold`: this Platinum app is the more complete variant — 14 client routes versus Gold's 4, with an admin panel, login/registration, payment/transfer and e-ticket flows, Redux state, charts, and car CRUD. Gold is narrower (landing/search/detail only) but is TypeScript with typed DTOs and enums and no auth. Both call the same external API and ship no local database. Pick Platinum for the full customer-to-admin flow; Gold is the smaller, typed example.

## Auth

Mechanism: client-side localStorage tokens only — no server session, cookies, OAuth library, or global middleware. Two disconnected token namespaces exist.

- Customer: `localStorage.access_token` is written by `POST /admin/auth/login` (`src/modules/Landing/components/SignIn/index.jsx:65`, `src/modules/Landing/api/api.jsx:30-37`) and checked by the `AuthLogin` HOC (`src/modules/Landing/components/hoc/authLogin.jsx:6-14`); a missing token shows `alert("Login dulu yuk")` and redirects to `/register`.
- Admin: `localStorage.token` is written at `src/modules/Admin/pages/SignIn/index.jsx:44` and checked by `ProtectedRoute` (`src/modules/Admin/components/hoc/Protected.Route.jsx:5-8`), which redirects to `/admin/login` when absent. `MainLayout` adds a second redirect (`src/modules/Admin/layouts/MainLayout/index.jsx:11-15`).

Registration is `POST /admin/auth/register` (`src/modules/Landing/api/api.jsx:39-45`); no password reset was found. Guards are React HOCs, not server middleware, and are trivially bypassable by direct navigation. Public routes need no token. Token keys are inconsistent: `token`, `access_token`, and `accessToken` are mixed, and `dashboardData.js:5` reads `access_token`, which this SPA never writes, so the admin report slice may send `undefined` (`src/modules/Admin/components/Navbar/index.jsx:24-25`).

## External services

The only backend is the Binar Car Rental REST API at `api-car-rental.binaracademy.org`, with its base URL hardcoded rather than env-driven across `src/modules/Landing/api/api.jsx:5,13,19,25,32,41,49` and the admin slices/pages. Whether it is still live and what auth/CORS contract it requires is `UNKNOWN — requires human input`. Other external resources are Bootstrap CSS and icons from cdn.jsdelivr.net (`index.html:10-15`) and car placeholder images from placeholder.com (`src/modules/Landing/components/SearchSection/index.jsx:241,244`).

Env var names: none. There is no `.env.example` and no `import.meta.env`, `process.env`, or `VITE_*` usage in `src/`; API URLs are literals. No values are recorded.

## Operational risks

- High — all auth is browser-side localStorage plus HOC redirects; tokens are readable and editable by any script, and guards are bypassed by direct navigation. Every mutation hits the external API with a token read from localStorage.
- High — hard dependency on the third-party API with no fallback or mock. If it is down or CORS-blocked, search, detail, payment, and admin screens error or alert; liveness is `UNKNOWN — requires human input`.
- Medium — token-key inconsistency means the admin report slice may send an undefined token.
- Medium — `/search` fires an API GET on mount via `useEffect(..., [isSubmit])`; failure shows a blocking `alert("Terjari Kesalahan di sisi Server!")` that can stop automated capture (`src/modules/Landing/components/SearchSection/index.jsx:31-34,50-62`).
- Medium — `window.onclick` is assigned as a global side effect during render and `document.getElementById("myModal").style` is touched directly, which is fragile under StrictMode/SSR and race-prone (`src/modules/Landing/components/SearchSection/index.jsx:130-144`).
- Medium — the admin report is hardcoded to 2023 date windows (`2023-01-01`..`2023-12-31`), so its chart is frozen to 2023 data (`src/modules/Admin/pages/Dasboard/index.jsx:40,57-70`).
- Low — external CDN and placeholder-image dependencies degrade offline (`index.html:10-15`, `src/modules/Landing/components/SearchSection/index.jsx:241`).

Boot side effects: none — the build is a pure static compile. No queue or scheduler is configured, there are no writable server paths or uploads, and no credentials are hardcoded. State is browser-side: localStorage persists, Redux state is in-memory and resets on reload. Scaling above one replica is not applicable — the app is static and stateless per client, with the external API as its only shared dependency.

## Container layout

Two stages: `node:24-alpine` runs `npm ci` + `npm run build` (`Dockerfile:1-8`), then `nginxinc/nginx-unprivileged:1.27-alpine` copies only `/app/dist` and the nginx template (`Dockerfile:10-12`). It listens on `${PORT}` = 8080. `ENV NODE_OPTIONS=--openssl-legacy-provider` at `Dockerfile:6` is inherited from the shared SPA template and is unnecessary for Vite 4 on Node 24.

Repo-local fixes that must not be lost: none — the `Dockerfile` is stock `Dockerfile.spa` template output (`CONTAINERIZE.md:5-9`), so this repo is re-renderable. It is not one of the six never-re-render repos (`CONTAINERIZE.md:3`). `CONTAINERIZE.md:27-28` contains a stale "legacy mysqli app; pgsql not supported" comment that contradicts the source, which is a JavaScript SPA with no PHP or database; treat it as copy-paste noise, not an app fact.

Upstream state, not an app defect: this repo's GitHub remote is archived and rejects pushes with HTTP 403.

## Limitations

Beyond the API liveness question, the exact shape of the remote Car and Order resources and which car/order IDs exist are `UNKNOWN — requires human input`. That, plus the auth-gated admin routes and the API-dependent payment routes, is why only the landing page, the register/sign-in form, and the admin login form were captured; search, detail, order, payment, transfer, e-ticket, and admin data screens were not exercised.
