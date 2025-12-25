/**
 * Version Validation Script
 *
 * Ensures CDN versions in src/config/versions.ts match package.json devDependencies
 * Run this as part of prebuild or CI to catch version mismatches early
 */

import packageJson from "../package.json";
import { CDN_VERSIONS } from "../src/config/versions";

const errors: string[] = [];

// Helper to normalize version (remove ^ or ~ prefix)
const normalizeVersion = (version: string): string => {
	return version.replace(/^[\^~]/, "");
};

// Check React versions match
const reactPkgVersion = normalizeVersion(packageJson.devDependencies.react);
if (reactPkgVersion !== CDN_VERSIONS.react) {
	errors.push(
		`React mismatch: package.json=${packageJson.devDependencies.react}, CDN=${CDN_VERSIONS.react}`,
	);
}

// Check react-dom versions match
const reactDomPkgVersion = normalizeVersion(
	packageJson.devDependencies["react-dom"],
);
if (reactDomPkgVersion !== CDN_VERSIONS.reactDom) {
	errors.push(
		`React-DOM mismatch: package.json=${packageJson.devDependencies["react-dom"]}, CDN=${CDN_VERSIONS.reactDom}`,
	);
}

// Check lightweight-charts
if (
	packageJson.devDependencies["lightweight-charts"] !==
	CDN_VERSIONS.lightweightCharts
) {
	errors.push(
		`lightweight-charts mismatch: package.json=${packageJson.devDependencies["lightweight-charts"]}, CDN=${CDN_VERSIONS.lightweightCharts}`,
	);
}

// Report results
if (errors.length > 0) {
	console.error("\n❌ Version validation failed:\n");
	errors.forEach((e) => {
		console.error(`  - ${e}`);
	});
	console.error(
		"\nPlease update either package.json or src/config/versions.ts to match.\n",
	);
	process.exit(1);
}

console.log("✅ All CDN versions validated successfully");
console.log(`   React: ${CDN_VERSIONS.react}`);
console.log(`   React-DOM: ${CDN_VERSIONS.reactDom}`);
console.log(`   Lightweight Charts: ${CDN_VERSIONS.lightweightCharts}`);
