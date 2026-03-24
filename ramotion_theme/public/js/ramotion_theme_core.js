;(function (window) {
	'use strict'

	var runtime = window.RamotionThemeRuntime || {}

	runtime.config = runtime.config || {
		STORAGE_PALETTE: 'ramotion-theme-palette',
		STORAGE_DARK: 'ramotion-theme-dark',
		STORAGE_FONT: 'ramotion-theme-font',
		DEFAULT_PALETTE: 'aurora',
		DEFAULT_FONT: 'default',
		PALETTES: [
			{ id: 'aurora', label: 'Aurora', color: '#1556d4' },
			{ id: 'editorial', label: 'Editorial', color: '#1c3d6e' },
			{ id: 'sunrise', label: 'Sunrise', color: '#9a3f12' },
			{ id: 'luxury', label: 'Luxury', color: '#1e3454' },
		],
		FONTS: [
			{ id: 'default', label: 'افتراضي', preview: 'Aa', family: '' },
			{ id: 'cairo', label: 'كايرو', preview: 'ﻙﺎﻳﺮﻭ', family: 'Cairo' },
			{ id: 'ibm', label: 'IBM عربي', preview: 'ﺍﺑﻢ', family: 'IBM Plex Sans Arabic' },
			{ id: 'tajawal', label: 'تجوّل', preview: 'ﺗﺠﻮﻝ', family: 'Tajawal' },
		],
	}

	runtime.state = runtime.state || {
		workspaceTimer: null,
		workspaceRefreshTimer: null,
		workspaceObserver: null,
		colorObserver: null,
		sarObserver: null,
		riyalRefreshTimeouts: [],
		heroClockTimer: null,
		intersectionObserver: null,
		listObserver: null,
		scrollListener: null,
		panelDismissHandler: null,
		navbarRetries: 0,
	}

	runtime.helpers = runtime.helpers || {}

	runtime.helpers.esc = function (value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
	}

	runtime.helpers.ls = function (key, value) {
		try {
			if (value !== undefined) {
				window.localStorage.setItem(key, String(value))
				return
			}
			return window.localStorage.getItem(key)
		} catch (e) {}
	}

	runtime.helpers.svgIcon = function (path, size) {
		size = size || 16
		return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>'
	}

	runtime.helpers.getMatchingOption = function (options, id, fallbackId) {
		var optionId = id || fallbackId
		for (var i = 0; i < options.length; i++) {
			if (options[i].id === optionId) return options[i]
		}
		return null
	}

	runtime.helpers.translateText = function (text) {
		return (typeof __ === 'function') ? __(text) : text
	}

	runtime.icons = runtime.icons || {
		palette: runtime.helpers.svgIcon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>', 15),
		moon: runtime.helpers.svgIcon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 15),
		sun: runtime.helpers.svgIcon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>', 15),
		close: runtime.helpers.svgIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 14),
	}

	window.RamotionThemeRuntime = runtime
})(window)
