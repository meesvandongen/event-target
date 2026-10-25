import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		entry: ["src/index.ts"],
		format: "esm",
		platform: "neutral",
		dts: true,
		publint: true,
	},
	// Mirrors the previous Biome settings: tabs, double quotes, organized imports.
	fmt: {
		ignorePatterns: ["dist/**", "*.md", "renovate.json", "tsconfig.json"],
		useTabs: true,
		printWidth: 80,
		sortImports: {},
		sortPackageJson: false,
	},
	lint: {
		ignorePatterns: ["dist/**"],
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
});
