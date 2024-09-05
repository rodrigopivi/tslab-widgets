import type {
  Coordinate,
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  SeriesType,
  Time,
} from 'lightweight-charts';

type IVolumeProfileDataPoint = { negativeVolume: number; positiveVolume: number; price: number; };
export type IVolumeProfileData = { fromTime: Time; position: 'left' | 'right'; profile: IVolumeProfileDataPoint[]; }; // time: Time; width: number;

type IVolumeProfileItem = { widthNegative: number; widthPositive: number; y: Coordinate | null; };
type IVolumeProfileRendererData = {
  columnHeight: number;
  items: IVolumeProfileItem[];
  position: 'left' | 'right';
  top: Coordinate | null;
  widthNegative: number;
  widthPositive: number;
};

export class VolumeProfileRenderer implements ISeriesPrimitivePaneRenderer {
  constructor(private _data: IVolumeProfileRendererData) { }

  private positionsBox(position1Media: number, position2Media: number, pixelRatio: number) {
    const scaledPosition1 = Math.round(pixelRatio * position1Media);
    const scaledPosition2 = Math.round(pixelRatio * position2Media);
    return {
      length: Math.abs(scaledPosition2 - scaledPosition1) + 1,
      position: Math.min(scaledPosition1, scaledPosition2),
    };
  }

  draw(target: Parameters<ISeriesPrimitivePaneRenderer['draw']>[0]) {
    target.useBitmapCoordinateSpace(scope => {
      if (this._data.top === null) return;
      this._data.items.forEach(row => {
        if (row.y === null) return;
        const itemVerticalPos = this.positionsBox(row.y, row.y - this._data.columnHeight, scope.verticalPixelRatio);
        scope.context.fillStyle = 'rgba(40, 98, 255, 0.55)';
        const itemHorizontalPosP = this.positionsBox(
          this._data.position === 'left' ? 0 : scope.mediaSize.width,
          this._data.position === 'left' ? row.widthPositive : (scope.mediaSize.width - row.widthPositive),
          scope.horizontalPixelRatio
        );
        scope.context.fillRect(itemHorizontalPosP.position, itemVerticalPos.position, itemHorizontalPosP.length, itemVerticalPos.length - 2);
        scope.context.fillStyle = 'rgba(251, 191, 44, 0.55)';
        const itemHorizontalPosN = this.positionsBox(
          this._data.position === 'left' ? row.widthPositive : (scope.mediaSize.width - row.widthPositive),
          this._data.position === 'left' ? (row.widthNegative + row.widthPositive) : (scope.mediaSize.width - (row.widthNegative + row.widthPositive)),
          scope.horizontalPixelRatio
        );
        scope.context.fillRect(itemHorizontalPosN.position, itemVerticalPos.position, itemHorizontalPosN.length, itemVerticalPos.length - 2);
      });
    });
  }
}

export class VolumeProfilePaneView implements ISeriesPrimitivePaneView {
  private _columnHeight = 0;
  private _items: IVolumeProfileItem[] = [];
  private _top: Coordinate | null = null;
  private _widthNegative = 0;
  private _widthPositive = 0;
  constructor(private _source: VolumeProfileSeries) { }
  renderer() {
    return new VolumeProfileRenderer({
      columnHeight: this._columnHeight,
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
    if (!vr || data.fromTime > vr.to) { // hide visible range when context initial time is after chart visible time
      this._items = [];
      return { widthNegative: 0, widthPositive: 0 };
    }
    const _width = timeScale.width() * 0.33;

    const y1 = series.priceToCoordinate(data.profile[0].price) ?? (0 as Coordinate);
    const y2 = series.priceToCoordinate(data.profile[1].price) ?? (timeScale.height() as Coordinate);
    this._columnHeight = Math.max(1, y1 - y2);
    const maxVolume = data.profile.reduce((acc, item) => Math.max(acc, item.positiveVolume + item.negativeVolume), 0);
    this._top = y1;
    this._items = data.profile.map(row => {
      return {
        widthNegative: (_width * row.positiveVolume) / maxVolume,
        widthPositive: (_width * row.negativeVolume) / maxVolume,
        y: series.priceToCoordinate(row.price),
      };
    });
  }
}

export class VolumeProfileSeries implements ISeriesPrimitive {
  private _paneViews: VolumeProfilePaneView[];
  _vpIndex: null | number = null;
  constructor(private _chart: IChartApi, private _series: ISeriesApi<SeriesType>, private _vpData: IVolumeProfileData) {
    this._paneViews = [new VolumeProfilePaneView(this)];
  }
  getContext() { return { chart: this._chart, series: this._series, vpData: this._vpData }; }
  paneViews() { return this._paneViews; }
  updateAllViews() { this._paneViews.forEach(pw => { pw.update(); }); }
}
