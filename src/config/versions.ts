/**
 * Centralized CDN version management for tslab-widgets
 *
 * All CDN dependency versions are managed here to ensure consistency
 * between package.json devDependencies and runtime CDN imports.
 *
 * When updating versions:
 * 1. Update the version in CDN_VERSIONS
 * 2. Update corresponding package.json devDependencies
 * 3. Run `npm run validate` to verify consistency
 */

export const CDN_VERSIONS = {
	react: "18.3.1",
	reactDom: "18.3.1",
	lightweightCharts: "5.1.0",
	reactCsvToTable: "0.0.4",
	reactJsonTree: "0.15.0",
	reactGaugeChart: "0.5.1",
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
export const CDN_URLS = {
	react: getCdnUrl("react", CDN_VERSIONS.react),
	reactDom: getCdnUrl("react-dom", CDN_VERSIONS.reactDom),
	lightweightCharts: getCdnUrl(
		"lightweight-charts",
		CDN_VERSIONS.lightweightCharts,
	),
	reactCsvToTable: getCdnUrl(
		"react-csv-to-table",
		CDN_VERSIONS.reactCsvToTable,
	),
	reactJsonTree: getCdnUrl("react-json-tree", CDN_VERSIONS.reactJsonTree),
	reactGaugeChart: getCdnUrl("react-gauge-chart", CDN_VERSIONS.reactGaugeChart),
} as const;
