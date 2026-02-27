# JK BMS Reactor Card

A beautiful, reactor-style Lovelace custom card for visualizing JK BMS battery packs (16S) in Home Assistant with advanced balancing and energy flow animations.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

✨ **Core Reactor Design**: Central circular SOC display with animated reactor ring  
⚡ **Energy Flow Nodes**: Visual charge/discharge flow between solar/grid, reactor, and load  
📊 **Enhanced Stats**: Six-panel metrics grid with voltage, current, power, delta, min/max  
🎯 **Animated SVG Paths**: Flowing dash animations showing real-time energy direction  
💎 **Smart Cell Grid**: 16 cells in 4×4 layout with voltage-based color gradients  
⚖️ **Balancing Visualization**: Pulsing reactor ring and cell highlighting during balancing  
🎨 **Modern UI**: Glassmorphism panels with dynamic borders and shadows  
🔒 **Safe & Performant**: Gracefully handles missing entities without crashes  
📱 **Responsive Design**: Optimized for mobile and desktop viewing

## Installation

### Manual Installation

1. **Download the card**:
   - Build from source (see [Building](#building-from-source) section) or download the pre-built `jk-bms-reactor-card.js` file

2. **Copy to Home Assistant**:
   ```bash
   # Copy the file to your Home Assistant www folder
   mkdir -p /config/www/jk-bms-reactor-card/
   cp dist/jk-bms-reactor-card.js /config/www/jk-bms-reactor-card/
   ```

3. **Add resource to Lovelace**:
   - Go to **Settings** → **Dashboards** → **Resources** (top-right menu)
   - Click **Add Resource**
   - Enter URL: `/local/jk-bms-reactor-card/jk-bms-reactor-card.js`
   - Resource type: **JavaScript Module**
   - Click **Create**

4. **Clear browser cache**:
   - Hard refresh: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### HACS Installation

1. **Add custom repository**:
   - Open HACS in Home Assistant
   - Go to **Frontend**
   - Click the **3-dot menu** (top right) → **Custom repositories**
   - Add repository URL: `https://github.com/yourusername/jk-bms-reactor-card`
   - Category: **Lovelace**
   - Click **Add**

2. **Install the card**:
   - Find "JK BMS Reactor Card" in HACS
   - Click **Download**
   - Restart Home Assistant (if required)
   
3. **Add to Lovelace**:
   - The resource is automatically added by HACS
   - Add the card to your dashboard using the configuration examples below

## Configuration

### Basic Configuration (Using cells array)

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.jk_bms_total_voltage
current: sensor.jk_bms_current
soc: sensor.jk_bms_soc
cells:
  - sensor.jk_bms_cell_1_voltage
  - sensor.jk_bms_cell_2_voltage
  - sensor.jk_bms_cell_3_voltage
  - sensor.jk_bms_cell_4_voltage
  - sensor.jk_bms_cell_5_voltage
  - sensor.jk_bms_cell_6_voltage
  - sensor.jk_bms_cell_7_voltage
  - sensor.jk_bms_cell_8_voltage
  - sensor.jk_bms_cell_9_voltage
  - sensor.jk_bms_cell_10_voltage
  - sensor.jk_bms_cell_11_voltage
  - sensor.jk_bms_cell_12_voltage
  - sensor.jk_bms_cell_13_voltage
  - sensor.jk_bms_cell_14_voltage
  - sensor.jk_bms_cell_15_voltage
  - sensor.jk_bms_cell_16_voltage
```

### Configuration (Using cells_prefix)

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.jk_bms_total_voltage
current: sensor.jk_bms_current
soc: sensor.jk_bms_soc
cells_prefix: sensor.jk_bms_cell_
cells_count: 16
```

### Full Configuration with All Options

```yaml
type: custom:jk-bms-reactor-card
pack_voltage: sensor.jk_bms_total_voltage
current: sensor.jk_bms_current
soc: sensor.jk_bms_soc
cells_prefix: sensor.jk_bms_cell_
cells_count: 16
balancing: binary_sensor.jk_bms_balancing
delta: sensor.jk_bms_delta_cell_voltage
balance_threshold_v: 0.01
charge_threshold_a: 0.5
discharge_threshold_a: 0.5
show_overlay: true
show_cell_labels: true
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be `custom:jk-bms-reactor-card` |
| `pack_voltage` | string | **Yes** | - | Entity ID for pack voltage sensor |
| `current` | string | No* | - | Entity ID for pack current sensor (signed: discharge negative, charge positive) |
| `charge_current` | string | No* | - | Entity ID for charge current sensor (will be treated as positive amps) |
| `discharge_current` | string | No* | - | Entity ID for discharge current sensor (will be treated as negative amps) |
| `soc` | string | **Yes** | - | Entity ID for state of charge sensor |
| `cells` | string[] | **Yes*** | - | Array of cell voltage entity IDs |
| `cells_prefix` | string | **Yes*** | - | Prefix for cell entity IDs (e.g., `sensor.jk_bms_cell_`) |
| `cells_count` | number | **Yes*** | - | Number of cells (e.g., 16) |
| `cells_prefix_pad` | boolean | No | `false` | If true, generates cell IDs like `..._01`, `..._02` when using `cells_prefix` |
| `cell_wire_resistance_template` | string | No | - | Optional template for per-cell wire resistance entities. Use `{n}` placeholder (e.g., `sensor.jk_bms_cell_{n}_wire_resistance`). Displayed next to the cell number with `Ω`. |
| `balancing` | string | No | - | Entity ID for balancing status (boolean or on/off) |
| `delta` | string | No | - | Entity ID for delta voltage sensor (computed if not provided) |
| `balance_threshold_v` | number | No | `0.01` | Voltage threshold to determine balancing cells (V) |
| `charge_threshold_a` | number | No | `0.5` | Current threshold to trigger charging animation (A) |
| `discharge_threshold_a` | number | No | `0.5` | Current threshold to trigger discharging animation (A) |
| `show_overlay` | boolean | No | `true` | Show SVG overlay for balancing visualization |
| `show_cell_labels` | boolean | No | `true` | Show cell labels (Cell 1, Cell 2, etc.) |

\* Provide either `current` OR `charge_current`/`discharge_current` (you can set just one, but both is best)

\*\* Either `cells` array OR both `cells_prefix` and `cells_count` must be provided

## Balancing Logic

The card supports two methods for detecting balancing cells:

### 1. Explicit Balancing Entity

If you provide a `balancing` entity (e.g., `binary_sensor.jk_bms_balancing`):
- When the entity state is `on` or `true`, cells within `balance_threshold_v` of the max cell voltage are marked as balancing
- When `off` or `false`, no cells are marked as balancing

### 2. Inferred Balancing (No balancing entity)

When no `balancing` entity is provided, the card infers balancing when:
- Current > `charge_threshold_a` (charging)
- AND one of:
  - Delta > 0.02V (if delta available)
  - OR max cell voltage > 3.35V

When inferred balancing is active, cells within `balance_threshold_v` of max voltage are marked as balancing.

## Animations

### Balancing Animation
- **Pulsing glow** around balancing cells
- **Animated dashed lines** connecting balancing cells to center point
- **Central pulse** indicator

### Charging Animation
- **Upward/clockwise** energy flow particles
- Activated when current > `charge_threshold_a`

### Discharging Animation
- **Downward/counter-clockwise** energy flow particles
- Activated when current < `-discharge_threshold_a`

## Cell Voltage Color Coding

Cells are automatically color-coded based on voltage:
- **Low voltage** (< 3.0V): Red/pink gradient
- **High voltage** (> 3.5V): Blue gradient
- **Normal voltage** (3.0-3.5V): Green gradient

## Building from Source

### Prerequisites
- Node.js 18+ and npm

### Build Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/jk-bms-reactor-card.git
cd jk-bms-reactor-card

# Install dependencies
npm install

# Build the card
npm run build

# Output will be in dist/jk-bms-reactor-card.js
```

### Development Mode

```bash
# Run development server with hot reload
npm run dev
```

## Troubleshooting

### Card not showing up

1. **Clear browser cache**: Hard refresh with `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Check resource path**: Ensure the resource URL is `/local/jk-bms-reactor-card/jk-bms-reactor-card.js`
3. **Check browser console**: Press `F12` and look for errors in the Console tab
4. **Verify file location**: File should be at `/config/www/jk-bms-reactor-card/jk-bms-reactor-card.js`

### Missing data or "—" displayed

- **Verify entity IDs**: Check that all entity IDs in your config exist in Home Assistant
- **Check entity states**: Entities should have numeric values, not `unknown` or `unavailable`
- **Entity naming**: If using `cells_prefix`, ensure entity IDs follow the pattern exactly (e.g., `sensor.jk_bms_cell_1`, `sensor.jk_bms_cell_2`, etc.)

### Animations not working

- **Check thresholds**: Ensure current values exceed `charge_threshold_a` or `discharge_threshold_a`
- **Browser compatibility**: Ensure you're using a modern browser with CSS animation support
- **Disable overlays temporarily**: Set `show_overlay: false` to test basic functionality

### Card shows error on load

- **Configuration validation**: Check that all required fields are present
- **TypeScript errors**: If building from source, run `npm run build` and check for errors
- **Entity permissions**: Ensure your Home Assistant user has access to all entities

### Performance issues

- **Reduce cell count**: Card is optimized for 16 cells; larger counts may impact performance
- **Disable overlays**: Set `show_overlay: false` to reduce SVG rendering overhead
- **Check browser**: Try a different browser or device

## Advanced Customization

### CSS Variables

You can customize colors by overriding CSS variables in your theme:

```yaml
# In your theme configuration
  jk-bms-reactor-card:
    --primary-color: '#03a9f4'
    --balance-color: '#ffa500'
    --energy-color: '#4caf50'
    --warning-color: '#ff9800'
    --danger-color: '#f44336'
```

## Support & Contributing

- **Issues**: [GitHub Issues](https://github.com/yourusername/jk-bms-reactor-card/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/jk-bms-reactor-card/discussions)
- **Pull Requests**: Contributions are welcome!

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with [Lit](https://lit.dev/)
- Designed for [Home Assistant](https://www.home-assistant.io/)
- Inspired by reactor-style visualizations

---

**Enjoy your JK BMS visualization!** ⚡🔋