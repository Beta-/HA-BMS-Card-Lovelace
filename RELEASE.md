# Release Instructions

## Creating a Release for HACS

HACS requires proper GitHub releases to distribute the card. Follow these steps:

### 1. Build the Card

```bash
npm install
npm run build
```

This creates `dist/jk-bms-reactor-card.js`.

### 2. Create a GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.0`)
4. Set release title (e.g., `v1.0.0`)
5. Add release notes describing changes
6. **Important**: Attach the `dist/jk-bms-reactor-card.js` file as a release asset
7. Publish the release

### 3. HACS Installation

Once published, users can install via HACS:

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the menu (three dots) → "Custom repositories"
4. Add repository URL: `https://github.com/yourusername/jk-bms-reactor-card`
5. Category: "Lovelace"
6. Click "Add"
7. Find "JK BMS Reactor Card" and click "Download"

### Release Checklist

- [ ] Version number updated in `package.json`
- [ ] `npm run build` completed successfully
- [ ] `dist/jk-bms-reactor-card.js` exists
- [ ] Git tag created (e.g., `v1.0.0`)
- [ ] GitHub release created
- [ ] `jk-bms-reactor-card.js` attached to release
- [ ] Release notes added
- [ ] HACS validation workflow passes

### Version Guidelines

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Automated Releases (Optional)

You can automate releases using GitHub Actions. Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/jk-bms-reactor-card.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
