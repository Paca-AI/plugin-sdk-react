import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "PacaPluginSdk",
			formats: ["es", "cjs"],
			fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"@tanstack/react-query",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"@tanstack/react-query": "ReactQuery",
				},
			},
		},
	},
	plugins: [dts({ include: ["src"], rollupTypes: true })],
});
