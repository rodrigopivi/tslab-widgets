import * as tslab from "tslab";

import { CDN_URLS } from "../config/versions";

function json<T extends object>(opts: {
	data: T;
	height?: number;
	width?: number;
}) {
	const width = opts.width || 400;
	const height = opts.height || 200;
	const reactComponentId = `_json_widget${Math.random().toString(36).substring(2, 9)}`;
	const html = `
    <div
      id="${reactComponentId}"
      style="width:${width + 50}px;height:${height + 50}px;margin:auto;max-height:${height + 50}px;overflow:scroll;">
    </div>
    <script type="module">
      import React from "${CDN_URLS.react}";
      import ReactDOM from "${CDN_URLS.reactDom}";
      import ReactJsonTree from "${CDN_URLS.reactJsonTree}";

      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");
      const args = JSON.parse('${JSON.stringify(opts.data)}');
      ReactDOM.render(React.createElement(
        ReactJsonTree,
        { data: args },
      ), jupyterLabReactComponentContainer);

    </script>
  `;
	tslab.display.html(html);
}

export { json };
