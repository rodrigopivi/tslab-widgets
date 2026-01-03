<center>
<h2>⚙️📟📈 tslab-widgets 📈📟⚙️</h1>
</center>

<blockquote>
  TsLab-Widgets helps TypeScript developers who want production-quality interactive visualizations in Jupyter notebooks without build complexity. Bridging the gap between the expressive power of modern TypeScript and the iterative, exploratory workflow of Jupyter.
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

- `pip3 install jupyterlab`
- Install [tslab](https://github.com/yunabe/tslab)
- `npm i -S tslab tslab-widgets tslib lightweight-charts`

### Widget list:

- **Chart** - Professional financial charts powered by `lightweight-charts`
  - Series types: Candlestick, Line, Area, Bar, Baseline, Histogram
  - Advanced features: tooltips, trend lines, volume profiles
  - Multi-chart synchronization for crosshair and time scale alignment

- **Barchart** - Versatile bar charts powered by `recharts`
  - 3 variations: Simple, Stacked, Mix
  - Ideal for categorical data comparison and trends
  - Supports custom colors and labels

- **Pie** - Interactive pie and donut charts powered by `recharts`
  - Single or two-level nested pie charts
  - Configurable donut mode with inner radius control
  - Custom labels with percentage display
  - Supports custom colors per segment

- **Scatter** - Scatter plot visualization powered by `ag-charts`
  - Multi-series support with different shapes (circle, square, diamond, etc.)
  - Customizable axes with titles and formatters
  - Interactive tooltips and legend
  - Perfect for correlation analysis and data distribution

- **Table** - Responsive data grid powered by `ag-grid-community`
  - Built-in sorting, filtering, and column resizing
  - Auto-generates columns from data structure
  - Balham dark theme integration

- **Gauge** - Circular KPI indicators powered by `recharts`
  - Animated needle with smooth transitions
  - Three size presets (S, M, L)
  - Configurable color sections and ranges

- **JSON** - Collapsible tree viewer powered by `react-json-tree`
  - Expandable/collapsible object inspection
  - Syntax highlighting for different data types
  - Scrollable container for large objects

- **Layout** - Composition utilities (not a widget):
  - `row()` - Arrange widgets horizontally with flex controls
  - Use `.html()` method to get HTML string without rendering (Note: chart widget doesn't support `.html()`)

Review the [example notebooks](https://github.com/rodrigopivi/tslab-widgets/blob/main/examples)


## CDN Strategy

tslab-widgets uses a **CDN-based approach** for runtime dependencies (React, lightweight-charts, etc.). This means:

- ✅ **No bundling overhead** - Dependencies loaded directly from esm.sh
- ✅ **Faster notebook loading** - Browser caches shared dependencies
- ✅ **Smaller package size** - No need to bundle React into the library
- ✅ **Centralized version management** - All CDN versions managed in `src/config/versions.ts`

### Screenshots

<img width="1242" alt="Screenshot 2024-09-05 at 12 36 37 PM" src="https://github.com/user-attachments/assets/ab9a258c-059e-4bae-ac5b-6c753e885e70">

<img width="1025" alt="Screenshot 2024-09-05 at 12 37 29 PM" src="https://github.com/user-attachments/assets/1a8cd079-ae49-4cd4-b629-069cc7a0bb61">

### Configure VSCode to use Typescript Kernel

Go to `Select Kernel` -> `Jupyter Kernel...` -> `Typescript`

### Author

Rodrigo P.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/rodrigopivi)
