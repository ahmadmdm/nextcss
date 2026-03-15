import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		outDir: "../ramotion_theme/public/dist",
		emptyOutDir: true,
		cssCodeSplit: false,
		lib: {
			entry: path.resolve(__dirname, "src/studio-main.js"),
			formats: ["iife"],
			name: "RamotionThemeStudio",
			fileName: () => "studio.bundle.js",
		},
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === "style.css") {
						return "studio.bundle.css"
					}
					return "[name][extname]"
				},
			},
		},
	},
})