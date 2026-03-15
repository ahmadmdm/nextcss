import { createApp } from "vue"
import App from "./App.vue"

function mount(target, props = {}) {
	const element = typeof target === "string" ? document.querySelector(target) : target

	if (!element) {
		throw new Error("RamotionThemeStudio mount target was not found")
	}

	const app = createApp(App, props)
	app.mount(element)
	return app
}

window.RamotionThemeStudio = { mount }

export { mount }