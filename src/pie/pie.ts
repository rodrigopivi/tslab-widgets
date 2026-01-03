import * as tslab from "tslab";
import { CDN_URLS } from "../config/versions";

export type IPieDataItem = { name: string; value: number; fill?: string };

export type IPieConfig = {
	data: IPieDataItem[];
	innerData?: IPieDataItem[];
	innerRadius?: number;
	outerRadius?: number;
	showLabels?: boolean;
	useCustomLabels?: boolean;
	showLabelLines?: boolean;
	animate?: boolean;
	width?: number;
	height?: number;
	title?: string;
	colors?: string[];
};

function generatePieHtml(config: IPieConfig): string {
	const reactComponentId = `_pie_widget${Math.random().toString(36).substring(2, 9)}`;
	const {
		data,
		innerData,
		innerRadius = 0,
		outerRadius = 80,
		showLabels = false,
		useCustomLabels = false,
		showLabelLines = true,
		animate = true,
		width = 500,
		height = 500,
		title = "",
		colors = [
			"#0088FE",
			"#00C49F",
			"#FFBB28",
			"#FF8042",
			"#8884d8",
			"#82ca9d",
			"#ffc658",
			"#ff7c7c",
		],
	} = config;

	return `
    <div id="${reactComponentId}" />
    <script type="module">
      import React from "${CDN_URLS.react}";
      import ReactDOM from "${CDN_URLS.reactDom}";
      import { Cell, Pie, PieChart } from "${CDN_URLS.recharts}";

      const h = React.createElement;

      const RADIAN = Math.PI / 180;
      const DEFAULT_COLORS = ${JSON.stringify(colors)};

      // Custom label renderer for percentage display
      function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
        if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
          return null;
        }
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const ncx = Number(cx);
        const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
        const ncy = Number(cy);
        const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

        return h(
          "text",
          {
            x: x,
            y: y,
            fill: "white",
            textAnchor: x > ncx ? "start" : "end",
            dominantBaseline: "central",
            style: { fontSize: "14px", fontWeight: "600" }
          },
          ((percent ?? 1) * 100).toFixed(0) + "%"
        );
      }

      function PieChartComponent() {
        const data = ${JSON.stringify(data)};
        const innerData = ${JSON.stringify(innerData || null)};
        const hasInnerData = innerData && innerData.length > 0;
        const showLabels = ${showLabels};
        const useCustomLabels = ${useCustomLabels};
        const showLabelLines = ${showLabelLines};
        const animate = ${animate};
        const innerRadiusPercent = ${innerRadius};
        const outerRadiusPercent = ${outerRadius};
        const title = "${title}";

        return h(
          "div",
          {
            style: {
              width: "100%",
              maxWidth: "${width}px",
              margin: "8px auto",
              backgroundColor: "#1F1826",
              padding: title ? "20px" : "10px",
              borderRadius: "8px",
            }
          },
          [
            title && h(
              "h3",
              {
                style: {
                  margin: "0 0 15px 0",
                  color: "#fff",
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: "600",
                }
              },
              title
            ),
            h(
              PieChart,
              {
                width: ${width},
                height: ${height},
                style: {
                  width: "100%",
                  maxWidth: "${width}px",
                  maxHeight: "${height}px",
                  aspectRatio: 1,
                }
              },
              [
                // Outer pie (or main pie if no inner data)
                h(
                  Pie,
                  {
                    data: data,
                    dataKey: "value",
                    cx: "50%",
                    cy: "50%",
                    innerRadius: hasInnerData ? innerRadiusPercent + "%" : innerRadiusPercent + "%",
                    outerRadius: hasInnerData ? "50%" : outerRadiusPercent + "%",
                    fill: "#8884d8",
                    isAnimationActive: animate,
                    label: showLabels && !hasInnerData ? (useCustomLabels ? renderCustomizedLabel : true) : false,
                    labelLine: showLabelLines && showLabels && !hasInnerData,
                  },
                  data.map((entry, index) =>
                    h(Cell, {
                      key: "cell-" + index,
                      fill: entry.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                    })
                  )
                ),
                // Inner pie (for two-level charts)
                hasInnerData && h(
                  Pie,
                  {
                    data: innerData,
                    dataKey: "value",
                    cx: "50%",
                    cy: "50%",
                    innerRadius: "60%",
                    outerRadius: outerRadiusPercent + "%",
                    fill: "#82ca9d",
                    isAnimationActive: animate,
                    label: showLabels ? (useCustomLabels ? renderCustomizedLabel : true) : false,
                    labelLine: showLabelLines && showLabels,
                  },
                  innerData.map((entry, index) =>
                    h(Cell, {
                      key: "cell-inner-" + index,
                      fill: entry.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                    })
                  )
                ),
              ]
            ),
          ]
        );
      }

      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");
      const root = ReactDOM.createRoot(jupyterLabReactComponentContainer);

      root.render(h(PieChartComponent));
    </script>
  `;
}

function pie(config: IPieConfig): void {
	const html = generatePieHtml(config);
	tslab.display.html(html);
}

pie.html = (config: IPieConfig): string => generatePieHtml(config);

export { pie };
