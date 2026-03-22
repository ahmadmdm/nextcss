;(function (window) {
	'use strict'

	var runtime = window.RamotionThemeRuntime
	if (!runtime) return

	var config = runtime.config
	var state = runtime.state
	var helpers = runtime.helpers
	var icons = runtime.icons

	function getWorkspaceApi() {
		return runtime.workspace || {}
	}

	function scheduleWorkspaceEnhancement() {
		var workspace = getWorkspaceApi()
		if (workspace.scheduleEnhancement) workspace.scheduleEnhancement()
	}

	function getFont() {
		return helpers.ls(config.STORAGE_FONT) || config.DEFAULT_FONT
	}

	function applyFont(fontId) {
		var font = fontId || config.DEFAULT_FONT
		var match = helpers.getMatchingOption(config.FONTS, font, config.DEFAULT_FONT)
		if (!match) return

		if (font === 'default') {
			document.documentElement.removeAttribute('data-ramotion-font')
		} else {
			document.documentElement.setAttribute('data-ramotion-font', font)
		}

		helpers.ls(config.STORAGE_FONT, font)
		updateSettingsPanelState()
	}

	function getPalette() {
		return helpers.ls(config.STORAGE_PALETTE) || config.DEFAULT_PALETTE
	}

	function applyPalette(palette) {
		var nextPalette = palette || config.DEFAULT_PALETTE
		document.documentElement.setAttribute('data-ramotion-palette', nextPalette)
		if (document.body) document.body.setAttribute('data-ramotion-theme', '1')
		helpers.ls(config.STORAGE_PALETTE, nextPalette)
		scheduleWorkspaceEnhancement()
		document.dispatchEvent(new CustomEvent('ramotion-theme:change', { detail: { palette: nextPalette } }))
		updateSettingsPanelState()
	}

	function isDark() {
		return helpers.ls(config.STORAGE_DARK) === '1'
	}

	function setDark(on) {
		if (on) {
			document.documentElement.setAttribute('data-ramotion-dark', '1')
			helpers.ls(config.STORAGE_DARK, '1')
		} else {
			document.documentElement.removeAttribute('data-ramotion-dark')
			helpers.ls(config.STORAGE_DARK, '0')
		}

		updateDarkToggleIcon()
		updateSettingsPanelState()
	}

	function toggleDark() {
		setDark(!isDark())
	}

	function updateDarkToggleIcon() {
		var button = document.getElementById('rm-dark-toggle')
		if (!button) return

		button.innerHTML = isDark() ? icons.sun : icons.moon
		button.title = isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
	}

	function bootstrapTheme() {
		applyPalette(getPalette())
		setDark(isDark())
		applyFont(getFont())
		injectNavbarControls()
		initListAnimations()
		initScrollStickyHead()
		overrideFrappeCharts()
	}

	function injectNavbarControls() {
		var navCollapse = document.querySelector('.navbar .navbar-collapse')
		if (!navCollapse) {
			if (state.navbarRetries++ < 15) {
				setTimeout(injectNavbarControls, 350)
			}
			return
		}

		state.navbarRetries = 0

		var container = document.getElementById('rm-navbar-controls')
		if (!container) {
			container = document.createElement('div')
			container.id = 'rm-navbar-controls'
			container.style.cssText = 'display:flex;align-items:center;gap:4px;padding:0 6px;'

			var navList = navCollapse.querySelector('ul.navbar-nav')
			if (navList) navCollapse.insertBefore(container, navList)
			else navCollapse.appendChild(container)
		}

		if (!document.getElementById('rm-dark-toggle')) {
			var darkButton = document.createElement('button')
			darkButton.id = 'rm-dark-toggle'
			darkButton.className = 'rm-settings-btn'
			darkButton.innerHTML = isDark() ? icons.sun : icons.moon
			darkButton.title = isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
			darkButton.addEventListener('click', function (event) {
				event.stopPropagation()
				toggleDark()
			})
			container.appendChild(darkButton)
		}

		if (!document.getElementById('rm-settings-btn')) {
			var settingsButton = document.createElement('button')
			settingsButton.id = 'rm-settings-btn'
			settingsButton.className = 'rm-settings-btn'
			settingsButton.innerHTML = icons.palette
			settingsButton.title = 'Theme Settings'
			settingsButton.addEventListener('click', function (event) {
				event.stopPropagation()
				toggleSettingsPanel()
			})
			container.appendChild(settingsButton)
		}

		injectSettingsPanel()
	}

	function injectSettingsPanel() {
		if (document.getElementById('rm-theme-panel')) return

		var panel = document.createElement('div')
		panel.id = 'rm-theme-panel'
		panel.className = 'rm-theme-panel'

		var paletteButtons = config.PALETTES.map(function (palette) {
			return '<button class="rm-palette-btn" data-palette="' + palette.id + '">' +
				'<span class="rm-color-dot" style="background:' + palette.color + '"></span>' +
				palette.label +
			'</button>'
		}).join('')

		var fontButtons = config.FONTS.map(function (font) {
			return '<button class="rm-font-btn" data-font="' + font.id + '">' +
				'<span class="rm-font-name">' + font.label + '</span>' +
				'<span class="rm-font-preview" style="' + (font.family ? 'font-family:\'' + font.family + '\',sans-serif' : '') + '">' + font.preview + '</span>' +
			'</button>'
		}).join('')

		panel.innerHTML =
			'<div class="rm-theme-panel__header">' +
				'<span>Theme Settings</span>' +
				'<button class="rm-theme-panel__close" id="rm-panel-close">' + icons.close + '</button>' +
			'</div>' +
			'<div class="rm-theme-panel__body">' +
				'<span class="rm-panel-label">Color Palette</span>' +
				'<div class="rm-palette-grid">' + paletteButtons + '</div>' +
				'<span class="rm-panel-label">Appearance</span>' +
				'<div class="rm-toggle-row" id="rm-dark-row">' +
					'<span>Dark Mode</span>' +
					'<div class="rm-switch">' +
						'<div class="rm-switch-track"></div>' +
						'<div class="rm-switch-thumb"></div>' +
					'</div>' +
				'</div>' +
				'<span class="rm-panel-label" style="margin-top:14px">الخط العربي</span>' +
				'<div class="rm-font-grid">' + fontButtons + '</div>' +
			'</div>'

		document.body.appendChild(panel)

		var paletteNodes = panel.querySelectorAll('.rm-palette-btn')
		for (var i = 0; i < paletteNodes.length; i++) {
			(function (button) {
				button.addEventListener('click', function () {
					applyPalette(button.getAttribute('data-palette'))
				})
			})(paletteNodes[i])
		}

		var fontNodes = panel.querySelectorAll('.rm-font-btn')
		for (var j = 0; j < fontNodes.length; j++) {
			(function (button) {
				button.addEventListener('click', function () {
					applyFont(button.getAttribute('data-font'))
				})
			})(fontNodes[j])
		}

		document.getElementById('rm-dark-row').addEventListener('click', function () {
			toggleDark()
		})

		document.getElementById('rm-panel-close').addEventListener('click', function (event) {
			event.stopPropagation()
			closeSettingsPanel()
		})

		state.panelDismissHandler = function (event) {
			var currentPanel = document.getElementById('rm-theme-panel')
			var settingsButton = document.getElementById('rm-settings-btn')
			var clickedButton = settingsButton && (event.target === settingsButton || (event.target.closest && event.target.closest('#rm-settings-btn')))
			if (currentPanel && currentPanel.classList.contains('rm-open') && !currentPanel.contains(event.target) && !clickedButton) {
				closeSettingsPanel()
			}
		}

		document.addEventListener('click', state.panelDismissHandler)
		updateSettingsPanelState()
	}

	function openSettingsPanel() {
		var panel = document.getElementById('rm-theme-panel')
		var button = document.getElementById('rm-settings-btn')
		if (panel) panel.classList.add('rm-open')
		if (button) button.classList.add('rm-active')
	}

	function closeSettingsPanel() {
		var panel = document.getElementById('rm-theme-panel')
		var button = document.getElementById('rm-settings-btn')
		if (panel) panel.classList.remove('rm-open')
		if (button) button.classList.remove('rm-active')
	}

	function toggleSettingsPanel() {
		var panel = document.getElementById('rm-theme-panel')
		if (panel && panel.classList.contains('rm-open')) closeSettingsPanel()
		else openSettingsPanel()
	}

	function updateSettingsPanelState() {
		var panel = document.getElementById('rm-theme-panel')
		if (!panel) return

		var palette = getPalette()
		var paletteButtons = panel.querySelectorAll('.rm-palette-btn')
		for (var i = 0; i < paletteButtons.length; i++) {
			paletteButtons[i].classList.toggle('rm-active', paletteButtons[i].getAttribute('data-palette') === palette)
		}

		var font = getFont()
		var fontButtons = panel.querySelectorAll('.rm-font-btn')
		for (var j = 0; j < fontButtons.length; j++) {
			fontButtons[j].classList.toggle('rm-active', fontButtons[j].getAttribute('data-font') === font)
		}

		var thumb = panel.querySelector('.rm-switch-thumb')
		var track = panel.querySelector('.rm-switch-track')
		if (isDark()) {
			if (track) track.style.background = 'var(--rm-primary)'
			if (thumb) thumb.style.transform = 'translateX(16px)'
		} else {
			if (track) track.style.background = ''
			if (thumb) thumb.style.transform = ''
		}
	}

	function animateListRows(container) {
		var rows = container.querySelectorAll('.list-row, .result')
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].classList.contains('rm-row-visible')) continue

			rows[i].style.setProperty('--rm-row-idx', String(i))
			rows[i].classList.add('rm-row-enter')
			;(function (row) {
				requestAnimationFrame(function () {
					requestAnimationFrame(function () {
						row.classList.add('rm-row-visible')
					})
				})
			})(rows[i])
		}
	}

	function initListAnimations() {
		if (state.listObserver) state.listObserver.disconnect()

		state.listObserver = new MutationObserver(function (mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var addedNodes = mutations[i].addedNodes
				for (var j = 0; j < addedNodes.length; j++) {
					var node = addedNodes[j]
					if (node.nodeType !== 1) continue

					if (node.classList && (node.classList.contains('frappe-list') || node.classList.contains('list-result'))) {
						animateListRows(node)
						continue
					}

					if (node.querySelector) {
						var list = node.querySelector('.frappe-list, .list-result')
						if (list) animateListRows(list)
					}
				}
			}
		})

		state.listObserver.observe(document.body, { childList: true, subtree: true })

		var existingLists = document.querySelectorAll('.frappe-list, .list-result')
		for (var k = 0; k < existingLists.length; k++) {
			animateListRows(existingLists[k])
		}
	}

	function initScrollStickyHead() {
		if (state.scrollListener) {
			window.removeEventListener('scroll', state.scrollListener, true)
		}

		state.scrollListener = function () {
			var head = document.querySelector('.page-head')
			if (!head) return
			head.classList.toggle('rm-scrolled', window.scrollY > 10)
		}

		window.addEventListener('scroll', state.scrollListener, { passive: true, capture: true })
	}

	function overrideFrappeCharts() {
		if (!window.frappe || !window.frappe.Chart || window.frappe.Chart.__ramotionWrapped) return

		var chartColors = [
			'#1556d4',
			'#f25c22',
			'#0d6b3c',
			'#5e3bb7',
			'#9a3f12',
			'#0369a1',
			'#a02a6a',
			'#7a5c00',
			'#374463',
			'#0a5c34',
		]

		var OriginalChart = window.frappe.Chart
		window.frappe.Chart = function (element, chartConfig) {
			if (chartConfig && (!chartConfig.colors || chartConfig.colors.length === 0)) {
				chartConfig.colors = chartColors
			}
			return new OriginalChart(element, chartConfig)
		}

		window.frappe.Chart.prototype = OriginalChart.prototype
		for (var key in OriginalChart) {
			if (Object.prototype.hasOwnProperty.call(OriginalChart, key)) {
				window.frappe.Chart[key] = OriginalChart[key]
			}
		}

		window.frappe.Chart.__ramotionWrapped = true
	}

	function applyRiyalSymbol() {
		if (!document.body) return

		var sarSymbol = '\uFDFC'
		var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)
		var nodes = []
		var node

		while ((node = walker.nextNode())) {
			if (node.nodeValue && node.nodeValue.indexOf('ر.س') !== -1) nodes.push(node)
		}

		nodes.forEach(function (textNode) {
			textNode.nodeValue = textNode.nodeValue.replace(/ر\.س/g, sarSymbol)
		})
	}

	function initRiyalObserver() {
		if (!window.MutationObserver || state.sarObserver || !document.body) return

		state.sarObserver = new MutationObserver(function (mutations) {
			var needsRefresh = false
			for (var i = 0; i < mutations.length; i++) {
				for (var j = 0; j < mutations[i].addedNodes.length; j++) {
					var node = mutations[i].addedNodes[j]
					if (node.textContent && node.textContent.indexOf('ر.س') !== -1) {
						needsRefresh = true
						break
					}
				}
				if (needsRefresh) break
			}

			if (needsRefresh) applyRiyalSymbol()
		})

		state.sarObserver.observe(document.body, { childList: true, subtree: true })
	}

	window.RamotionTheme = {
		applyPalette: applyPalette,
		getPalette: getPalette,
		setDark: setDark,
		isDark: isDark,
		toggleDark: toggleDark,
		applyFont: applyFont,
		getFont: getFont,
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			bootstrapTheme()
			applyRiyalSymbol()
			initRiyalObserver()
			scheduleWorkspaceEnhancement()
		})
	} else {
		bootstrapTheme()
		applyRiyalSymbol()
		initRiyalObserver()
		scheduleWorkspaceEnhancement()
	}

	document.addEventListener('page-change', function () {
		bootstrapTheme()
		window.setTimeout(applyRiyalSymbol, 400)
		scheduleWorkspaceEnhancement()
	})

	document.addEventListener('ramotion-theme:change', scheduleWorkspaceEnhancement)
	window.addEventListener('hashchange', scheduleWorkspaceEnhancement)
})(window)
