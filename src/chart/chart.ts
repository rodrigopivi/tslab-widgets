import type {
	AreaSeries as _AreaSeries,
	BarSeries as _BarSeries,
	BaselineSeries as _BaselineSeries,
	CandlestickSeries as _CandlestickSeries,
	createChart as _createChart,
	createSeriesMarkers as _createSeriesMarkers,
	HistogramSeries as _HistogramSeries,
	LineSeries as _LineSeries,
	CandlestickData,
	CustomData,
	DeepPartial,
	IChartApi,
	IPriceLine,
	ISeriesApi,
	LineData,
	MouseEventParams,
	PriceLineOptions,
	SeriesDataItemTypeMap,
	SeriesMarker,
	SolidColor,
	Time,
	TimeChartOptions,
	UTCTimestamp,
	WhitespaceData,
} from "lightweight-charts";

import type { default as _React } from "react";
import * as tslab from "tslab";

import { CDN_URLS } from "../config/versions";
import * as TP from "./plugins/tooltip";
import * as TL from "./plugins/trendLine";
import * as VL from "./plugins/verticalLine";
import * as VP from "./plugins/volumeProfile";

type IPriceLineOptions = Partial<PriceLineOptions> &
	Pick<PriceLineOptions, "price">;
type IDetailsChartData = {
	details?: {
		hideTimeAxis?: boolean;
		legends?: string[];
		linesWidth?: (1 | 2 | 3 | 4)[];
		priceLines?: IPriceLineOptions[];
		timeLines?: ({ time: Time } & Partial<VL.IVertLineOptions>)[];
		title?: string;
		tooltip?: Partial<TP.ITooltipPrimitiveOptions> &
			Required<Pick<TP.ITooltipPrimitiveOptions, "timeToTooltipContentMap">>;
	};
};
type IMarkerDetails = { legend: string; priceLines: PriceLineOptions[] };
type IMarkerChartData = {
	Marker?: ({ details?: IMarkerDetails } & SeriesMarker<Time>)[];
};
type ITrendLinesData = {
	TrendLines?: [TL.IPoint, TL.IPoint, TL.ITrendLineOptions?][];
};

type IVolumeProfileChartData = { VolumeProfile?: VP.VolumeProfileConfig };
// type IVolumeProfileChartData = { VolumeProfile?: VP.IVolumeProfileData };
type IChartData = {
	[K in keyof SeriesDataItemTypeMap]?: K extends "Line"
		? SeriesDataItemTypeMap[K][][]
		: SeriesDataItemTypeMap[K][];
} & IDetailsChartData &
	IMarkerChartData &
	ITrendLinesData &
	IVolumeProfileChartData;
type IChartOptions = {
	componentId?: string;
	height?: number;
	syncKey?: string;
	width?: number;
};

type SyncedChartInstance = {
	chart: IChartApi;
	series: ISeriesApi<
		"Area" | "Bar" | "Baseline" | "Candlestick" | "Histogram" | "Line"
	>;
};

declare let window: {
	syncedCharts?: Record<string, SyncedChartInstance[]>;
} & Window;

function JupyterChartComponentFactory(
	React: typeof _React,
	createChart: typeof _createChart,
	createSeriesMarkers: typeof _createSeriesMarkers,
	AreaSeries: typeof _AreaSeries,
	BarSeries: typeof _BarSeries,
	BaselineSeries: typeof _BaselineSeries,
	CandlestickSeries: typeof _CandlestickSeries,
	HistogramSeries: typeof _HistogramSeries,
	LineSeries: typeof _LineSeries,
	TrendLine: typeof TL.TrendLine,
	VertLine: typeof VL.VertLine,
	VolumeProfileSeries: typeof VP.VolumeProfileSeries,
	TooltipPrimitive: typeof TP.TooltipPrimitive,
) {
	const h = React.createElement;
	const styles = {
		centeredFlex: {
			alignItems: "center",
			display: "flex",
			flex: 1,
			justifyContent: "center",
		},
		legendWrapper: {
			backgroundColor: "#000000",
			display: "flex",
			flexDirection: "row",
			paddingLeft: 15,
			paddingRight: 15,
			paddingTop: 5,
			position: "relative",
		},
	};
	const chartOptions: DeepPartial<TimeChartOptions> = {
		autoSize: true,
		crosshair: { mode: 0 },
		grid: {
			horzLines: { color: "rgba(197, 203, 206, 0.2)" },
			vertLines: { color: "rgba(197, 203, 206, 0.2)" },
		},
		handleScroll: { vertTouchDrag: false },
		layout: {
			attributionLogo: false,
			background: { color: "#000", type: "solid" as SolidColor["type"] },
			textColor: "rgba(255, 255, 255, 0.9)",
		},
		leftPriceScale: { borderColor: "rgba(197, 203, 206, 1)", visible: true },
		rightPriceScale: { borderColor: "rgba(197, 203, 206, 0.8)", visible: true },
		timeScale: {
			borderColor: "#485c7b",
			minBarSpacing: 0.01,
			timeVisible: true,
		},
	};
	const lineDefaultColors = [
		"#40cbf9",
		"#ff00aa",
		"#00ff66",
		"#ff6600",
		"#ffff00",
		"#00ffcc",
		"#eae2b7ff",
		"#0000ff",
		"#f64848",
		"#ee00ff",
		"#8800ff",
		"#ff0000",
		"#0099ff",
	];

	const getCrosshairDataPoint = (
		series: ISeriesApi<
			"Area" | "Bar" | "Baseline" | "Candlestick" | "Histogram" | "Line"
		>,
		param: MouseEventParams<Time>,
	) => {
		if (!param.time) return null;
		const dataPoint = param.seriesData.get(series);
		return dataPoint || null;
	};

	const syncCrosshair = (
		chart: IChartApi,
		series: ISeriesApi<
			"Area" | "Bar" | "Baseline" | "Candlestick" | "Histogram" | "Line"
		>,
		dataPoint: CustomData<Time> | null,
	) => {
		if (
			dataPoint &&
			"time" in dataPoint &&
			dataPoint.time &&
			typeof dataPoint.time === "number"
		) {
			// Handle different series types
			let price: number;
			if ("value" in dataPoint && typeof dataPoint.value === "number") {
				price = dataPoint.value; // Line, Area, Baseline, Histogram
			} else if ("close" in dataPoint && typeof dataPoint.close === "number") {
				price = dataPoint.close; // Candlestick, Bar
			} else {
				return;
			}
			chart.setCrosshairPosition(price, dataPoint.time as UTCTimestamp, series);
			return;
		}
		chart.clearCrosshairPosition();
	};

	const syncCharts = (
		chart: IChartApi,
		series: ISeriesApi<
			"Area" | "Bar" | "Baseline" | "Candlestick" | "Histogram" | "Line"
		>,
		syncKey?: string,
	) => {
		if (typeof window === "undefined" || !syncKey) return;

		window.syncedCharts = window.syncedCharts || {};
		window.syncedCharts[syncKey] = window.syncedCharts[syncKey] || [];
		window.syncedCharts[syncKey].push({ chart, series });

		// Sync crosshair position across all charts
		chart.subscribeCrosshairMove((param) => {
			if (!window.syncedCharts?.[syncKey]) return;

			const dataPoint = getCrosshairDataPoint(series, param);

			for (const { chart: otherChart, series: otherSeries } of window
				.syncedCharts[syncKey]) {
				if (otherChart === chart) continue;
				syncCrosshair(otherChart, otherSeries, dataPoint);
			}
		});

		// Sync time scale (zoom/pan) across all charts
		chart.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
			if (!window.syncedCharts?.[syncKey]) return;

			for (const { chart: otherChart } of window.syncedCharts[syncKey]) {
				if (otherChart === chart) continue;
				otherChart.timeScale().setVisibleLogicalRange(timeRange as never);
			}
		});
	};

	const getPrecisionAndMinMove = (newLine: (LineData | WhitespaceData)[]) => {
		const firstV = newLine.find((l) => "value" in l && !!l);
		if (firstV && "value" in firstV) {
			if (firstV.value <= 0.1) {
				return { minMove: 0.00001, precision: 5 };
			}
			if (firstV.value <= 1) {
				return { minMove: 0.0001, precision: 4 };
			}
			if (firstV.value <= 10) {
				return { minMove: 0.001, precision: 3 };
			}
			if (firstV.value <= 100) {
				return { minMove: 0.01, precision: 2 };
			}
			if (firstV.value <= 1000) {
				return { minMove: 0.1, precision: 1 };
			}
		}
		return { minMove: 0, precision: 0 }; // 0 means default
	};

	function ChartComponent(
		props: IChartData &
			IChartOptions &
			Required<Pick<IChartOptions, "componentId">>,
	) {
		const {
			Area,
			Bar,
			Baseline,
			Candlestick,
			Histogram,
			Line,
			Marker,
			TrendLines,
			VolumeProfile,
			componentId,
			details,
			height,
			syncKey,
			width,
		} = props;
		const chartContainerRef = React.useRef<HTMLDivElement>(null);
		const [legendTexts, setLegendTexts] = React.useState<string[]>([]);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_priceLines, setPriceLines] = React.useState<IPriceLine[]>([]);
		React.useEffect(() => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			if (!chartContainerRef.current) {
				return () => {};
			}
			const options: typeof chartOptions = JSON.parse(
				JSON.stringify({
					...chartOptions,
					height,
					width,
				}),
			);
			if (details?.hideTimeAxis && options.timeScale) {
				options.timeScale.visible = false;
			}
			const chart = createChart(chartContainerRef.current, options);
			// chart.timeScale().fitContent();

			// Track which series to use for syncing (priority order)
			let syncSeries: ISeriesApi<
				"Area" | "Bar" | "Baseline" | "Candlestick" | "Histogram" | "Line"
			> | null = null;

			const areaSeries = Area && chart.addSeries(AreaSeries);
			if (areaSeries && Area) {
				areaSeries.setData(Area);
				if (!syncSeries) syncSeries = areaSeries;
			}
			const barSeries = Bar && chart.addSeries(BarSeries);
			if (barSeries && Bar) {
				barSeries.setData(Bar);
				if (!syncSeries) syncSeries = barSeries;
			}
			const baselineSeries = Baseline && chart.addSeries(BaselineSeries);
			if (baselineSeries && Baseline) {
				baselineSeries.setData(Baseline);
				if (!syncSeries) syncSeries = baselineSeries;
			}
			const newHistogramSeries =
				Histogram &&
				chart.addSeries(
					HistogramSeries,
					Candlestick
						? {
								color: "rgba(68, 72, 83, 0.7)",
								priceFormat: { type: "volume" },
								priceScaleId: "",
							}
						: undefined,
				);
			if (newHistogramSeries && Histogram) {
				newHistogramSeries.setData(Histogram);
				if (Candlestick) {
					newHistogramSeries
						.priceScale()
						.applyOptions({ scaleMargins: { bottom: 0, top: 0.8 } });
				}
				if (!syncSeries) syncSeries = newHistogramSeries;
			}
			const timeToDetailsMap: Record<number, IMarkerDetails[]> = {};
			const candlestickSeries =
				Candlestick && chart.addSeries(CandlestickSeries);

			let alreadyAddedMarkers = false;
			const addMarkers = (series: ISeriesApi<"Candlestick" | "Line">) => {
				if (alreadyAddedMarkers || !Marker?.length) {
					return;
				}
				alreadyAddedMarkers = true;
				const markers: SeriesMarker<Time>[] = [];
				for (const marker of Marker) {
					const numericTime = Number(marker.time);
					if (!Number.isNaN(numericTime) && marker.details) {
						timeToDetailsMap[numericTime] = timeToDetailsMap[numericTime] || [];
						timeToDetailsMap[numericTime].push(marker.details);
					}
					markers.push({ ...marker, text: marker.text });
				}
				createSeriesMarkers(series, markers);
			};
			let alreadyAddedTrendLines = false;
			const addTrendLines = (series: ISeriesApi<"Candlestick" | "Line">) => {
				if (alreadyAddedTrendLines || !TrendLines?.length) {
					return;
				}
				alreadyAddedTrendLines = true;
				for (const tl of TrendLines) {
					series.attachPrimitive(
						new TrendLine(chart, series, tl[0], tl[1], tl[2]),
					);
				}
			};
			let alreadyAddedTimeLines = false;
			const addTimeLines = (series: ISeriesApi<"Candlestick" | "Line">) => {
				if (alreadyAddedTimeLines || !details?.timeLines?.length) {
					return;
				}
				alreadyAddedTimeLines = true;
				for (const tl of details.timeLines) {
					const vertLine = new VertLine(chart, series, tl.time, tl);
					series.attachPrimitive(vertLine);
				}
			};
			let alreadyAddedPriceLines = false;
			const addPriceLines = (series: ISeriesApi<"Candlestick" | "Line">) => {
				if (alreadyAddedPriceLines || !details?.priceLines?.length) {
					return;
				}
				alreadyAddedPriceLines = true;
				details.priceLines.forEach((pl, idx) => {
					series.createPriceLine(getPriceLine(pl, idx));
				});
			};
			let alreadyAddedTooltip = false;
			const addTooltip = (series: ISeriesApi<"Candlestick" | "Line">) => {
				if (alreadyAddedTooltip || !details?.tooltip) {
					return;
				}
				alreadyAddedTooltip = true;
				const tooltipPrimitive = new TooltipPrimitive(details.tooltip);
				series.attachPrimitive(tooltipPrimitive);
			};

			if (candlestickSeries && Candlestick) {
				candlestickSeries.setData(Candlestick);
				addPriceLines(candlestickSeries);
				addMarkers(candlestickSeries);
				addTrendLines(candlestickSeries);
				if (VolumeProfile) {
					const ohlcv = Candlestick.map(
						(v) =>
							({
								...v,
								volume:
									"volume" in v && typeof v.volume === "number" ? v.volume : 0,
							}) as CandlestickData & { volume: number },
					);
					const vp = new VolumeProfileSeries(
						chart,
						candlestickSeries,
						VolumeProfile, // candlestickVPData,
						ohlcv,
					);
					candlestickSeries.attachPrimitive(vp);
				}
				addTimeLines(candlestickSeries);
				addTooltip(candlestickSeries);
				syncSeries = candlestickSeries; // Candlestick has highest priority
			}
			if (Line?.length) {
				Line.forEach((newLine, idx) => {
					const newLineSeries = chart.addSeries(LineSeries, {
						baseLineVisible: true,
						color: lineDefaultColors[idx],
						crosshairMarkerVisible: true,
						lastPriceAnimation: 0,
						lastValueVisible: true,
						lineWidth: details?.linesWidth?.[idx] || 1,
						priceLineVisible: Line.length <= 2,
					});
					newLineSeries.setData(newLine);
					const { minMove, precision } = getPrecisionAndMinMove(newLine);
					if (precision) {
						newLineSeries.applyOptions({ priceFormat: { minMove, precision } });
					}
					addMarkers(newLineSeries);
					addTrendLines(newLineSeries);
					addPriceLines(newLineSeries);
					addTimeLines(newLineSeries);
					addTooltip(newLineSeries);
					// Use first line series if no other series is available for syncing
					if (idx === 0 && !syncSeries) {
						syncSeries = newLineSeries;
					}
				});
			}

			// Apply sync to the selected series
			if (syncSeries) {
				syncCharts(chart, syncSeries, syncKey);
			}
			if (Marker && (candlestickSeries || alreadyAddedMarkers)) {
				chart.subscribeCrosshairMove((param) => {
					if (param.time) {
						const numericTime = Number(param.time);
						if (
							!Number.isNaN(numericTime) &&
							timeToDetailsMap[numericTime]?.length
						) {
							const legends: string[] = [];
							const newPriceLines: IPriceLine[] = [];
							for (const details of timeToDetailsMap[numericTime]) {
								if (candlestickSeries) {
									for (const priceLineOptions of details.priceLines) {
										newPriceLines.push(
											candlestickSeries.createPriceLine(priceLineOptions),
										);
									}
								}
								legends.push(details.legend);
							}
							setPriceLines((previousLines) => {
								if (candlestickSeries) {
									for (const prevLine of previousLines) {
										candlestickSeries.removePriceLine(prevLine);
									}
								}
								return newPriceLines;
							});
							setLegendTexts(
								timeToDetailsMap[numericTime].map((v) => v.legend),
							);
							return;
						}
					}
					setPriceLines((previousLines) => {
						if (candlestickSeries) {
							for (const prevLine of previousLines) {
								candlestickSeries.removePriceLine(prevLine);
							}
						}
						return [];
					});
					setLegendTexts([]);
				});
				chart.subscribeClick((param) => {
					if (param.time) {
						const numericTime = Number(param.time);
						if (
							!Number.isNaN(numericTime) &&
							timeToDetailsMap[numericTime]?.length
						) {
							window.alert(JSON.stringify(timeToDetailsMap[numericTime]));
						}
					}
				});
			}
			return () => {
				chart.remove();
			};
		}, [
			chartContainerRef,
			Area,
			Bar,
			Baseline,
			Candlestick,
			Histogram,
			Line,
			height,
			width,
			syncKey,
			Marker,
			TrendLines,
			VolumeProfile,
			componentId,
			details,
		]);
		const titleLegendsList =
			Line?.length && details?.legends?.length
				? details.legends.map((legend, idx) =>
						h(TitleLegend, { color: lineDefaultColors[idx], key: idx, legend }),
					)
				: null;

		return h("div", { style: { marginBottom: 10, marginRight: 10 } }, [
			h("div", { style: styles.legendWrapper }, [
				h("div", { style: styles.centeredFlex }, details?.title || "_"),
				titleLegendsList &&
					h("div", { style: styles.centeredFlex }, titleLegendsList),
			]),
			h("div", { ref: chartContainerRef, style: { position: "relative" } }),
			h(
				"div",
				{
					style: {
						backgroundColor: "#000",
						fontSize: 11,
						minHeight: 30,
						textAlign: "center",
						whiteSpace: "pre-line",
					},
				},
				legendTexts.map((legend, key) => h("div", { key }, legend)),
			),
		]);
	}

	function ChartComponents(
		props: { charts: IChartData[] } & IChartOptions &
			Required<Pick<IChartOptions, "componentId">>,
	) {
		const { componentId, height, syncKey, width } = props;
		const charts = groupArrayIntoPairs(props.charts);
		const chartRows = charts.map((row, idx) => {
			const cid1 = `${componentId}-${idx}-0`;
			const cid2 = `${componentId}-${idx}-1`;
			return h(
				"div",
				{
					key: `row-${idx}`,
					style: { display: "flex", flexDirection: "row", margin: "auto" },
				},
				[
					h(ChartComponent, {
						componentId: cid1,
						height,
						key: cid1,
						syncKey,
						width,
						...row[0],
					}),
					row[1]
						? h(ChartComponent, {
								componentId: cid2,
								height,
								key: cid2,
								syncKey,
								width,
								...row[1],
							})
						: null,
				],
			);
		});
		return h(
			"div",
			{ style: { display: "flex", flexDirection: "column" } },
			chartRows,
		);
	}

	function TitleLegend({ color, legend }: { color: string; legend: string }) {
		return h(
			"div",
			{
				style: {
					alignItems: "center",
					display: "flex",
					flexDirection: "row",
					marginRight: 10,
				},
			},
			[
				h("div", {
					style: {
						backgroundColor: color,
						height: 5,
						marginRight: 5,
						width: 5,
					},
				}),
				h("div", { style: { color, fontSize: 9 } }, legend),
			],
		);
	}

	function groupArrayIntoPairs<T>(arr: T[]): [T, T | undefined][] {
		const pairs: [T, T | undefined][] = [];
		for (let i = 0; i < arr.length; i += 2) {
			const pair: [T, T | undefined] = [arr[i], arr[i + 1]];
			pairs.push(pair);
		}
		return pairs;
	}

	function getPriceLine(opts: IPriceLineOptions, idx: number) {
		return {
			axisLabelVisible: opts.axisLabelVisible ?? true,
			color: opts.color ?? lineDefaultColors[idx],
			lineStyle: opts.lineStyle ?? (0 as const),
			lineVisible: opts.lineVisible ?? true,
			lineWidth: opts.lineWidth ?? (1 as const),
			price: opts.price,
			title: opts.title ?? "",
		};
	}
	return { ChartComponent, ChartComponents };
}

function chart(options: IChartOptions, chartsData: (IChartData | undefined)[]) {
	const width = options.width || 550;
	const height = options.height || 330;
	const componentId =
		options.componentId ||
		`_chart_widget${Math.random().toString(36).substring(2, 9)}`;
	const syncKey = options.syncKey;
	const w = options.width ? `width:${width + 30}px;` : "";
	const h = options.height ? `width:${height + 30}px;` : "";
	const charts = chartsData.filter((c) => Boolean(c));
	const html = `
    <div id="${componentId}" style="${w}${h}" />
    <script type="module">

      import React, { useEffect, useRef } from '${CDN_URLS.react}';
      import ReactDOM from "${CDN_URLS.reactDom}";
      import { createChart, createSeriesMarkers, AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, HistogramSeries, LineSeries } from '${CDN_URLS.lightweightCharts}';

      ${TL.TrendLinePaneRenderer.toString()}
      ${TL.TrendLinePaneView.toString()}
      ${TL.TrendLine.toString()}
      ${VL.VertLinePaneRenderer.toString()}
      ${VL.VertLinePaneView.toString()}
      ${VL.VertLineTimeAxisView.toString()}
      ${VL.VertLine.toString()}
      ${VP.VolumeProfileRenderer.toString()}
      ${VP.VolumeProfilePaneView.toString()}
      ${VP.VolumeProfileSeries.toString()}
      ${TP.TooltipElement.toString()}
      ${TP.MultiTouchCrosshairPaneView.toString()}
      ${TP.TooltipCrosshairLinePaneRenderer.toString()}
      ${TP.TooltipPrimitive.toString()}

      const ComponentFactory = ${JupyterChartComponentFactory.toString()};


      const { ChartComponents } = ComponentFactory(React, createChart, createSeriesMarkers, AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, HistogramSeries, LineSeries, TrendLine, VertLine, VolumeProfileSeries, TooltipPrimitive);

      const reactJupyterLabComponentId = '${componentId}';
      const jupyterLabReactComponentContainer = document.getElementById('${componentId}');

      const root = ReactDOM.createRoot(jupyterLabReactComponentContainer);
      root.render(React.createElement(
        ChartComponents,
        ${JSON.stringify({ charts, componentId, height, syncKey, width })},
      ));

    </script>
  `;
	tslab.display.html(html);
}
export { chart };
