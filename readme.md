<center>
<h2>⚙️📟📈 tslab-widgets 📈📟⚙️</h1>
</center>

<blockquote>
  A set of widgets for tslab (the interactive programming environment on top of jupyter lab that supports typescript and javascript).
</blockquote>
<hr />
<br>

## Features

✨ **Financial Charts** - Candlestick, line, area, bar charts with real-time sync
📊 **Data Visualization** - CSV tables, JSON tree viewer, gauge charts
🎯 **Chart Sync** - Automatic crosshair and time-scale synchronization across multiple charts
🔧 **Type-Safe** - Full TypeScript support with comprehensive type definitions
⚡ **Lightweight** - CDN-based dependencies for fast loading

### Setup:

- Install [tslab](https://github.com/yunabe/tslab)
- `npm i -S tslab tslab-widgets`
- Optional dev dependencies: `npm i -D lightweight-charts tslib react react-dom`
- `npm install -g tslab`
- `npm i -S tslab tslab-widgets`

### Widget list:

- **Chart** - Financial charts powered by `lightweight-charts` with plugins:
  - Candlestick, Line, Area, Bar, Baseline, Histogram
  - Tooltips, trend lines, volume profiles, vertical markers
  - Multi-chart synchronization (crosshair + time scale)
- **CSV** - Responsive table viewer with auto-pairing layout
- **Gauge** - Circular progress/KPI indicators
- **JSON** - Expandable tree view for objects

Review the [example jupyter notebook](https://github.com/rodrigopivi/tslab-widgets/blob/main/example.ipynb).

## CDN Strategy

tslab-widgets uses a **CDN-based approach** for runtime dependencies (React, lightweight-charts, etc.). This means:

- ✅ **No bundling overhead** - Dependencies loaded directly from esm.sh
- ✅ **Faster notebook loading** - Browser caches shared dependencies
- ✅ **Smaller package size** - No need to bundle React into the library
- ✅ **Centralized version management** - All CDN versions managed in `src/config/versions.ts`

### For Contributors: Updating CDN Versions

```typescript
// Edit src/config/versions.ts
export const CDN_VERSIONS = {
  react: "19.0.0", // Update version here
  reactDom: "19.0.0",
  lightweightCharts: "5.1.0",
  // ...
};
```

Then update corresponding versions in package.json devDependencies and run:

```bash
npm run validate  # Ensures versions match
npm run build
```

### Screenshots

<img width="1242" alt="Screenshot 2024-09-05 at 12 36 37 PM" src="https://github.com/user-attachments/assets/ab9a258c-059e-4bae-ac5b-6c753e885e70">

<img width="1025" alt="Screenshot 2024-09-05 at 12 37 29 PM" src="https://github.com/user-attachments/assets/1a8cd079-ae49-4cd4-b629-069cc7a0bb61">

### Author

Rodrigo P.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/rodrigopivi)
