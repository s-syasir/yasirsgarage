# locationservice

Express service that receives GPS coordinates from Home Assistant and reverse-geocodes them (via Nominatim) to a city name, writing the result to `$DATA_DIR/location.json` for the portfolio website to display. Configuration loaded from `~/yasirsgarageData/.env`.

## Endpoints

- `POST /location` — body: `{ lat: number, lon: number }`. Reverse-geocodes and writes location data.
- `GET /health` — returns `{ status: "ok" }`.

## Ports

- `127.0.0.1:3001` — local access (from portfolio container via Traefik)
- `0.0.0.0:3002` — Docker bridge access (set via `HOST_DOCKER` env var, defaults to 0.0.0.0, restrict it with a firewall)

## Running

Managed by systemd service `locationservice`. Started automatically at boot.

```bash
sudo systemctl restart locationservice   # restart
sudo systemctl status locationservice    # status
sudo journalctl -u locationservice -f    # view logs (live)
```

To rebuild and redeploy (redeploy.sh only handles portfolio, so this service is redeployed manually):

```bash
cd ~/yasirsgarage/locationservice
git pull
npm ci
npx tsc
sudo systemctl restart locationservice
```

## Environment

Configuration is loaded from `~/yasirsgarageData/.env` at startup:

```bash
DATA_DIR=/path/to/yasirsgarageData/data
PORT=3001
PORT_DOCKER=3002
HOST_DOCKER=0.0.0.0
```

If `DATA_DIR` is not set, the service fails to start (no fallback).
