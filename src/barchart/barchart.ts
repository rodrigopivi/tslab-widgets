/** biome-ignore-all lint/style/useTemplate: custom render */
import * as tslab from "tslab";
import { CDN_URLS } from "../config/versions";

export type BarchartVariation = "simple" | "stacked" | "mix";

export interface IBarConfig {
	dataKey: string;
	fill?: string;
	stackId?: string;
	yAxisId?: string;
	radius?: number | [number, number, number, number];
	activeBar?: {
		fill?: string;
		stroke?: string;
	};
	background?: boolean;
}

export interface IYAxisConfig {
	yAxisId: string;
	orientation: "left" | "right";
	stroke?: string;
	width?: number | "auto";
}

export interface IBarchartConfig {
	data: Record<string, string | number>[];
	xAxisKey: string;
	bars: IBarConfig[];
	variation?: BarchartVariation;
	yAxes?: IYAxisConfig[];
	width?: number;
	height?: number;
	title?: string;
	showLegend?: boolean;
	showTooltip?: boolean;
	showGrid?: boolean;
	margin?: {
		top?: number;
		right?: number;
		left?: number;
		bottom?: number;
	};
}

function generateBarchartHtml(config: IBarchartConfig): string {
	const reactComponentId = `_barchart_widget${Math.random().toString(36).substring(2, 9)}`;
	const {
		data,
		xAxisKey,
		bars,
		variation = "simple",
		width,
		height = 400,
		title,
		showLegend = true,
		showTooltip = true,
	} = config;

	// Serialize configuration for client-side use
	const serializedData = JSON.stringify(data);
	const serializedBars = JSON.stringify(bars);

	return `
    <div id="${reactComponentId}" style="display: flex; flex: 1;justify-content: center;">
      <div style="padding: 20px; background: #2a2a2a; color: #fff; text-align: center; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px;">Loading chart...</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">If this message persists, there may be a module loading issue</p>
      </div>
    </div>
    <script type="module">
      import React from "${CDN_URLS.react}";
      import ReactDOM from "${CDN_URLS.reactDom}";
      import { AllCommunityModule, ModuleRegistry } from "https://esm.sh/ag-charts-community@13.0.0";
      import { AgCharts } from "${CDN_URLS.agChartsReact}";

      const h = React.createElement;

      ModuleRegistry.registerModules([AllCommunityModule]);

      const data = ${serializedData};
      const bars = ${serializedBars};
      const variation = "${variation}";
      const xAxisKey = "${xAxisKey}";
      const showLegend = ${showLegend};
      const showTooltip = ${showTooltip};
      const title = "${title || ""}";
      const maxWidth = ${width ? '"' + width.toString() + 'px"' : undefined};

      // Default colors for bars
      const DEFAULT_COLORS = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7c7c",
        "#8dd1e1",
        "#d084d0",
        "#ffb347",
        "#a8e6cf"
      ];

      function getBarColor(bar, index) {
        return bar.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      }

      function buildSeries() {
        const series = bars.map((bar, index) => {
          const baseConfig = {
            type: 'bar',
            xKey: xAxisKey,
            yKey: bar.dataKey,
            yName: bar.dataKey,
            fill: getBarColor(bar, index),
            strokeWidth: 0,
            cornerRadius: bar.radius ? (Array.isArray(bar.radius) ? bar.radius[0] : bar.radius) : 0,
          };

          // Handle stacking
          if (variation === "stacked") {
            baseConfig.stacked = true;
            baseConfig.stackGroup = bar.stackId || "default";
          } else if (variation === "mix" && bar.stackId) {
            baseConfig.stacked = true;
            baseConfig.stackGroup = bar.stackId;
          }

          return baseConfig;
        });

        return series;
      }

      function BarchartComponent() {
        const series = buildSeries();

        const chartOptions = {
          data: data,
          theme: {
            palette: {
              fills: bars.map((bar, index) => getBarColor(bar, index)),
              strokes: bars.map((bar, index) => getBarColor(bar, index)),
            },
            overrides: {
              common: {
                background: {
                  fill: 'transparent',
                },
                title: {
                  color: '#ffffff',
                  fontSize: 16,
                },
                legend: {
                  item: {
                    label: {
                      color: '#e0e0e0',
                      fontSize: 12,
                    },
                  },
                },
              },
              bar: {
                axes: {
                  category: {
                    label: {
                      color: '#e0e0e0',
                      fontSize: 12,
                    },
                    line: {
                      color: '#555555',
                    },
                    gridLine: {
                      enabled: false,
                    },
                  },
                  number: {
                    label: {
                      color: '#e0e0e0',
                      fontSize: 12,
                    },
                    line: {
                      color: '#555555',
                    },
                    gridLine: {
                      style: [{
                        stroke: '#444444',
                        lineDash: [5, 5],
                      }],
                    },
                  },
                },
              },
            },
          },
          title: title ? {
            text: title,
          } : undefined,
          series: series,
          axes: [
            {
              type: 'category',
              position: 'bottom',
            },
            {
              type: 'number',
              position: 'left',
            },
          ],
          legend: {
            enabled: showLegend,
            position: 'bottom',
          },
        };

        return h("div", {
          style: {
            textAlign: "center",
            background: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            width: "100%",
            boxSizing: "border-box",
            maxWidth,
          }
        }, [
          h(AgCharts, {
            options: chartOptions,
            style: {
              width: "100%",
              maxWidth,
              height: '${height}px',
            },
          })
        ]);
      }

      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");

      if (jupyterLabReactComponentContainer) {
        const root = ReactDOM.createRoot(jupyterLabReactComponentContainer);
        root.render(h(BarchartComponent));
      }
    </script>
  `;
}

function barchart(config: IBarchartConfig): void {
	const html = generateBarchartHtml(config);
	tslab.display.html(html);
}

barchart.html = (config: IBarchartConfig): string =>
	generateBarchartHtml(config);

export { barchart };
