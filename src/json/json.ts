import * as tslab from "tslab";

import { CDN_URLS } from "../config/versions";

function generateJsonHtml<T extends object>(opts: {
	data: T;
	height?: number;
	width?: number;
}): string {
	const width = opts.width || 400;
	const height = opts.height || 150;
	const reactComponentId = `_json_widget${Math.random().toString(36).substring(2, 9)}`;
	return `
    <div
      id="${reactComponentId}"
      style="width:${width + 20}px;height:${height + 20}px;max-height:${height + 20}px;overflow:scroll;padding: 8px;margin: auto;">
    </div>
    <script type="module">
      import React from "${CDN_URLS.react}";
      import ReactDOM from "${CDN_URLS.reactDom}";
      import {JSONTree} from "${CDN_URLS.reactJsonTree}";

      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");
      const args = JSON.parse('${JSON.stringify(opts.data)}');
      const h = React.createElement;

      if (jupyterLabReactComponentContainer) {
        const root = ReactDOM.createRoot(jupyterLabReactComponentContainer);
        root.render(
          h(
            'div',
            { style: { display: 'flex', flex: 1, flexDirection: 'column', alignSelf: 'flex-start' } },
            [
              h(
                JSONTree,
                { data: args },
              )
            ]
          ),
        );
      }

    </script>
  `;
}

function json<T extends object>(opts: {
	data: T;
	height?: number;
	width?: number;
}): void {
	const html = generateJsonHtml(opts);
	tslab.display.html(html);
}

json.html = <T extends object>(opts: {
	data: T;
	height?: number;
	width?: number;
}): string => generateJsonHtml(opts);

export { json };
