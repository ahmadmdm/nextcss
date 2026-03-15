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

	loadStudioAssets().then(() => {
		window.RamotionThemeStudio.mount(container, {
			lang: frappe.boot.lang,
			user: frappe.session.user,
		})
	})
}

let studioAssetsPromise

function loadStudioAssets() {
	if (window.RamotionThemeStudio) {
		return Promise.resolve()
	}

	if (studioAssetsPromise) {
		return studioAssetsPromise
	}

	studioAssetsPromise = Promise.all([
		injectStylesheet("/assets/ramotion_theme/dist/studio.bundle.css"),
		injectScript("/assets/ramotion_theme/dist/studio.bundle.js"),
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
		link.onerror = reject
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
		script.onerror = reject
		document.body.appendChild(script)
	})
}