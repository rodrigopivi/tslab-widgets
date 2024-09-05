import type {
  IChartApi,
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  MouseEventParams,
  SeriesAttachedParameter,
  SeriesPrimitivePaneViewZOrder,
} from 'lightweight-charts';


export type ITooltipCrosshairLineData = { color: string; topMargin: number; visible: boolean; x: number; }
export type ITooltipOptions = {
  followMode: 'top' | 'tracking';
  /** fallback horizontal deadzone width */
  horizontalDeadzoneWidth: number;
  title: string;
  /** topOffset is the vertical spacing when followMode is 'top' */
  topOffset: number;
  verticalDeadzoneHeight: number;
  verticalSpacing: number;
}
export type ITooltipContentData = { content: string; title?: string; }
export type ITooltipPosition = { paneX: number; paneY: number; visible: boolean; }
export type ITooltipPrimitiveOptions = {
  lineColor: string;
  timeToTooltipContentMap: Record<number, ITooltipContentData>;
  tooltip?: Partial<ITooltipOptions>;
}

export class TooltipCrosshairLinePaneRenderer implements ISeriesPrimitivePaneRenderer {
  constructor(private _data: ITooltipCrosshairLineData) { }

  private positionsLine(positionMedia: number, pixelRatio: number, desiredWidthMedia = 1, widthIsBitmap?: boolean) {
    const scaledPosition = Math.round(pixelRatio * positionMedia);
    const lineBitmapWidth = widthIsBitmap ? desiredWidthMedia : Math.round(desiredWidthMedia * pixelRatio);
    const offset = Math.floor(lineBitmapWidth * 0.5);
    const position = scaledPosition - offset;
    return { length: lineBitmapWidth, position };
  }

  draw(target: Parameters<ISeriesPrimitivePaneRenderer['draw']>[0]) {
    if (!this._data.visible) return;
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const crosshairPos = this.positionsLine(this._data.x, scope.horizontalPixelRatio, 1);
      ctx.fillStyle = this._data.color;
      ctx.fillRect(
        crosshairPos.position,
        this._data.topMargin * scope.verticalPixelRatio,
        crosshairPos.length,
        scope.bitmapSize.height
      );
    });
  }
}

export class TooltipElement {
  private _chart: IChartApi | null;
  private _contentElement: HTMLDivElement | null;
  private _element: HTMLDivElement | null;
  private _lastTooltipWidth: null | number = null;
  private _options: ITooltipOptions;
  private _titleElement: HTMLDivElement | null;

  public constructor(chart: IChartApi, options: Partial<ITooltipOptions>) {
    this._options = {
      followMode: 'tracking',
      horizontalDeadzoneWidth: 0,
      title: '',
      topOffset: 20,
      verticalDeadzoneHeight: 100,
      verticalSpacing: 20,
      ...options,
    };
    this._chart = chart;

    const element = document.createElement('div');
    this.applyStyle(element, {
      'align-items': 'center',
      'background-color': 'rgba(80, 80, 80, 0.2)',
      'border-radius': '4px',
      'box-shadow': '0px 2px 4px rgba(0, 0, 0, 0.2)',
      color: '#DDD',
      display: 'flex',
      'flex-direction': 'column',
      'font-size': '11px',
      'font-weight': '400',
      left: '0%',
      'line-height': '13px',
      opacity: '0',
      padding: '5px 10px',
      'pointer-events': 'none',
      position: 'absolute',
      top: '0',
      transform: 'translate(calc(0px - 50%), 0px)',
      'z-index': '100',
    });

    const titleElement = document.createElement('div');
    this.applyStyle(titleElement, {
      'font-size': '12px',
      'font-weight': '590',
      'line-height': '16px',
    });
    this.setElementContent(titleElement, this._options.title);
    element.appendChild(titleElement);

    const contentElement = document.createElement('div');
    this.setElementContent(contentElement, '');
    element.appendChild(contentElement);

    this._element = element;
    this._titleElement = titleElement;
    this._contentElement = contentElement;

    const chartElement = this._chart.chartElement();
    chartElement.appendChild(this._element);

    const chartElementParent = chartElement.parentElement;
    if (!chartElementParent) {
      console.error('Chart Element is not attached to the page.');
      return;
    }
    const position = getComputedStyle(chartElementParent).position;
    if (position !== 'relative' && position !== 'absolute') { console.error('Chart Element position is expected be `relative` or `absolute`.'); }
  }

  private _calculateXPosition(positionData: ITooltipPosition, chart: IChartApi): string {
    const x = positionData.paneX + chart.priceScale('left').width();
    const deadzoneWidth = this._lastTooltipWidth
      ? Math.ceil(this._lastTooltipWidth / 2)
      : this._options.horizontalDeadzoneWidth;
    const w = chart.timeScale().width();
    const xAdjusted = w ? Math.min(Math.max(deadzoneWidth, x), w - deadzoneWidth) : Math.max(deadzoneWidth, x);
    return `calc(${xAdjusted}px - 50%)`;
  }

  private _calculateYPosition(positionData: ITooltipPosition): string {
    if (this._options.followMode === 'top') { return `${this._options.topOffset}px`; }
    const y = positionData.paneY;
    const flip = y <= this._options.verticalSpacing + this._options.verticalDeadzoneHeight;
    const yPx = y + (flip ? 1 : -1) * this._options.verticalSpacing;
    const yPct = flip ? '' : ' - 100%';
    return `calc(${yPx}px${yPct})`;
  }

  private applyStyle(element: HTMLElement, styles: Record<string, string>) {
    for (const [key, value] of Object.entries(styles)) { element.style.setProperty(key, value); }
  }

  private setElementContent(element: HTMLDivElement | null, text: string) {
    if (!element || text === element.innerHTML) { return; }
    element.innerHTML = text;
    element.style.display = text ? 'block' : 'none';
  }

  public applyOptions(options: Partial<ITooltipOptions>) {
    this._options = { ...this._options, ...options };
  }

  public destroy() {
    if (this._chart && this._element) { this._chart.chartElement().removeChild(this._element); }
  }

  public options(): ITooltipOptions { return this._options; }

  public updatePosition(positionData: ITooltipPosition) {
    if (!this._chart || !this._element) { return; }
    this._element.style.opacity = positionData.visible ? '1' : '0';
    if (!positionData.visible) { return; }
    const x = this._calculateXPosition(positionData, this._chart);
    const y = this._calculateYPosition(positionData);
    this._element.style.transform = `translate(${x}, ${y})`;
  }

  public updateTooltipContent(tooltipContentData: ITooltipContentData) {
    if (!this._element) { return; }
    const tooltipMeasurement = this._element.getBoundingClientRect();
    this._lastTooltipWidth = tooltipMeasurement.width;
    if (tooltipContentData.title !== undefined && this._titleElement) {
      this.setElementContent(this._titleElement, tooltipContentData.title);
    }
    this.setElementContent(this._contentElement, tooltipContentData.content);
  }
}

export class MultiTouchCrosshairPaneView implements ISeriesPrimitivePaneView {
  constructor(private _data: ITooltipCrosshairLineData) { }
  renderer(): ISeriesPrimitivePaneRenderer | null { return new TooltipCrosshairLinePaneRenderer(this._data); }
  update(data: ITooltipCrosshairLineData): void { this._data = data; }
  zOrder(): SeriesPrimitivePaneViewZOrder { return 'bottom'; }
}

export class TooltipPrimitive implements ISeriesPrimitive {
  _attachedParams: SeriesAttachedParameter | undefined;
  _data: ITooltipCrosshairLineData = { color: 'rgba(0, 0, 0, 0.2)', topMargin: 0, visible: false, x: 0 };
  private _moveHandler = (param: MouseEventParams) => this._onMouseMove(param);
  private _options: ITooltipPrimitiveOptions;
  _paneViews: MultiTouchCrosshairPaneView[];

  private _tooltip: TooltipElement | undefined = undefined;

  constructor(options: Partial<ITooltipPrimitiveOptions> & Required<Pick<ITooltipPrimitiveOptions, 'timeToTooltipContentMap'>>) {
    this._options = {
      ...{
        lineColor: 'rgba(0, 2550, 250, 0.5)',
      },
      ...options,
    };
    this._paneViews = [new MultiTouchCrosshairPaneView(this._data)];
  }

  private _createTooltipElement() {
    const chart = this.chart();
    if (!chart) { throw new Error('Unable to create Tooltip element. Chart not attached'); }
    this._tooltip = new TooltipElement(chart, { ...this._options.tooltip });
  }

  private _hide() {
    this._hideTooltip();
    this.setData({ color: this.currentColor(), topMargin: 0, visible: false, x: 0 });
  }

  private _hideTooltip() {
    if (!this._tooltip) { return; }
    this._tooltip.updateTooltipContent({ content: '', title: '' });
    this._tooltip.updatePosition({ paneX: 0, paneY: 0, visible: false });
  }

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
    const content = this._options.timeToTooltipContentMap[Number(data.time)];
    const coordinate = chart.timeScale().logicalToCoordinate(logical);
    if (this._tooltip) {
      const tooltipOptions = this._tooltip.options();
      const topMargin = tooltipOptions.followMode === 'top' ? tooltipOptions.topOffset + 10 : 0;
      this.setData({ color: this.currentColor(), topMargin, visible: coordinate !== null, x: coordinate ?? 0 });
      this._tooltip.updateTooltipContent(content);
      this._tooltip.updatePosition({
        paneX: param.point?.x ?? 0,
        paneY: param.point?.y ?? 0,
        visible: true,
      });
    }
  }

  applyOptions(options: Partial<ITooltipPrimitiveOptions>) {
    this._options = { ...this._options, ...options };
    if (this._tooltip) {
      this._tooltip.applyOptions({ ...this._options.tooltip });
    }
  }

  attached(param: SeriesAttachedParameter): void {
    this._attachedParams = param;
    param.chart.subscribeCrosshairMove(this._moveHandler);
    this._createTooltipElement();
  }

  chart() { return this._attachedParams?.chart; }

  currentColor() { return this._options.lineColor; }

  detached(): void {
    const chart = this.chart();
    if (chart) { chart.unsubscribeCrosshairMove(this._moveHandler); }
  }

  paneViews() { return this._paneViews; }

  series() { return this._attachedParams?.series; }

  setData(data: ITooltipCrosshairLineData) {
    this._data = data;
    this.updateAllViews();
    this._attachedParams?.requestUpdate();
  }

  updateAllViews() {
    this._paneViews.forEach(pw => { pw.update(this._data); });
  }
}
