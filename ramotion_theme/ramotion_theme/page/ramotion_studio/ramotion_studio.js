frappe.pages["ramotion-studio"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Ramotion Studio"),
		single_column: true,
	})

	page.set_primary_action(__("Apply Theme"), () => {
		window.RamotionTheme?.applyPalette?.(window.RamotionTheme?.getPalette?.())
		frappe.show_alert({ message: __("Theme applied"), indicator: "green" })
	})

	const container = document.createElement("div")
	container.id = "ramotion-theme-studio-root"
	container.className = "ramotion-theme-studio-page"
	page.main.append(container)

	loadStudioAssets()
		.then(() => {
			window.RamotionThemeStudio.mount(container, {
				lang: frappe.boot.lang,
				user: frappe.session.user,
			})
		})
		.catch((error) => {
			console.error("Failed to load Ramotion Studio assets", error)
			const errorMessage = document.createElement("div")
			errorMessage.className = "text-muted"
			errorMessage.style.padding = "2rem"
			errorMessage.style.textAlign = "center"
			errorMessage.textContent = __("Failed to load studio assets. Please refresh the page.")
			container.replaceChildren(errorMessage)
			frappe.show_alert({ message: __("Failed to load studio assets"), indicator: "red" })
		})
}

let studioAssetsPromise

function ensureBrowserProcessShim() {
	if (!window.process) {
		window.process = { env: {} }
	}

	if (!window.process.env) {
		window.process.env = {}
	}

	if (!window.process.env.NODE_ENV) {
		window.process.env.NODE_ENV = "production"
	}
}

function getTrustedAssetUrl(assetPath) {
	const url = new URL(assetPath, window.location.origin)
	if (url.origin !== window.location.origin) {
		throw new Error(`Blocked cross-origin asset URL: ${url.href}`)
	}
	if (!url.pathname.startsWith("/assets/ramotion_theme/")) {
		throw new Error(`Blocked unexpected asset path: ${url.pathname}`)
	}
	return url.toString()
}

function loadStudioAssets() {
	if (window.RamotionThemeStudio) {
		return Promise.resolve()
	}

	if (studioAssetsPromise) {
		return studioAssetsPromise
	}

	const stylesheetUrl = getTrustedAssetUrl("/assets/ramotion_theme/dist/studio.bundle.css?v=20260327l")
	const scriptUrl = getTrustedAssetUrl("/assets/ramotion_theme/dist/studio.bundle.js?v=20260327l")

	ensureBrowserProcessShim()

	studioAssetsPromise = Promise.all([
		injectStylesheet(stylesheetUrl),
		injectScript(scriptUrl),
	])

	return studioAssetsPromise
}

function injectStylesheet(href) {
	const existing = document.querySelector(`link[href="${href}"]`)
	if (existing) {
		return Promise.resolve(existing)
	}

	return new Promise((resolve, reject) => {
		const link = document.createElement("link")
		link.rel = "stylesheet"
		link.href = href
		link.onload = () => resolve(link)
		link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`))
		document.head.appendChild(link)
	})
}

function injectScript(src) {
	const existing = document.querySelector(`script[src="${src}"]`)
	if (existing) {
		if (window.RamotionThemeStudio) {
			return Promise.resolve(existing)
		}

		return new Promise((resolve) => {
			existing.addEventListener("load", () => resolve(existing), { once: true })
		})
	}

	return new Promise((resolve, reject) => {
		const script = document.createElement("script")
		script.src = src
		script.onload = () => resolve(script)
		script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
		document.body.appendChild(script)
	})
}