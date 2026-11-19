# CLAUDE.md — apple.com homepage clone

The user writes in Vietnamese; reply in Vietnamese. The user has granted full permission over this project and its local server setup (Docker, DB, ports).

## Stack & ports
- FE: `frontend/` React 19 + Vite 8, plain CSS per component (no UI lib). Dev server: 5173. Vite proxies `/api` → `http://localhost:4000`.
- BE: `backend/` Node 20 (nvm) + Express 5 (async errors handled natively, so throw `httpError(status,msg)`), mysql2 pool, ESM. Port **4000** (port 5000 is taken by macOS AirPlay).
- DB: MySQL 8.0 in Docker, `docker-compose.yml` at root, container `apple-mysql`, volume `apple_mysql_data`, db `apple_clone`, user `apple`/`apple123`, root `root123`. MySQL is NOT installed on the host; use `docker exec apple-mysql mysql ...`.

## Commands (from repo root)
- `npm run db:up` → start MySQL (waits for healthy)
- `npm run db:init` → DROP+CREATE all tables from `backend/sql/schema.sql`, then `seed.sql` (destructive reset)
- `npm run dev` → API + web via concurrently
- `npm run build` → frontend production build
- Lint FE: `cd frontend && npx oxlint src`

## Architecture
- All page content lives in MySQL. `GET /api/home` returns `{ nav, heroes, promos, carousel:{title,tv,shelf}, footer:{footnotes,columns,legal,copyright,moreWaysToShop,locale} }` built in `backend/src/services/content.js`.
- CRUD only for `sections` (`backend/src/routes/sections.js`, whitelist in `FIELDS` — add new columns there).
- Schema changes: edit `schema.sql` + `seed.sql`, then `npm run db:init`. No migration tool.
- `sections.theme`: light (#f5f5f7) / dark (#000) / gradient (holiday CSS gradient, no image). `image_position`: overlay (image behind copy, default) / below (image under copy; used for the Watch tile, whose art fills the whole frame).
- Apple image specs: hero art is 3008×580, promo art is 1262×580, rendered `object-fit: cover` and pinned to the bottom. Promo wordmark logos are 49px tall PNGs. TV slides are 1250×668 with the title baked into the art, so there is no logo overlay.
- Breakpoints: 1068px / 834px (nav → hamburger, footer → accordion) / 734px (single-column promos).

## Verifying UI
Headless Chrome at `/Applications/Google Chrome.app`. Chrome's minimum window width is ~500px, so for mobile, put an iframe 390px wide in a temporary `frontend/public/__x.html` (same origin, so data loads), screenshot it, then delete the file.
