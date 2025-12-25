import type {
	CandlestickData,
	IChartApi,
	IPrimitivePaneRenderer,
	IPrimitivePaneView,
	ISeriesPrimitive,
	LineData,
	MouseEventParams,
	PrimitivePaneViewZOrder,
	SeriesAttachedParameter,
	Time,
	WhitespaceData,
} from "lightweight-charts";

export type ITooltipCrosshairLineData = {
	color: string;
	topMargin: number;
	visible: boolean;
	x: number;
};

export type ITooltipOptions = {
	followMode: "top" | "tracking";
	/** fallback horizontal deadzone width */
	horizontalDeadzoneWidth: number;
	title: string;
	/** topOffset is the vertical spacing when followMode is 'top' */
	topOffset: number;
	verticalDeadzoneHeight: number;
	verticalSpacing: number;
};

export type ITooltipContentData = {
	content: string;
	title?: string;
	// price?: string;
	// date?: string;
	// time?: string;
};

export type ITooltipPosition = {
	paneX: number;
	paneY: number;
	visible: boolean;
};

export interface ITooltipPrimitiveOptions {
	lineColor: string;
	timeToTooltipContentMap?: Record<number, ITooltipContentData>;
	tooltip?: Partial<ITooltipOptions>;
	priceExtractor?: <T extends WhitespaceData>(dataPoint: T) => string;
}

export class TooltipCrosshairLinePaneRenderer
	implements IPrimitivePaneRenderer
{
	constructor(private _data: ITooltipCrosshairLineData) {}

	private positionsLine(
		positionMedia: number,
		pixelRatio: number,
		desiredWidthMedia = 1,
		widthIsBitmap?: boolean,
	) {
		const scaledPosition = Math.round(pixelRatio * positionMedia);
		const lineBitmapWidth = widthIsBitmap
			? desiredWidthMedia
			: Math.round(desiredWidthMedia * pixelRatio);
		const offset = Math.floor(lineBitmapWidth * 0.5);
		const position = scaledPosition - offset;
		return { length: lineBitmapWidth, position };
	}

	draw(target: CanvasRenderingTarget2D) {
		if (!this._data.visible) return;
		// biome-ignore lint/correctness/useHookAtTopLevel: useBitmapCoordinateSpace is not a React hook
		target.useBitmapCoordinateSpace(
			(scope: {
				context: CanvasRenderingContext2D;
				bitmapSize: { width: number; height: number };
				horizontalPixelRatio: number;
				verticalPixelRatio: number;
			}) => {
				const ctx = scope.context;
				const crosshairPos = this.positionsLine(
					this._data.x,
					scope.horizontalPixelRatio,
					1,
				);
				ctx.fillStyle = this._data.color;
				ctx.fillRect(
					crosshairPos.position,
					this._data.topMargin * scope.verticalPixelRatio,
					crosshairPos.length,
					scope.bitmapSize.height,
				);
			},
		);
	}
}

// Define CanvasRenderingTarget2D interface locally since we're not using fancy-canvas
interface CanvasRenderingTarget2D {
	useBitmapCoordinateSpace: (
		scope: (context: {
			context: CanvasRenderingContext2D;
			bitmapSize: { width: number; height: number };
			horizontalPixelRatio: number;
			verticalPixelRatio: number;
		}) => void,
	) => void;
}

export class TooltipElement {
	private _chart: IChartApi | null;
	private _contentElement: HTMLDivElement | null;
	private _element: HTMLDivElement | null;
	private _lastTooltipWidth: null | number = null;
	private _options: ITooltipOptions;
	private _titleElement: HTMLDivElement | null;
	// private _priceElement: HTMLDivElement | null;
	// private _dateElement: HTMLDivElement | null;
	// private _timeElement: HTMLDivElement | null;

	public constructor(chart: IChartApi, options: Partial<ITooltipOptions>) {
		this._options = {
			followMode: "tracking",
			horizontalDeadzoneWidth: 0,
			title: "",
			topOffset: 20,
			verticalDeadzoneHeight: 100,
			verticalSpacing: 20,
			...options,
		};
		this._chart = chart;

		const element = document.createElement("div");
		this.applyStyle(element, {
			position: "absolute",
			display: "flex",
			padding: "8px",
			"box-sizing": "border-box",
			"font-size": "12px",
			"text-align": "center",
			"z-index": "1000",
			top: "0px",
			left: "0px",
			"pointer-events": "none",
			"border-radius": "4px 4px 0px 0px",
			"border-bottom": "none",
			"margin-left": "8px",

			// "box-shadow": "0 2px 5px 0 rgba(117, 134, 150, 0.45)",
			"font-family":
				"-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
			"-webkit-font-smoothing": "antialiased",
			"-moz-osx-font-smoothing": "grayscale",

			// "align-items": "center",
			// "background-color": "rgba(120, 120, 120, 0.2)",
			// "box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.2)",
			// color: "#eee",
			"flex-direction": "column",
			// "font-weight": "400",
			// left: "0%",
			// "line-height": "13px",
			// opacity: "0",
			// top: "0",
			// transform: "translate(calc(0px - 50%), 0px)",
		});

		const titleElement = document.createElement("div");
		this.applyStyle(titleElement, {
			"font-size": "12px",
			"font-weight": "bold",
			"line-height": "14px",
			"margin-bottom": "4px",
			"text-align": "center",
			transform: "translate(calc(0px + 50%), 0px)",
		});
		this.setElementContent(titleElement, this._options.title);
		element.appendChild(titleElement);

		// const priceElement = document.createElement("div");
		// this.applyStyle(priceElement, {
		//   "font-size": "12px",
		//   "font-weight": "200",
		//   "margin-bottom": "2px",
		// });
		// this.setElementContent(priceElement, "");
		// element.appendChild(priceElement);

		// const dateElement = document.createElement("div");
		// this.setElementContent(dateElement, "");
		// element.appendChild(dateElement);

		// const timeElement = document.createElement("div");
		// this.setElementContent(timeElement, "");
		// element.appendChild(timeElement);

		// For backward compatibility, also keep the old content element
		const contentElement = document.createElement("div");
		contentElement.style.display = "none";
		this.applyStyle(contentElement, {
			transform: "translate(calc(0px + 50%), 0px)",
		});
		this.setElementContent(contentElement, "");
		element.appendChild(contentElement);

		this._element = element;
		this._titleElement = titleElement;
		// this._priceElement = priceElement;
		// this._dateElement = dateElement;
		// this._timeElement = timeElement;
		this._contentElement = contentElement;

		const chartElement = this._chart.chartElement();
		chartElement.appendChild(this._element);

		const chartElementParent = chartElement.parentElement;
		if (!chartElementParent) {
			console.error("Chart Element is not attached to the page.");
			return;
		}
		const position = getComputedStyle(chartElementParent).position;
		if (position !== "relative" && position !== "absolute") {
			console.error(
				"Chart Element position is expected be `relative` or `absolute`.",
			);
		}
	}

	private _calculateXPosition(
		positionData: ITooltipPosition,
		chart: IChartApi,
	): string {
		const x = positionData.paneX + chart.priceScale("left").width();
		const deadzoneWidth = this._lastTooltipWidth
			? Math.ceil(this._lastTooltipWidth / 2)
			: this._options.horizontalDeadzoneWidth;
		const w = chart.timeScale().width();
		const xAdjusted = w
			? Math.min(Math.max(deadzoneWidth, x), w - deadzoneWidth)
			: Math.max(deadzoneWidth, x);
		return `calc(${xAdjusted}px - 50%)`;
	}

	private _calculateYPosition(positionData: ITooltipPosition): string {
		if (this._options.followMode === "top") {
			return `${this._options.topOffset}px`;
		}
		const y = positionData.paneY;
		const flip =
			y <= this._options.verticalSpacing + this._options.verticalDeadzoneHeight;
		const yPx = y + (flip ? 1 : -1) * this._options.verticalSpacing;
		const yPct = flip ? "" : " - 100%";
		return `calc(${yPx}px${yPct})`;
	}

	private applyStyle(element: HTMLElement, styles: Record<string, string>) {
		for (const [key, value] of Object.entries(styles)) {
			element.style.setProperty(key, value);
		}
	}

	private setElementContent(element: HTMLDivElement | null, text: string) {
		if (!element || text === element.innerHTML) {
			return;
		}
		element.innerHTML = text;
		element.style.display = text ? "block" : "none";
	}

	public applyOptions(options: Partial<ITooltipOptions>) {
		this._options = { ...this._options, ...options };
	}

	public destroy() {
		if (this._chart && this._element) {
			this._chart.chartElement().removeChild(this._element);
		}
	}

	public options(): ITooltipOptions {
		return this._options;
	}

	public updatePosition(positionData: ITooltipPosition) {
		if (!this._chart || !this._element) {
			return;
		}
		this._element.style.opacity = positionData.visible ? "1" : "0";
		if (!positionData.visible) {
			return;
		}
		const x = this._calculateXPosition(positionData, this._chart);
		const y = this._calculateYPosition(positionData);
		this._element.style.transform = `translate(${x}, ${y})`;
	}

	public updateTooltipContent(tooltipContentData: ITooltipContentData) {
		if (!this._element) {
			return;
		}
		const tooltipMeasurement = this._element.getBoundingClientRect();
		this._lastTooltipWidth = tooltipMeasurement.width;

		// Update structured content
		if (tooltipContentData.title !== undefined && this._titleElement) {
			this.setElementContent(this._titleElement, tooltipContentData.title);
		}
		// if (tooltipContentData.price !== undefined && this._priceElement) {
		//   this.setElementContent(this._priceElement, tooltipContentData.price);
		// }
		// if (tooltipContentData.date !== undefined && this._dateElement) {
		//   this.setElementContent(this._dateElement, tooltipContentData.date);
		// }
		// if (tooltipContentData.time !== undefined && this._timeElement) {
		//   this.setElementContent(this._timeElement, tooltipContentData.time);
		// }

		// For backward compatibility, also update the old content element
		if (this._contentElement && tooltipContentData.content) {
			this.setElementContent(this._contentElement, tooltipContentData.content);
		}
	}
}

export class MultiTouchCrosshairPaneView implements IPrimitivePaneView {
	constructor(private _data: ITooltipCrosshairLineData) {}

	renderer(): IPrimitivePaneRenderer | null {
		return new TooltipCrosshairLinePaneRenderer(this._data);
	}

	update(data: ITooltipCrosshairLineData): void {
		this._data = data;
	}

	zOrder(): PrimitivePaneViewZOrder {
		return "bottom";
	}
}

export class TooltipPrimitive implements ISeriesPrimitive<Time> {
	_attachedParams: SeriesAttachedParameter<Time> | undefined;
	_data: ITooltipCrosshairLineData = {
		color: "rgba(0, 0, 0, 0.2)",
		topMargin: 0,
		visible: false,
		x: 0,
	};

	private _moveHandler = (param: MouseEventParams) => this._onMouseMove(param);
	private _options: ITooltipPrimitiveOptions;
	_paneViews: MultiTouchCrosshairPaneView[];

	private _tooltip: TooltipElement | undefined = undefined;

	constructor(options: Partial<ITooltipPrimitiveOptions>) {
		const defaultOptions: ITooltipPrimitiveOptions = {
			lineColor: "rgba(0, 0, 0, 0.2)",
			priceExtractor: (data: LineData | CandlestickData | WhitespaceData) => {
				if ((data as LineData).value !== undefined) {
					return (data as LineData).value.toFixed(2);
				}
				if ((data as CandlestickData).close !== undefined) {
					return (data as CandlestickData).close.toFixed(2);
				}
				return "";
			},
		};

		this._options = {
			...defaultOptions,
			...options,
		};
		this._paneViews = [new MultiTouchCrosshairPaneView(this._data)];
	}

	private _createTooltipElement() {
		const chart = this.chart();
		if (!chart) {
			throw new Error("Unable to create Tooltip element. Chart not attached");
		}
		this._tooltip = new TooltipElement(chart, { ...this._options.tooltip });
	}

	private _hide() {
		this._hideTooltip();
		this.setData({
			color: this.currentColor(),
			topMargin: 0,
			visible: false,
			x: 0,
		});
	}

	private _hideTooltip() {
		if (!this._tooltip) {
			return;
		}
		this._tooltip.updateTooltipContent({
			content: "",
			title: this._options.tooltip?.title || "",
			// price: "",
			// date: "",
			// time: "",
		});
		this._tooltip.updatePosition({ paneX: 0, paneY: 0, visible: false });
	}

	private _setCrosshairMode() {
		const chart = this.chart();
		if (!chart) {
			throw new Error(
				"Unable to change crosshair mode because the chart instance is undefined",
			);
		}
		chart.applyOptions({
			crosshair: {
				mode: 0, // CrosshairMode.Magnet
				vertLine: {
					visible: true,
					labelVisible: true,
				},
				horzLine: {
					visible: true,
					labelVisible: true,
				},
			},
		});
	}

	// private _formatDateAndTime(timestamp?: number): [string, string] {
	//   if (!timestamp) return ["", ""];
	//   const date = new Date(timestamp * 1000);
	//   const dateStr = date.toLocaleDateString();
	//   const timeStr = date.toLocaleTimeString();
	//   return [dateStr, timeStr];
	// }

	private _onMouseMove(param: MouseEventParams) {
		const chart = this.chart();
		const series = this.series();
		const logical = param.logical;
		if (logical === undefined || logical === null || !chart || !series) {
			this._hide();
			return;
		}

		const data = param.seriesData.get(series);
		if (!data) {
			this._hide();
			return;
		}

		const coordinate = chart.timeScale().logicalToCoordinate(logical);
		if (coordinate === null) {
			this._hide();
			return;
		}

		// Use the map if provided, otherwise use the price extractor
		let contentData: ITooltipContentData;

		if (this._options.timeToTooltipContentMap) {
			const mapData = this._options.timeToTooltipContentMap[Number(data.time)];
			if (mapData) {
				contentData = mapData;
			} else {
				// Fallback to price extractor
				// const price = this._options.priceExtractor?.(data) || "";
				// const [date, time] = this._formatDateAndTime(param.time as number);
				contentData = {
					// content: `${date} ${time} - ${price}`,
					content: "&nbsp;",
					// price,
					// date,
					// time,
				};
			}
		} else {
			// Use price extractor
			// const price = this._options.priceExtractor?.(data) || "";
			// const [date, time] = this._formatDateAndTime(param.time as number);
			contentData = {
				// content: `${date} ${time} - ${price}`,
				content: "&nbsp;",
				// price,
				// date,
				// time,
			};
		}

		if (this._tooltip) {
			const tooltipOptions = this._tooltip.options();
			const topMargin =
				tooltipOptions.followMode === "top" ? tooltipOptions.topOffset + 10 : 0;
			this.setData({
				color: this.currentColor(),
				topMargin,
				visible: true,
				x: coordinate,
			});
			this._tooltip.updateTooltipContent(contentData);
			this._tooltip.updatePosition({
				paneX: param.point?.x ?? 0,
				paneY: param.point?.y ?? 0,
				visible: true,
			});
		}
	}

	attached(param: SeriesAttachedParameter<Time>): void {
		this._attachedParams = param;
		this._setCrosshairMode(); // Set crosshair mode when attached
		param.chart.subscribeCrosshairMove(this._moveHandler);
		this._createTooltipElement();
	}

	chart() {
		return this._attachedParams?.chart;
	}

	currentColor() {
		return this._options.lineColor;
	}

	detached(): void {
		const chart = this.chart();
		if (chart) {
			chart.unsubscribeCrosshairMove(this._moveHandler);
		}
	}

	paneViews() {
		return this._paneViews;
	}

	series() {
		return this._attachedParams?.series;
	}

	setData(data: ITooltipCrosshairLineData) {
		this._data = data;
		this.updateAllViews();
		this._attachedParams?.requestUpdate();
	}

	updateAllViews() {
		this._paneViews.forEach((pw) => {
			pw.update(this._data);
		});
	}

	applyOptions(options: Partial<ITooltipPrimitiveOptions>) {
		this._options = { ...this._options, ...options };
		if (this._tooltip) {
			this._tooltip.applyOptions({ ...this._options.tooltip });
		}
	}
}
