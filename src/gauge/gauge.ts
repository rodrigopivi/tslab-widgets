import * as tslab from 'tslab';

// https://www.npmjs.com/package/react-gauge-chart
function gauge(
  width = 200,
  props: {
    colors?: string[];
    legend?: string;
    nrOfLevels?: number;
    percent: number;
    score?: string;
    title?: string;
  },
) {
  const reactComponentId = `_gauge_widget${Math.random().toString(36).substring(2, 9)}`;
  const html = `
    <div id="${reactComponentId}"></div>
    <style type="text/css">
      g.text-group {
        text-shadow: 5px 5px 5px #000;
      }
    </style>
    <script type="module">
      import React from "https://esm.sh/react@18.3.1";
      import ReactDOM from "https://esm.sh/react-dom@18.3.1";
      import GaugeChart from "https://esm.sh/react-gauge-chart@0.5.1";
      const h = React.createElement;

      const reactJupyterLabComponentId = "${reactComponentId}";
      const jupyterLabReactComponentContainer = document.getElementById("${reactComponentId}");
      const props = JSON.parse('${JSON.stringify(props)}');
      const styles = {
        wrapper: { 
          width: '${width}px',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#000',
          border: '1px solid #ccc',
          color: '#fff',
        },
        title: { fontWeight: 'bold', fontSize: 13, marginBottom: '5px', paddingTop: '8px', whiteSpace: 'pre', color: '#fff' },
        legend: { fontWeight: 'normal', fontSize: 12, marginBottom: '5px', whiteSpace: 'pre', color: '#dcdcdc' },
      };
      ReactDOM.render(
        h('div', { style: styles.wrapper }, [
          h('div', { style: styles.title }, '${props.title ?? ''}'),
          h(GaugeChart, {
            id: 'rg-${reactComponentId}',
            colors: ['#D10363', '#4CCD99'],
            needleColor: '#888',
            ${props.score ? `formatTextValue: value => '${props.score}',` : ''}
            ...props,
          }),
          h('div', { style: styles.legend }, '${props.legend}'),
        ]),
        jupyterLabReactComponentContainer
      );

    </script>
  `;
  tslab.display.html(html);
}

export { gauge };
