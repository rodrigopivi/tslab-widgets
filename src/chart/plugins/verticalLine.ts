import type {
  Coordinate,
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitiveAxisView,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  SeriesOptionsMap,
  SeriesType,
  Time,
} from 'lightweight-charts';

export type IVertLineOptions = {
  color: string;
  labelBackgroundColor: string;
  labelText: string;
  labelTextColor: string;
  showLabel: boolean;
  width: number;
};

export class VertLinePaneRenderer implements ISeriesPrimitivePaneRenderer {
  constructor(private _x: Coordinate | null, private _options: IVertLineOptions) { }
  draw(target: Parameters<ISeriesPrimitivePaneRenderer['draw']>[0]) {
    target.useBitmapCoordinateSpace(scope => {
      if (this._x === null) return;
      const ctx = scope.context;
      const scaledPosition = Math.round(scope.horizontalPixelRatio * this._x);
      const lineBitmapWidth = Math.round(this._options.width * scope.horizontalPixelRatio);
      const offset = Math.floor(lineBitmapWidth * 0.5);
      const position = { length: lineBitmapWidth, position: scaledPosition - offset };
      ctx.fillStyle = this._options.color;
      ctx.fillRect(position.position, 0, position.length, scope.bitmapSize.height);
    });
  }
}

export class VertLinePaneView implements ISeriesPrimitivePaneView {
  private _x: Coordinate | null = null;
  constructor(private _source: VertLine, private _options: IVertLineOptions) { }
  renderer() {
    return new VertLinePaneRenderer(this._x, this._options);
  }
  update() {
    const timeScale = this._source._chart.timeScale();
    this._x = timeScale.timeToCoordinate(this._source._time);
  }
}

export class VertLineTimeAxisView implements ISeriesPrimitiveAxisView {
  private _x: Coordinate | null = null;
  constructor(private _source: VertLine, private _options: IVertLineOptions) { }
  backColor() { return this._options.labelBackgroundColor; }
  coordinate() { return this._x ?? 0; }
  text() { return this._options.labelText; }
  textColor() { return this._options.labelTextColor; }
  tickVisible() { return this._options.showLabel; }
  update() {
    const timeScale = this._source._chart.timeScale();
    this._x = timeScale.timeToCoordinate(this._source._time);
  }
  visible() { return this._options.showLabel; }
}

export class VertLine implements ISeriesPrimitive {
  _chart: IChartApi;
  _paneViews: VertLinePaneView[];
  _series: ISeriesApi<keyof SeriesOptionsMap>;
  _time: Time;
  _timeAxisViews: VertLineTimeAxisView[];

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, time: Time, options?: Partial<IVertLineOptions>) {
    const defaultOptions = {
      color: 'green', labelBackgroundColor: 'green', labelText: '', labelTextColor: 'white', showLabel: false, width: 2,
    };
    const vertLineOptions: IVertLineOptions = { ...defaultOptions, ...options };
    this._chart = chart;
    this._series = series;
    this._time = time;
    this._paneViews = [new VertLinePaneView(this, vertLineOptions)];
    this._timeAxisViews = [new VertLineTimeAxisView(this, vertLineOptions)];
  }
  paneViews() { return this._paneViews; }
  timeAxisViews() { return this._timeAxisViews; }
  updateAllViews() {
    this._paneViews.forEach(pw => { pw.update(); });
    this._timeAxisViews.forEach(tw => { tw.update(); });
  }
}