import * as tslab from "tslab";
import { CDN_URLS } from "../config/versions";

function gauge(params: {
	sections?: { value: number; fill: string }[];
	value?: number;
	unit?: string;
	title?: string;
	size?: "S" | "M" | "L";
}) {
	const reactComponentId = `_gauge_widget${Math.random().toString(36).substring(2, 9)}`;
	const html = `
    <div id="${reactComponentId}" />
    <script type="module">
      import React from "${CDN_URLS.react}";
      import ReactDOM from "${CDN_URLS.reactDom}";
      
      import { Cell, Pie, PieChart, ZIndexLayer } from "${CDN_URLS.recharts}";

      const DEFAULT_SECTIONS = [
        { value: 25, fill: "#ef4444" },
        { value: 25, fill: "#f57c0bff" },
        { value: 25, fill: "#f5be0bff" },
        { value: 25, fill: "#10b981" },
      ];

      const TOTAL_VALUE = 100;

      const SIZE_CONFIG = {
        S: {
          width: 180,
          height: 170,
          chartWidth: 170,
          chartHeight: 120,
          baseRadius: 80,
          fontSize: {
            value: "20px",
            unit: "14px",
            percentage: "11px",
          },
          valueDisplayOffset: 32,
        },
        M: {
          width: 220,
          height: 180,
          chartWidth: 210,
          chartHeight: 120,
          baseRadius: 90,
          fontSize: {
            value: "28px",
            unit: "20px",
            percentage: "14px",
          },
          valueDisplayOffset: 38,
        },
        L: {
          width: 310,
          height: 230,
          chartWidth: 300,
          chartHeight: 175,
          baseRadius: 140,
          valueDisplayOffset: 38,
        },
      };

      function Needle({
        cx = 0,
        cy = 0,
        outerRadius = 0,
        value = 0,
        animate = true,
        baseRadius,
      }) {
        const needleBaseCenterX = cx;
        const needleBaseCenterY = cy;
        // Calculate angle based on value (0-180 degrees for half circle)
        const maxValue = TOTAL_VALUE;
        const calculatedAngle = value
          ? 180 - Math.min(Math.max((value / maxValue) * 180, 0), 180)
          : 180;

        // Needle dimensions
        const needleLength = outerRadius * 0.94;
        const needleWidth = Math.max(2, baseRadius * 0.04); // Proportional to size

        const needlePath =
          "M " + needleBaseCenterX.toString() +
          " " + (needleBaseCenterY - needleWidth / 2).toString() +
          " L " + (needleBaseCenterX + needleLength).toString() +
          " " + (needleBaseCenterY - 1).toString() +
          " L " + (needleBaseCenterX + needleLength).toString() +
          " " + (needleBaseCenterY + 1).toString() +
          " L " + needleBaseCenterX.toString() +
          " " + (needleBaseCenterY + needleWidth / 2).toString() +
          " Z";

        return h("g", { style: { cursor: "pointer" } }, [
          h("defs", {}, [
            // Needle gradient
            h(
              "linearGradient",
              {
                id: "needleGradient",
                x1: "0%",
                y1: "0%",
                x2: "100%",
                y2: "0%",
              },
              [
                h("stop", { offset: "0%", stopColor: "#778599" }, []),
                h("stop", { offset: "100%", stopColor: "#4e596b" }, []),
              ],
            ),
            // Needle shadow
            h(
              "filter",
              {
                id: "needleShadow",
                x: "-50%",
                y: "-50%",
                width: "200%",
                height: "200%",
              },
              [
                h("feDropShadow", {
                  dx: "2",
                  dy: "2",
                  stdDeviation: "3",
                  floodOpacity: "0.3",
                }),
              ],
            ),
            // Needle base gradient
            h("radialGradient", { id: "needleBaseGradient" }, [
              h("stop", { offset: "0%", stopColor: "#64748b" }),
              h("stop", { offset: "100%", stopColor: "#334155" }),
            ]),
          ]),

          // Needle base
          h("circle", {
            cx: needleBaseCenterX,
            cy: needleBaseCenterY,
            r: baseRadius * 0.06,
            fill: "url(#needleBaseGradient)",
            stroke: "#475569",
            strokeWidth: "1.5",
            filter: "url(#needleShadow)",
            style: {
              transition: animate ? "all 0.3s ease" : "none",
              zIndex: 100,
            },
          }),

          // Needle pointer
          h("path", {
            d: needlePath,
            fill: "url(#needleGradient)",
            stroke: "#334155",
            strokeWidth: "1",
            filter: "url(#needleShadow)",
            style: {
              transform: "rotate(-" + calculatedAngle.toString() + "deg)",
              transformOrigin:
                needleBaseCenterX.toString() +
                "px " +
                needleBaseCenterY.toString() +
                "px",
              transition: animate
                ? "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "none",
              zIndex: 99,
            },
          }),

          // Needle tip accent
          h("circle", {
            cx: needleBaseCenterX + needleLength,
            cy: needleBaseCenterY,
            r: baseRadius * 0.02,
            fill: "#334155",
            stroke: "#94a3b8",
            strokeWidth: "1",
            style: {
              transform: "rotate(-" + calculatedAngle.toString() + "deg)",
              transformOrigin:
                needleBaseCenterX.toString() +
                "px " +
                needleBaseCenterY.toString() +
                "px",
              transition: animate
                ? "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "none",
            },
          }),
        ]);
      }

      function HalfPie({
        animateSegments = true,
        baseRadius,
        centerX,
        centerY,
        sections = DEFAULT_SECTIONS,
        ...pieProps
      }) {
        const outerRadius = baseRadius;
        const innerRadius = baseRadius * 0.7;
        return h(
          Pie,
          {
            ...pieProps,
            stroke: "none",
            dataKey: "value",
            startAngle: 180,
            endAngle: 0,
            data: sections,
            cx: centerX,
            cy: centerY,
            innerRadius,
            outerRadius,
            isAnimationActive: animateSegments,
            animationDuration: 600,
            animationEasing: "ease-out",
            style: { marginLeft: 0 },
          },
          sections.map((entry, i) =>
            h(Cell, {
              key: "cell-" + entry.fill.toString() + "-" + i.toString(),
              fill: entry.fill,
              style: {
                filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))",
                stroke: "rgba(255,255,255,0.4)",
                strokeWidth: 0.5,
              },
            }),
          ),
        );
      }

      function ValueDisplay({
        value,
        totalValue,
        title,
        unit = "",
        centerX,
        centerY,
        offsetY,
      }) {
        const percentage = ((value / totalValue) * 100).toFixed(1);

        return h(
          "div",
          {
            style: {
              position: "absolute",
              top: (centerY + offsetY).toString() + "px",
              left: (centerX + 5).toString() + "px",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 90,
            },
          },
          [
            h(
              "div",
              {
                style: {
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#fff7fa",
                  lineHeight: "1",
                  marginBottom: "2px",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.5px",
                },
              },
              [
                value,
                h(
                  "span",
                  {
                    style: {
                      fontSize: "20px",
                      color: "#64748b",
                      marginLeft: "2px",
                      fontWeight: "500",
                    },
                  },
                  [unit],
                ),

                h(
                  "div",
                  {
                    style: {
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: "500",
                      marginTop: "2px",
                    },
                  },
                  [
                    title || percentage.toString() + "% of " + totalValue.toString() + " " + unit,
                  ],
                ),
              ],
            ),
          ],
        );
      }

      function GaugeWithNeedle({
        isAnimationActive = true,
        showValueDisplay = true,
        currentValue = 0,
        sections,
        unit = "",
        size = "M",
        title = "",
      }) {
        const totalValue = TOTAL_VALUE;
        const displayValue = currentValue || 0;
        const config = SIZE_CONFIG[size];
        const { width, height, chartWidth, chartHeight, baseRadius } = config;
        const centerX = chartWidth / 2;
        const centerY = chartHeight * 0.9; // 90% down for visual balance

        return h(
          "div",
          {
            style: {
              position: "relative",
              width: width.toString() + "px",
              height: height.toString() + "px",
              margin: "0 auto",
              pointerEvents: "none",
              outline: "none",
              backgroundColor: "#1F1826",
            },
          },
          [
            h(PieChart, { width: chartWidth, height: chartHeight }, [
              h(HalfPie, {
                isAnimationActive: isAnimationActive,
                animateSegments: isAnimationActive,
                baseRadius: baseRadius,
                centerX: centerX,
                centerY: centerY - 5,
                sections: sections,
              }),
              h(ZIndexLayer, { zIndex: 800 }, [
              	h(Needle, {
              		cx: centerX + 5,
              		cy: centerY,
              		outerRadius: baseRadius - 12,
              		value: displayValue,
              		animate: isAnimationActive,
              		baseRadius: baseRadius,
              	}),
              ]),
            ]),
            showValueDisplay &&
              h(ValueDisplay, {
                value: displayValue,
                totalValue: totalValue,
                unit: unit,
                centerX: centerX,
                centerY: centerY,
                offsetY: config.valueDisplayOffset,
                title: title,
              }),
          ],
        );
      }

      
      const h = React.createElement;
      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");
      const root = ReactDOM.createRoot(jupyterLabReactComponentContainer);

      root.render(
        h('div', {}, [
          h(GaugeWithNeedle, {
            sections: ${JSON.stringify(params.sections || undefined)},
            title: "${params.title}",
            currentValue: ${params.value},
            unit: "${params.unit}",
            size: "${params.size}",
          })
        ])
      );

    </script>
  `;
	tslab.display.html(html);
}

export { gauge };
