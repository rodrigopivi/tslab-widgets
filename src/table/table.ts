import type { GridOptions } from "ag-grid-community";
import * as tslab from "tslab";
import { CDN_URLS } from "../config/versions";

type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

function generateTableHtml(params: {
	options: RequiredFields<GridOptions, "rowData">;
	height?: number;
	width?: number;
}): string {
	const width = params.width || 550;
	const height = params.height || 330;
	const reactComponentId = `_table_widget${Math.random().toString(36).substring(2, 9)}`;
	if (
		!params.options.columnDefs &&
		params.options.rowData &&
		params.options.rowData.length > 0
	) {
		params.options.columnDefs = Object.keys(params.options.rowData[0]).map(
			(key) => ({ field: key, filter: true, sortable: true }),
		);
	}
	return `
    <div id="${reactComponentId}" />

    <link rel="stylesheet" href="${CDN_URLS.agGridStyles}" />
    <link rel="stylesheet" href="${CDN_URLS.agGridThemeAlpine}" />

    <script type="module">
      import React from "${CDN_URLS.react}";
      import ReactDOM from "${CDN_URLS.reactDom}";

      import { AllCommunityModule, ModuleRegistry, themeBalham, colorSchemeDarkBlue } from "${CDN_URLS.agGridCommunity}";
      ModuleRegistry.registerModules([AllCommunityModule]);

      import { AgGridReact } from "${CDN_URLS.agGridReact}";

      const h = React.createElement;
      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");
      const options = JSON.parse('${JSON.stringify(params.options)}');
      const theme = themeBalham.withPart(colorSchemeDarkBlue);
      const gridOptions = { theme, ...options };

      if (jupyterLabReactComponentContainer) {
        const root = ReactDOM.createRoot(jupyterLabReactComponentContainer);
        root.render(
          h('div', { style: { width: ${width}, height: ${height}, margin: 'auto' }}, [
            h(AgGridReact, { gridOptions })
          ])
        );
      }

    </script>
  `;
}

function table(params: {
	options: RequiredFields<GridOptions, "rowData">;
	height?: number;
	width?: number;
}): void {
	const html = generateTableHtml(params);
	tslab.display.html(html);
}

table.html = (params: {
	options: RequiredFields<GridOptions, "rowData">;
	height?: number;
	width?: number;
}): string => generateTableHtml(params);

export { table };
