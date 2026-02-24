# Troubleshooting: "Custom element doesn't exist: jk-bms-reactor-card"

## Quick Fix

This error means Home Assistant hasn't loaded the card JavaScript file. Follow these steps:

### 1. Verify File Location

Check that the file exists at:
```
/config/www/jk-bms-reactor-card/jk-bms-reactor-card.js
```

If not, copy it:
```bash
cp dist/jk-bms-reactor-card.js /config/www/jk-bms-reactor-card/
```

### 2. Check Resource Configuration

Go to **Settings** → **Dashboards** → **Resources** (three-dot menu, top right)

Ensure you have a resource with:
- **URL**: `/local/jk-bms-reactor-card/jk-bms-reactor-card.js`
- **Type**: JavaScript Module

**Important**: The URL must start with `/local/` (not `/config/www/`)

### 3. Add Version Parameter (Bypass Cache)

If the resource exists, add a version parameter to force reload:

Change:
```
/local/jk-bms-reactor-card/jk-bms-reactor-card.js
```

To:
```
/local/jk-bms-reactor-card/jk-bms-reactor-card.js?v=1.0.1
```

Increment the version number each time you update the file.

### 4. Clear Browser Cache

**Hard refresh** your browser:
- **Windows/Linux**: `Ctrl + F5` or `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Alternative**: Open browser DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### 5. Restart Home Assistant (if needed)

Sometimes HA needs a restart to pick up new resources:
- **Settings** → **System** → **Restart**

### 6. Check Browser Console

Press **F12** to open DevTools, then check the **Console** tab for errors:

**Good signs:**
```
JK-BMS-REACTOR-CARD v1.0.0
```

**Bad signs:**
```
Failed to load resource: /local/jk-bms-reactor-card/jk-bms-reactor-card.js
404 Not Found
Syntax error in JavaScript file
```

### 7. Verify File Permissions

If you're running HA in Docker or a VM:
```bash
ls -la /config/www/jk-bms-reactor-card/
# File should be readable (r-- permissions)
```

### 8. Check for File Corruption

Verify the file size:
```bash
ls -lh /config/www/jk-bms-reactor-card/jk-bms-reactor-card.js
# Should be ~55KB
```

If it's 0 bytes or suspiciously small, re-copy from dist/.

## Complete Reinstall Steps

If nothing works, start fresh:

```bash
# 1. Remove old files
rm -rf /config/www/jk-bms-reactor-card/

# 2. Create directory
mkdir -p /config/www/jk-bms-reactor-card/

# 3. Copy new file
cp dist/jk-bms-reactor-card.js /config/www/jk-bms-reactor-card/

# 4. Verify
ls -lh /config/www/jk-bms-reactor-card/jk-bms-reactor-card.js
```

Then in Home Assistant:
1. Remove the old resource
2. Add it back: `/local/jk-bms-reactor-card/jk-bms-reactor-card.js?v=2`
3. Hard refresh browser
4. Try adding the card again

## HACS Users

If installed via HACS:
1. Go to HACS → Frontend
2. Find "JK BMS Reactor Card"
3. Click "Redownload"
4. Hard refresh browser

## Still Not Working?

Check the browser console (F12) for the exact error message and:
1. Verify the file loads (Network tab in DevTools)
2. Look for JavaScript syntax errors
3. Check for conflicting custom cards
4. Try in a private/incognito window

## Common Mistakes

❌ Using `/config/www/...` in resource URL  
✅ Use `/local/...` instead

❌ Forgetting to hard refresh browser  
✅ Always Ctrl+F5 / Cmd+Shift+R after updates

❌ Wrong file path or filename  
✅ Must be exactly: `/config/www/jk-bms-reactor-card/jk-bms-reactor-card.js`

❌ Resource type set to "JavaScript" instead of "JavaScript Module"  
✅ Must be "JavaScript Module"
