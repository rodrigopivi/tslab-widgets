export const CDN_VERSIONS = {
	react: "19.2.3",
	reactDom: "19.2.3",
	lightweightCharts: "5.1.0",
	reactJsonTree: "0.20.0",
	recharts: "3.6.0",
	agChartsReact: "13.0.0",
	agGridReact: "35.0.0",
	agGridCommunity: "35.0.0",
} as const;

export const CDN_PROVIDER = "https://esm.sh";

/**
 * Constructs a CDN URL for a given package and version
 */
export function getCdnUrl(pkg: string, version: string): string {
	return `${CDN_PROVIDER}/${pkg}@${version}`;
}

/**
 * Pre-built CDN URLs for all dependencies
 * Use these constants in widget HTML generation
 */
const agGridCommunity = getCdnUrl(
	"ag-grid-community",
	CDN_VERSIONS.agGridCommunity,
);

export const CDN_URLS = {
	react: getCdnUrl("react", CDN_VERSIONS.react),
	reactDom: `${getCdnUrl("react-dom", CDN_VERSIONS.reactDom)}/client`,
	lightweightCharts: getCdnUrl(
		"lightweight-charts",
		CDN_VERSIONS.lightweightCharts,
	),
	reactJsonTree: getCdnUrl("react-json-tree", CDN_VERSIONS.reactJsonTree),
	recharts: getCdnUrl("recharts", CDN_VERSIONS.recharts),

	// AG Grid dependencies
	agGridReact: getCdnUrl("ag-grid-react", CDN_VERSIONS.agGridReact),
	agGridCommunity,
	agGridStyles: `${agGridCommunity}/styles/ag-grid.css`,
	agGridThemeAlpine: `${agGridCommunity}/styles/ag-theme-alpine.css`,

	// AG Charts dependencies
	agChartsReact: getCdnUrl("ag-charts-react", CDN_VERSIONS.agChartsReact),
} as const;
