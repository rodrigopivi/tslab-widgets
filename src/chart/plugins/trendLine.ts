import {
  AutoscaleInfo,
  Coordinate,
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  Logical,
  SeriesType,
  Time,
} from 'lightweight-charts';

export type IPoint = { price: number; time: Time; }
export type IViewPoint = { x: Coordinate | null; y: Coordinate | null; }

export type ITrendLineOptions = { lineColor: string; width: number; }

export class TrendLinePaneRenderer implements ISeriesPrimitivePaneRenderer {
  constructor(private p1: IViewPoint, private p2: IViewPoint, private options: ITrendLineOptions) { }

  draw(target: Parameters<ISeriesPrimitivePaneRenderer['draw']>[0]) {
    target.useBitmapCoordinateSpace(scope => {
      if (this.p1.x === null || this.p1.y === null || this.p2.x === null || this.p2.y === null) { return; }
      const ctx = scope.context;
      const x1Scaled = Math.round(this.p1.x * scope.horizontalPixelRatio);
      const y1Scaled = Math.round(this.p1.y * scope.verticalPixelRatio);
      const x2Scaled = Math.round(this.p2.x * scope.horizontalPixelRatio);
      const y2Scaled = Math.round(this.p2.y * scope.verticalPixelRatio);
      ctx.lineWidth = this.options.width;
      ctx.strokeStyle = this.options.lineColor;
      ctx.beginPath();
      ctx.moveTo(x1Scaled, y1Scaled);
      ctx.lineTo(x2Scaled, y2Scaled);
      ctx.stroke();
    });
  }
}

export class TrendLinePaneView implements ISeriesPrimitivePaneView {
  private p1: IViewPoint = { x: null, y: null };
  private p2: IViewPoint = { x: null, y: null };

  constructor(private source: TrendLine) { }

  renderer() {
    return new TrendLinePaneRenderer(this.p1, this.p2, this.source.options);
  }

  update() {
    const series = this.source.series;
    const y1 = series.priceToCoordinate(this.source.p1.price);
    const y2 = series.priceToCoordinate(this.source.p2.price);
    const timeScale = this.source.chart.timeScale();
    const x1 = timeScale.timeToCoordinate(this.source.p1.time);
    const x2 = timeScale.timeToCoordinate(this.source.p2.time);
    this.p1 = { x: x1, y: y1 };
    this.p2 = { x: x2, y: y2 };
  }
}

export class TrendLine implements ISeriesPrimitive {
  private _paneViews: TrendLinePaneView[];
  public maxPrice: number;
  public minPrice: number;
  public options: ITrendLineOptions;

  constructor(
    public chart: IChartApi,
    public series: ISeriesApi<SeriesType>,
    public p1: IPoint,
    public p2: IPoint,
    options?: Partial<ITrendLineOptions>
  ) {
    this.minPrice = Math.min(this.p1.price, this.p2.price);
    this.maxPrice = Math.max(this.p1.price, this.p2.price);
    this.options = {
      lineColor: '#ff5aff', width: 3, ...options,
    };
    this._paneViews = [new TrendLinePaneView(this)];
  }

  private pointIndex(p: IPoint): null | number {
    const coordinate = this.chart.timeScale().timeToCoordinate(p.time);
    if (coordinate === null) { return null; }
    return this.chart.timeScale().coordinateToLogical(coordinate);
  }

  autoscaleInfo(startTimePoint: Logical, endTimePoint: Logical): AutoscaleInfo | null {
    const p1Index = this.pointIndex(this.p1);
    const p2Index = this.pointIndex(this.p2);
    if (p1Index === null || p2Index === null) { return null; }
    if (endTimePoint < p1Index || startTimePoint > p2Index) { return null; }
    return { priceRange: { maxValue: this.maxPrice, minValue: this.minPrice } };
  }

  paneViews() {
    return this._paneViews;
  }

  updateAllViews() {
    this._paneViews.forEach(pw => { pw.update(); });
  }
}