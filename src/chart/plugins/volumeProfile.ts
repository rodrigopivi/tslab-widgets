import type {
	CandlestickData,
	Coordinate,
	IChartApi,
	IPrimitivePaneRenderer,
	IPrimitivePaneView,
	ISeriesApi,
	ISeriesPrimitive,
	SeriesType,
	Time,
} from "lightweight-charts";

type IVolumeProfileDataPoint = {
	negativeVolume: number;
	positiveVolume: number;
	price: number;
};
export type IVolumeProfileData = {
	fromTime: Time;
	toTime?: Time;
	position: "left" | "right";
	profile: IVolumeProfileDataPoint[];
}; // time: Time; width: number;

type IVolumeProfileItem = {
	widthNegative: number;
	widthPositive: number;
	y: Coordinate | null;
	height: number; // Add height to each item
};
type IVolumeProfileRendererData = {
	items: IVolumeProfileItem[];
	position: "left" | "right";
	top: Coordinate | null;
	widthNegative: number;
	widthPositive: number;
};

export class VolumeProfileRenderer implements IPrimitivePaneRenderer {
	constructor(private _data: IVolumeProfileRendererData) {}

	private positionsBox(
		position1Media: number,
		position2Media: number,
		pixelRatio: number,
	) {
		const scaledPosition1 = Math.round(pixelRatio * position1Media);
		const scaledPosition2 = Math.round(pixelRatio * position2Media);
		return {
			length: Math.abs(scaledPosition2 - scaledPosition1) + 1,
			position: Math.min(scaledPosition1, scaledPosition2),
		};
	}

	draw(target: Parameters<IPrimitivePaneRenderer["draw"]>[0]) {
		target.useBitmapCoordinateSpace((scope) => {
			if (this._data.top === null) return;
			this._data.items.forEach((row) => {
				if (row.y === null) return;
				const itemVerticalPos = this.positionsBox(
					row.y,
					row.y - row.height, // Use individual bar height
					scope.verticalPixelRatio,
				);
				scope.context.fillStyle = "rgba(40, 98, 255, 0.55)";
				const itemHorizontalPosP = this.positionsBox(
					this._data.position === "left" ? 0 : scope.mediaSize.width,
					this._data.position === "left"
						? row.widthPositive
						: scope.mediaSize.width - row.widthPositive,
					scope.horizontalPixelRatio,
				);
				scope.context.fillRect(
					itemHorizontalPosP.position,
					itemVerticalPos.position,
					itemHorizontalPosP.length,
					itemVerticalPos.length,
				);
				scope.context.fillStyle = "rgba(251, 191, 44, 0.55)";
				const itemHorizontalPosN = this.positionsBox(
					this._data.position === "left"
						? row.widthPositive
						: scope.mediaSize.width - row.widthPositive,
					this._data.position === "left"
						? row.widthNegative + row.widthPositive
						: scope.mediaSize.width - (row.widthNegative + row.widthPositive),
					scope.horizontalPixelRatio,
				);
				scope.context.fillRect(
					itemHorizontalPosN.position,
					itemVerticalPos.position,
					itemHorizontalPosN.length,
					itemVerticalPos.length,
				);
			});
		});
	}
}

export class VolumeProfilePaneView implements IPrimitivePaneView {
	private _items: IVolumeProfileItem[] = [];
	private _top: Coordinate | null = null;
	private _widthNegative = 0;
	private _widthPositive = 0;
	constructor(private _source: VolumeProfileSeries) {}
	renderer() {
		return new VolumeProfileRenderer({
			items: this._items,
			position: this._source.getContext().vpData.position,
			top: this._top,
			widthNegative: this._widthNegative,
			widthPositive: this._widthPositive,
		});
	}

	update() {
		const ctx = this._source.getContext();
		const data = ctx.vpData;
		const series = ctx.series;
		const timeScale = ctx.chart.timeScale();
		const vr = timeScale.getVisibleRange();
		if (!vr || data.fromTime > vr.to) {
			// hide visible range when context initial time is after chart visible time
			this._items = [];
			return { widthNegative: 0, widthPositive: 0 };
		}
		const _width = timeScale.width() * 0.33;

		// Get all y-coordinates for the price levels
		const yCoordinates = data.profile.map((row) =>
			series.priceToCoordinate(row.price),
		);

		// Calculate the maximum volume for scaling
		const maxVolume = data.profile.reduce(
			(acc, item) => Math.max(acc, item.positiveVolume + item.negativeVolume),
			0,
		);

		// Set the top coordinate (highest price)
		this._top = yCoordinates[0];

		// Create items with proper height calculation
		this._items = data.profile.map((row, index) => {
			let height = 1; // Minimum height

			// Calculate height based on the distance to the next price level
			if (index < data.profile.length - 1) {
				const currentY = yCoordinates[index];
				const nextY = yCoordinates[index + 1];

				if (currentY !== null && nextY !== null) {
					// Calculate the gap to the next bar
					height = Math.abs(currentY - nextY);

					// Adjust for the last bar - make it a bit shorter
					if (index === data.profile.length - 2) {
						height = Math.max(1, height * 0.8);
					}
				}
			} else {
				// For the last bar, use the same height as the previous bar
				const prevY = yCoordinates[index - 1];
				const currentY = yCoordinates[index];

				if (prevY !== null && currentY !== null) {
					height = Math.max(1, Math.abs(prevY - currentY) * 0.8);
				}
			}

			// Ensure minimum height
			height = Math.max(1, height);

			return {
				widthNegative: (_width * row.positiveVolume) / maxVolume,
				widthPositive: (_width * row.negativeVolume) / maxVolume,
				y: yCoordinates[index],
				height: height, // Add calculated height to each item
			};
		});
	}
}

export class VolumeProfileSeries implements ISeriesPrimitive {
	private _paneViews: VolumeProfilePaneView[];
	private _vpData: IVolumeProfileData;
	_vpIndex: null | number = null;
	constructor(
		private _chart: IChartApi,
		private _series: ISeriesApi<SeriesType>,
		_vpSettings: VolumeProfileConfig,
		ohlcv: (CandlestickData & { volume: number })[],
		// _rawSeries: (CandlestickData & { volume: number })[],
	) {
		this._vpData = this.createVolumeProfileFromOHLCV(ohlcv, _vpSettings);
		// window.alert(JSON.stringify(this._vpData));
		this._paneViews = [new VolumeProfilePaneView(this)];
	}
	getContext() {
		// window.alert(JSON.stringify(this._vpData));
		return { chart: this._chart, series: this._series, vpData: this._vpData };
	}
	paneViews() {
		return this._paneViews;
	}
	updateAllViews() {
		this._paneViews.forEach((pw) => {
			pw.update();
		});
	}

	createVolumeProfileFromOHLCV(
		ohlcvData: OHLCVDataPoint[],
		config: VolumeProfileConfig = {},
	): IVolumeProfileData {
		const {
			priceBins = 20,
			usePercentageBins = true,
			priceStep,
			fromTime = ohlcvData[0]?.time,
			toTime = ohlcvData[ohlcvData.length - 1]?.time,
			position = "right",
		} = config;

		// Filter data within the time range
		const filteredData = ohlcvData.filter((point) => {
			const isAfterFrom = !fromTime || point.time >= fromTime;
			const isBeforeTo = !toTime || point.time <= toTime;
			return isAfterFrom && isBeforeTo;
		});

		if (filteredData.length === 0) {
			throw new Error("No data in the specified time range");
		}

		// Find min and max prices in the filtered data
		const minPrice = Math.min(...filteredData.map((d) => d.low));
		const maxPrice = Math.max(...filteredData.map((d) => d.high));

		// Calculate price bins
		let priceLevels: number[];

		if (usePercentageBins) {
			// Create price levels based on percentage distribution
			const priceRange = maxPrice - minPrice;
			priceLevels = Array.from({ length: priceBins + 1 }, (_, i) => {
				return minPrice + (priceRange * i) / priceBins;
			});
		} else if (priceStep) {
			// Create price levels with fixed step
			const numBins = Math.ceil((maxPrice - minPrice) / priceStep);
			priceLevels = Array.from({ length: numBins + 1 }, (_, i) => {
				return minPrice + priceStep * i;
			});
		} else {
			// Default to percentage bins if no step specified
			const priceRange = maxPrice - minPrice;
			priceLevels = Array.from({ length: priceBins + 1 }, (_, i) => {
				return minPrice + (priceRange * i) / priceBins;
			});
		}

		// Initialize volume profile with zero volumes
		const profile: IVolumeProfileDataPoint[] = priceLevels.map((price) => ({
			price,
			positiveVolume: 0,
			negativeVolume: 0,
		}));

		// Distribute volume to price bins
		filteredData.forEach((dataPoint) => {
			const { open, close, volume } = dataPoint;
			const isUpBar = close >= open;

			// Find the appropriate price bin for this data point
			// For simplicity, we can distribute volume to the price level closest to the VWAP
			// or you can distribute based on the high-low range

			// Method 1: Simple - distribute to price levels within high-low range
			const relevantLevels = priceLevels.filter(
				(price) => price >= dataPoint.low && price <= dataPoint.high,
			);

			if (relevantLevels.length > 0) {
				const volumePerLevel = volume / relevantLevels.length;

				relevantLevels.forEach((price) => {
					const index = profile.findIndex((p) => p.price === price);
					if (index !== -1) {
						if (isUpBar) {
							profile[index].positiveVolume += volumePerLevel;
						} else {
							profile[index].negativeVolume += volumePerLevel;
						}
					}
				});
			} else {
				// Fallback: find the closest price level
				const closestPrice = priceLevels.reduce((prev, curr) => {
					const prevDiff = Math.abs(prev - dataPoint.close);
					const currDiff = Math.abs(curr - dataPoint.close);
					return currDiff < prevDiff ? curr : prev;
				});

				const index = profile.findIndex((p) => p.price === closestPrice);
				if (index !== -1) {
					if (isUpBar) {
						profile[index].positiveVolume += volume;
					} else {
						profile[index].negativeVolume += volume;
					}
				}
			}
		});

		// Filter out bins with zero volume (optional)
		const filteredProfile = profile.filter(
			(item) => item.positiveVolume > 0 || item.negativeVolume > 0,
		);

		// Sort by price descending (highest price first)
		filteredProfile.sort((a, b) => b.price - a.price);

		return {
			fromTime: fromTime || filteredData[0].time,
			position,
			profile: filteredProfile,
		};
	}
}

// ================================================================================

// Assuming you have an OHLCV data structure like this:
type OHLCVDataPoint = {
	time: Time;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
};

export type VolumeProfileConfig = {
	priceBins?: number; // Number of price levels to create
	usePercentageBins?: boolean; // Use percentage instead of fixed price intervals
	priceStep?: number; // Fixed price step between bins (if not using percentage)
	fromTime?: Time; // Start time for the profile
	toTime?: Time; // End time for the profile
	position?: "left" | "right"; // Position of the profile
};
