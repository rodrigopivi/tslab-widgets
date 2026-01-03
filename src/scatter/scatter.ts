/** biome-ignore-all lint/style/useTemplate: custom render */
import * as tslab from "tslab";
import { CDN_URLS } from "../config/versions";

export interface IScatterSeriesConfig {
	title?: string;
	data: Record<string, string | number>[];
	xKey: string;
	xName?: string;
	yKey: string;
	yName?: string;
	fill?: string;
	size?: number;
	shape?: "circle" | "square" | "diamond" | "cross" | "plus" | "triangle";
}

export interface IScatterConfig {
	series: IScatterSeriesConfig[];
	width?: number;
	height?: number;
	title?: string;
	subtitle?: string;
	showLegend?: boolean;
	showTooltip?: boolean;
	xAxisTitle?: string;
	yAxisTitle?: string;
	xAxisFormatter?: string; // Function as string, e.g., "(params) => params.value + 'cm'"
	yAxisFormatter?: string; // Function as string, e.g., "(params) => params.value + 'kg'"
	margin?: {
		top?: number;
		right?: number;
		left?: number;
		bottom?: number;
	};
}

function generateScatterHtml(config: IScatterConfig): string {
	const reactComponentId = `_scatter_widget${Math.random().toString(36).substring(2, 9)}`;
	const {
		series,
		width,
		height = 400,
		title,
		subtitle,
		showLegend = true,
		showTooltip = true,
		xAxisTitle,
		yAxisTitle,
		xAxisFormatter,
		yAxisFormatter,
	} = config;

	const serializedSeries = JSON.stringify(series);

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

      const seriesData = ${serializedSeries};
      const showLegend = ${showLegend};
      const showTooltip = ${showTooltip};
      const title = "${title || ""}";
      const subtitle = "${subtitle || ""}";
      const xAxisTitle = "${xAxisTitle || ""}";
      const yAxisTitle = "${yAxisTitle || ""}";
      const maxWidth = ${width ? '"' + width.toString() + 'px"' : undefined};

      // Default colors for series
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

      function getSeriesColor(series, index) {
        return series.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      }

      function buildSeries() {
        return seriesData.map((series, index) => ({
          type: 'scatter',
          title: series.title,
          data: series.data,
          xKey: series.xKey,
          xName: series.xName || series.xKey,
          yKey: series.yKey,
          yName: series.yName || series.yKey,
          fill: getSeriesColor(series, index),
          size: 6,
          shape: series.shape || 'circle',
        }));
      }

      function ScatterComponent() {
        const series = buildSeries();

        const chartOptions = {
          theme: {
            palette: {
              fills: seriesData.map((s, index) => getSeriesColor(s, index)),
              strokes: seriesData.map((s, index) => getSeriesColor(s, index)),
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
                subtitle: {
                  color: '#cccccc',
                  fontSize: 14,
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
              scatter: {
                axes: {
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
                    title: {
                      color: '#ffffff',
                      fontSize: 14,
                    },
                  },
                },
              },
            },
          },
          title: title ? {
            text: title,
          } : undefined,
          subtitle: subtitle ? {
            text: subtitle,
          } : undefined,
          series: series,
          axes: {
            x: {
              type: 'number',
              position: 'bottom',
              title: xAxisTitle ? {
                text: xAxisTitle,
              } : undefined,
              label: ${xAxisFormatter ? `{ formatter: ${xAxisFormatter} }` : "undefined"},
            },
            y: {
              type: 'number',
              position: 'left',
              title: yAxisTitle ? {
                text: yAxisTitle,
              } : undefined,
              label: ${yAxisFormatter ? `{ formatter: ${yAxisFormatter} }` : "undefined"},
            },
          },
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
        root.render(h(ScatterComponent));
      }
    </script>
  `;
}

function scatter(config: IScatterConfig): void {
	const html = generateScatterHtml(config);
	tslab.display.html(html);
}

scatter.html = (config: IScatterConfig): string => generateScatterHtml(config);

export { scatter };
