# JK BMS Reactor Card

A beautiful, reactor-style Lovelace custom card for visualizing JK BMS battery packs (16S) in Home Assistant.

## Features

✨ **Reactor-Style Layout** - 16 cells in elegant 4×4 grid  
📊 **Pack Statistics** - Voltage, current, SOC, delta  
⚖️ **Balancing Visualization** - Animated SVG overlay  
⚡ **Energy Flow** - Charging/discharging animations  
🎨 **Color-Coded Cells** - Visual voltage feedback  
🔒 **Safe & Performant** - Handles missing entities gracefully

## Quick Start

### Configuration Example

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.jk_bms_total_voltage
current: sensor.jk_bms_current
soc: sensor.jk_bms_soc
cells_prefix: sensor.jk_bms_cell_
cells_count: 16
```

### Alternative: Using cells array

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.jk_bms_total_voltage
current: sensor.jk_bms_current
soc: sensor.jk_bms_soc
cells:
  - sensor.jk_bms_cell_1_voltage
  - sensor.jk_bms_cell_2_voltage
  # ... (all 16 cells)
```

## Optional Parameters

- `balancing` - Balancing status entity (boolean/on-off)
- `delta` - Delta voltage entity (auto-computed if not provided)
- `balance_threshold_v` - Voltage threshold for balancing (default: 0.01V)
- `charge_threshold_a` - Charging animation threshold (default: 0.5A)
- `discharge_threshold_a` - Discharging threshold (default: 0.5A)
- `show_overlay` - Show balancing overlay (default: true)
- `show_cell_labels` - Show cell labels (default: true)

## Support

For issues, questions, or feature requests, please visit the [GitHub repository](https://github.com/yourusername/jk-bms-reactor-card).
