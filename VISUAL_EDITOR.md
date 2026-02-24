# Visual Editor Quick Guide

The card now has a full visual configuration editor in the Home Assistant UI!

## Using the Visual Editor

1. **Add the card** to your dashboard (click "Add Card")
2. **Search** for "JK BMS Reactor Card"
3. **Configure** using the visual editor

## Editor Features

### Required Settings
- **Pack Voltage Entity** - Entity picker for total pack voltage
- **Current Entity** - Entity picker for pack current
- **SOC Entity** - Entity picker for state of charge

### Cell Configuration
Two modes available via toggle buttons:

**Individual Cells Mode:**
- Add/remove cells individually
- Each cell has its own entity picker
- Great for custom setups or mixed entity names

**Prefix + Count Mode:**
- Set a prefix (e.g., `sensor.jk_bms_cell_`)
- Set number of cells (default: 16)
- Auto-generates entity IDs like `sensor.jk_bms_cell_1`, `sensor.jk_bms_cell_2`, etc.

### Optional Settings
- **Balancing Entity** - Binary sensor for balancing status
- **Delta Voltage Entity** - Cell voltage delta (auto-calculated if omitted)

### Thresholds
- **Balance Threshold** - Voltage difference to mark cells as balancing (default: 0.01V)
- **Charge Threshold** - Current threshold for charging animation (default: 0.5A)
- **Discharge Threshold** - Current threshold for discharging animation (default: 0.5A)

### Display Options
- **Show Balancing Overlay** - Toggle SVG overlay with balancing animations
- **Show Cell Labels** - Toggle cell number labels

## Default Configuration

When you add a new card, it starts with:
```yaml
type: custom:jk-bms-reactor-card
pack_voltage: ''
current: ''
soc: ''
cells_prefix: sensor.jk_bms_cell_
cells_count: 16
```

Just fill in the entity pickers and you're ready to go!

## Tips

- Use entity pickers to avoid typos
- The editor validates as you type
- Switch between cell modes anytime
- All settings are saved automatically
- You can still use YAML mode if preferred

## Troubleshooting

If the editor doesn't appear:
1. Clear browser cache (Ctrl+F5 / Cmd+Shift+R)
2. Ensure the card resource is loaded
3. Check browser console for errors (F12)

The visual editor makes configuration much easier than writing YAML by hand!
