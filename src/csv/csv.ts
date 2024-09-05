import * as tslab from 'tslab';

// https://github.com/marudhupandiyang/react-csv-to-table
function csv(
  data: string[],
  options?: { customCss?: string; maxHeight?: number },
) {
  const reactComponentId = `_csv_widget${Math.random().toString(36).substring(2, 9)}`;
  const html = `
    <style type="text/css">
      table.widget-csv-table {
        margin: auto !important;
        margin-bottom: 10px !important;
        > thead {
          background-color: #000;
          border: 1px solid #888 !important;
        }
        > tbody {
          border: 1px solid #888 !important;
          border-top: 0 !important;
          > tr:hover {
            background-color: #172F3F !important;
          }
        }
      }
      ${options?.customCss || ''}
    </style>
    <div id="${reactComponentId}" style="margin:auto;" />
    <script type="module">
      import React from "https://esm.sh/react@18.3.1";
      import ReactDOM from "https://esm.sh/react-dom@18.3.1";
      import { CsvToHtmlTable } from "https://esm.sh/react-csv-to-table@0.0.4";
      const h = React.createElement;

      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");

      const data = [${data.map((d) => JSON.stringify(d)).join(',')}];
      const csvWidgets = groupArrayIntoPairs(data);
      const rows = csvWidgets.map((rowDataPair, idx) => {
        const cid1 = reactJupyterLabComponentId + '-0';
        const cid2 = reactJupyterLabComponentId + '-1';
        const csvTableRowStyle = {
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'baseline',
          ${options?.maxHeight ? `maxHeight:${options.maxHeight},overflowY: "scroll"` : ''}
        };
        const key = 'row-' + idx;
        return (

          h('div', { key, className: 'csv-' + key, style: { display: 'flex', flexDirection: 'row', margin: 'auto' }}, [
            h('div', { className: 'csv-col-0', style: csvTableRowStyle },
              h(CsvToHtmlTable, { data: rowDataPair[0], csvDelimiter: ',', tableClassName: 'widget-csv-table' })
            ),
            h('div', { className: 'csv-col-1', style: csvTableRowStyle },
              rowDataPair[1]
                ? h(CsvToHtmlTable, { data: rowDataPair[1], csvDelimiter: ',', tableClassName: 'widget-csv-table' })
                : null,
            ),
          ])
        );
      });
      
      ReactDOM.render(
        h('div', { style: { display: 'flex', flexDirection: 'column' }}, rows),
        jupyterLabReactComponentContainer
      );

      function groupArrayIntoPairs(arr) {
        const pairs = [];
        for (let i = 0; i < arr.length; i += 2) {
            const pair = [arr[i], arr[i + 1]];
            pairs.push(pair);
        }
        return pairs;
      }
    
    </script>
  `;
  tslab.display.html(html);
}

export { csv };
