<center>
<h2>⚙️📟📈 tslab-widgets 📈📟⚙️</h1>
</center>

<blockquote>
  A library that brings rich, interactive data visualizations directly to Jupyter Notebooks through a TypeScript kernel bridging the gap between the expressive power of modern TypeScript charting libraries and the iterative, exploratory workflow of Jupyter.
</blockquote>
<hr />
<br>

## Overview

🔧 **First-Class TypeScript Experience**: Designed specifically for TS kernels. Get full type checking, autocompletion (IntelliSense) for your chart configurations, and safe refactoring as you explore your data.

📚 **Notebook-Native**: Visualizations render inline as notebook cell outputs. They are fully embedded in the document, making them ideal for creating reproducible analysis reports, interactive dashboards, and storytelling with data.

🎯 **Leverage the TS Ecosystem**: Integrates with popular JavaScript visualization libraries.

⚡ **Lightweight** - CDN-based dependencies for fast loading and no build step.

📊 **Financial Charts** - Candlestick, line, area with crosshair and time-scale synchronization across multiple charts.

✨ **Data Visualization** - Tables, charts, JSON tree viewer, gauge and more to come...

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

### Screenshots

<img width="1242" alt="Screenshot 2024-09-05 at 12 36 37 PM" src="https://github.com/user-attachments/assets/ab9a258c-059e-4bae-ac5b-6c753e885e70">

<img width="1025" alt="Screenshot 2024-09-05 at 12 37 29 PM" src="https://github.com/user-attachments/assets/1a8cd079-ae49-4cd4-b629-069cc7a0bb61">

### Author

Rodrigo P.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/rodrigopivi)
