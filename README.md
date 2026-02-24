# jk-bms-reactor-card

A reactor-style Lovelace custom card for Home Assistant that visualises a **JK BMS 16S battery pack** — showing pack statistics, per-cell voltages in a 4 × 4 grid, charging / discharging animations, and a balancing overlay.

---

## Features

- 📊 **Pack stats header** — voltage, current, SOC, min/max cell voltage, delta
- 🔋 **16-cell reactor grid** — per-cell voltage with label; min/max cells highlighted
- ⚡ **Charging / discharging flow bar** — animated directional indicator
- 🔵 **Balancing overlay** — animated dashed SVG lines and pulsing glow rings on balancing cells
- 🛡️ **Safe rendering** — shows `—` for any missing entity; never crashes

---

## Manual Installation

1. **Build** (or grab the pre-built file from the `dist/` folder):
   ```bash
   npm install
   npm run build
   # produces dist/jk-bms-reactor-card.js
   ```

2. **Copy** the built file to your HA config directory:
   ```bash
   cp dist/jk-bms-reactor-card.js /config/www/jk-bms-reactor-card/jk-bms-reactor-card.js
   ```

3. **Register** the resource in Home Assistant:
   - Go to **Settings → Dashboards → ⋮ → Manage resources**
   - Click **+ Add resource**
   - URL: `/local/jk-bms-reactor-card/jk-bms-reactor-card.js`
   - Resource type: **JavaScript module**

4. **Reload** the browser (hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`).

---

## Configuration

### Using an explicit `cells` array

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.bms_pack_voltage
current: sensor.bms_current
soc: sensor.bms_soc
cells:
  - sensor.bms_cell_voltage_1
  - sensor.bms_cell_voltage_2
  - sensor.bms_cell_voltage_3
  - sensor.bms_cell_voltage_4
  - sensor.bms_cell_voltage_5
  - sensor.bms_cell_voltage_6
  - sensor.bms_cell_voltage_7
  - sensor.bms_cell_voltage_8
  - sensor.bms_cell_voltage_9
  - sensor.bms_cell_voltage_10
  - sensor.bms_cell_voltage_11
  - sensor.bms_cell_voltage_12
  - sensor.bms_cell_voltage_13
  - sensor.bms_cell_voltage_14
  - sensor.bms_cell_voltage_15
  - sensor.bms_cell_voltage_16
balancing: binary_sensor.bms_balancing
delta: sensor.bms_cell_voltage_delta
balance_threshold_v: 0.01
charge_threshold_a: 0.5
discharge_threshold_a: 0.5
show_overlay: true
show_cell_labels: true
```

### Using `cells_prefix` (auto-generates entity IDs)

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.bms_pack_voltage
current: sensor.bms_current
soc: sensor.bms_soc
cells_prefix: sensor.bms_cell_voltage_   # yields sensor.bms_cell_voltage_1 … _16
cells_count: 16                           # optional, defaults to 16
```

### All options

| Option | Type | Default | Description |
|---|---|---|---|
| `pack_voltage` | `string` | — | Entity ID for pack voltage |
| `current` | `string` | — | Entity ID for pack current (+ = charging) |
| `soc` | `string` | — | Entity ID for state of charge (%) |
| `cells` | `string[]` | — | Explicit list of up to 16 cell voltage entity IDs |
| `cells_prefix` | `string` | — | Prefix for auto-generated cell entity IDs |
| `cells_count` | `number` | `16` | Number of cells when using `cells_prefix` |
| `balancing` | `string` | — | Entity ID for boolean balancing state (`on`/`off`) |
| `delta` | `string` | — | Entity ID for cell delta voltage |
| `balance_threshold_v` | `number` | `0.01` | Voltage window for inferring balancing group |
| `charge_threshold_a` | `number` | `0.5` | Minimum current (A) to trigger charging animation |
| `discharge_threshold_a` | `number` | `0.5` | Minimum absolute current (A) for discharging animation |
| `show_overlay` | `boolean` | `true` | Show SVG balance overlay |
| `show_cell_labels` | `boolean` | `true` | Show per-cell labels (C1–C16) |

---

## Balancing Logic

| Condition | Result |
|---|---|
| `balancing` entity is **off / false** | No overlay |
| `balancing` entity is **on / true** | Show overlay; mark cells within `balance_threshold_v` of max voltage |
| `balancing` entity **not set**, charging, delta > 0.02 V or max cell > 3.35 V | Infer balancing group |
| None of the above | No overlay |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Card not found after install | Hard-refresh (`Ctrl+Shift+R`); check resource URL in Dashboard resources |
| "Custom element not defined" in console | Verify the JS file loaded (check Network tab); ensure resource type is *JavaScript module* |
| All cells show `—` | Check entity IDs in config match those in Developer Tools → States |
| Overlay flickers or misaligns | The SVG overlay uses `position: absolute; inset: 0` — ensure no CSS override removes `position: relative` from the parent |
| Build fails | Run `node --version` (≥ 18 required); delete `node_modules` and re-run `npm install` |

---

## Development

```bash
npm install
npm run dev    # Vite dev server (HMR)
npm run build  # Production bundle → dist/jk-bms-reactor-card.js
npm run lint   # TypeScript type-check
```
