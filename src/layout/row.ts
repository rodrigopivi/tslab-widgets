import * as tslab from "tslab";

/**
 * Widget renderer function type - returns HTML string instead of calling tslab.display.html
 */
export type WidgetRenderer = () => string;

/**
 * Widget configuration for row layout
 */
export interface IRowWidget {
	/** HTML content to render */
	html: string;
	/** Optional flex grow factor (default: 1) */
	flex?: number;
	/** Optional width constraint */
	width?: string;
	/** Optional minimum width */
	minWidth?: string;
	/** Optional maximum width */
	maxWidth?: string;
}

/**
 * Row layout options
 */
export interface IRowOptions {
	/** Vertical alignment of widgets (default: "flex-start") */
	alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
	/** Horizontal alignment when widgets don't fill row (default: "flex-start") */
	justifyContent?:
		| "flex-start"
		| "center"
		| "flex-end"
		| "space-between"
		| "space-around"
		| "space-evenly";
	/** Minimum height for the row */
	minHeight?: string;
	/** Allow wrapping to multiple lines (default: false) */
	wrap?: boolean;
}

/**
 * Renders multiple widgets in a horizontal row layout
 *
 * @example
 * ```typescript
 * import { row } from 'tslab-widgets';
 * import { gauge, table } from 'tslab-widgets';
 *
 * row([
 *   { html: gauge.html({ value: 75, size: 'M' }) },
 *   { html: table.html({ options: { rowData: [...] } }), flex: 2 }
 * ]);
 * ```
 */
export function row(widgets: IRowWidget[], options: IRowOptions = {}): void {
	const {
		alignItems = "center",
		justifyContent = "center",
		minHeight,
		wrap = false,
	} = options;

	// Generate unique container ID
	const containerId = `_row_layout${Math.random().toString(36).substring(2, 9)}`;

	// Build individual widget containers with flex properties
	const widgetContainers = widgets
		.map((widget, idx) => {
			const widgetId = `${containerId}_widget_${idx}`;
			const styles = [
				widget.minWidth ? `min-width: ${widget.minWidth}` : "",
				widget.maxWidth ? `max-width: ${widget.maxWidth}` : "",
				widget.flex ? "flex: 1" : "",
				"display: flex",
				"flex-direction: row",
				"align-items: center",
				"justify-content: center",
				"min-height: 150px",
			]
				.filter(Boolean)
				.join("; ");

			return `
      <div id="${widgetId}" style="${styles}">
        ${widget.html}
      </div>
    `;
		})
		.join("");

	// Compose final HTML with flexbox row
	const html = `
    <div id="${containerId}" style="
      display: flex;
      flex-direction: row;
      align-items: ${alignItems};
      justify-content: ${justifyContent};
      ${wrap ? "flex-wrap: wrap;" : "flex-wrap: nowrap;"}
      ${minHeight ? `min-height: ${minHeight};` : ""}
      width: 100%;
      gap: 20px;
    ">
      ${widgetContainers}
    </div>
  `;

	tslab.display.html(html);
}
