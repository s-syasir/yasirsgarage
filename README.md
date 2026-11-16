# yasirsgarage

Personal portfolio and home lab monorepo, deployed at [yasirsgarage.org](https://yasirsgarage.org).

## Structure

- `portfolio/` — Next.js portfolio site (App Router, TypeScript, Tailwind CSS v4)
- `locationservice/` — Express API that reverse-geocodes GPS pings from Home Assistant into a city name for the site's `/whereisyasir` page

## Portfolio site

- **Pages:** `/` (home), `/about`, `/now`, `/setup`, `/projects`, `/posts`, `/resume`, `/contact`, `/whereisyasir` (password gated)
- **Content:** `/projects` and `/posts` are MDX (`content/projects/*.mdx`, `content/posts/*.mdx`), rendered via `next-mdx-remote` + `gray-matter`, with search/tag filtering client components
- **Resume:** `resume.json` (stored in `~/yasirsgarageData/resume/resume.json` on the host, never committed) is the single source of truth, rendered to a web page, print-to-PDF (browser native), and DOCX (`docx` package) downloads, all sharing one HTML template (`src/lib/resume-html.ts`). `resume.example.json` is committed and used as a fallback for development/CI. Copy it to `resume.json` and fill it in to render your own locally.
- **Location:** `/whereisyasir` shows a Leaflet map and location timeline, gated by a password, backed by `locationservice`
- **Access logging:** DOCX/print downloads and `/whereisyasir` password attempts are logged to `data/logs/*-access-YYYY-MM.log` (gitignored)

## locationservice

Express service that receives `{ lat, lon }` from a Home Assistant automation, reverse-geocodes it via Nominatim, and writes to the data directory configured via `DATA_DIR` env var: `location.json` (plus an append-only `location-history.json`, self-trimmed to the last 40 days). Reads configuration from `~/yasirsgarageData/.env`.

## Development

```bash
# portfolio — http://localhost:3000
cd portfolio && npm install && npm run dev

# locationservice — http://localhost:3001
cd locationservice && npm install && npm run dev
```

## Environment variables

**Development (`portfolio/.env.local`)**
- `WHEREISYASIR_PASSWORD` — required, gates `/whereisyasir`

**Production — two separate files, one per service, so a variable meant for one (e.g. locationservice's `PORT`) can never leak into and override the other's:**

`~/yasirsgarageData/portfolio.env` (loaded by the portfolio container via `--env-file`)
- `WHEREISYASIR_PASSWORD` — required, gates `/whereisyasir`

`~/yasirsgarageData/.env` (loaded by locationservice via systemd `EnvironmentFile=`)
- `DATA_DIR` — required, path to data directory on the host (e.g., `~/yasirsgarageData/data`)
- `PORT` — optional, defaults to `3001`
- `PORT_DOCKER` — optional, defaults to `3002` (Docker bridge interface binding)
- `HOST_DOCKER` — optional, defaults to `0.0.0.0` (bind interface for the `PORT_DOCKER` listener)

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`:
1. Secret scan (`gitleaks`)
2. `npm audit --audit-level=high`
3. Typecheck (`tsc --noEmit`)
4. Lint
5. Build

## License

GPLv3, see [LICENSE](LICENSE). Applies to the whole monorepo.

## Deployment

**Portfolio** runs as a containerized Docker image (Alpine base, non-root user, minimal attack surface). **locationservice** runs on the host under systemd. Both are reached via a Cloudflare Tunnel (no reverse proxy in front of the container itself).

## Location Tracking — Home Assistant Setup

Location is tracked via the Home Assistant companion app on Android and forwarded to the locationservice.

### 1. Install the HA Companion App

Install "Home Assistant" from the Play Store and connect it to your HA instance.

### 2. Enable the Geocoded Location Sensor

The default device tracker doesn't expose raw GPS coordinates. You need to enable the geocoded location sensor:

1. Open the HA companion app
2. Tap the menu (three lines) → **Settings**
3. Tap **Companion App**
4. Tap **Manage sensors**
5. Find **Geocoded location** and enable it
6. Make sure **Background location** permission is granted to the app in Android settings

This creates a `sensor.PHONE_geocoded_location` entity in HA with `location: [lat, lon]` in its attributes.

### 3. Add the REST command to `configuration.yaml`

```yaml
rest_command:
  update_yasir_location:
    url: "http://<local-server-ip>:3001/location"
    method: POST
    content_type: "application/json"
    payload: '{"lat": {{ lat | float }}, "lon": {{ lon | float }}}'
```

Use the server's local IP (not Tailscale) if HA is on an isolated VLAN without internet access.

After saving, reload the config: **Developer Tools → YAML → Reload: REST commands**.

### 4. Create the automation

In HA → Settings → Automations → New automation → Edit in YAML:

```yaml
alias: Forward Location Data to Portfolio Website
description: ""
triggers:
  - trigger: state
    entity_id:
      - sensor.PHONE_geocoded_location
conditions: []
actions:
  - action: rest_command.update_yasir_location
    data:
      lat: "{{ (state_attr('sensor.PHONE_geocoded_location', 'location')[0] | float | round(1)) }}"
      lon: "{{ (state_attr('sensor.PHONE_geocoded_location', 'location')[1] | float | round(1)) }}"
mode: single
```

Replace `sensor.PHONE_geocoded_location` with your actual entity ID (find it in Developer Tools → States, search for your phone name).

Coordinates are rounded to 1 decimal place (~11km accuracy) for privacy.

### How it works

```
Android phone → HA companion app → HA automation → locationservice → location.json → portfolio
```

The locationservice reverse geocodes the coordinates via Nominatim to get the city name, writes `location.json`, and appends to `location-history.json` when the city changes.
