;(function (window) {
	'use strict'

	function initRamotionTheme() {
		var runtime = window.RamotionThemeRuntime
		if (!runtime) {
			window.__ramotionThemeWaitRetries = (window.__ramotionThemeWaitRetries || 0) + 1
			if (window.__ramotionThemeWaitRetries <= 30) {
				window.setTimeout(initRamotionTheme, 120)
			}
			return
		}

		if (window.__ramotionThemeInitialized) return
		window.__ramotionThemeInitialized = true

		var config = runtime.config
		var state = runtime.state
		var helpers = runtime.helpers
		var icons = runtime.icons
		var RIYAL_SYMBOL = '\u00EA'
		var LEGACY_RIYAL_SYMBOL = '\uFDFC'
		var RIYAL_TEXT_PATTERN = /(?:ر\.س|﷼|ê|\u00EA|\uFDFC)/
		var RIYAL_AMOUNT_BEFORE_PATTERN = /([0-9][0-9,]*(?:\.[0-9]+)?)\s*(?:ر\.س|﷼|ê|\u00EA|\uFDFC)/g
		var RIYAL_AMOUNT_AFTER_PATTERN = /(?:ر\.س|﷼|ê|\u00EA|\uFDFC)\s*([0-9][0-9,]*(?:\.[0-9]+)?)/g
		var RIYAL_DECORATION_SELECTORS = [
			'.control-value.like-disabled-input',
			'.static-area > div',
			'.widget-content .number',
			'.widget-body .number',
			'.number-card .number',
			'.number-widget-box .number',
			'.currency-field',
			'.bold .currency',
			'.dt-cell .currency',
			'.frappe-list .currency'
		]

		function normalizeQueryReportHeaderHeight() {
			var page = document.getElementById('page-query-report')
			if (!page) return

			var header = page.querySelector('.dt-header')
			var headerWrapper = header && header.firstElementChild
			var headerRow = page.querySelector('.dt-header .dt-row.dt-row-header, .dt-header-row')
			if (!header || !headerRow) return

			var headerCells = page.querySelectorAll('.dt-header .dt-cell')

			var rowHeight = Math.ceil(headerRow.getBoundingClientRect().height)
			if (!rowHeight) return

			var targetHeight = rowHeight + 1
			header.style.height = targetHeight + 'px'
			header.style.minHeight = targetHeight + 'px'
			header.style.maxHeight = targetHeight + 'px'

			if (headerWrapper) {
				headerWrapper.style.height = targetHeight + 'px'
				headerWrapper.style.minHeight = targetHeight + 'px'
				headerWrapper.style.maxHeight = targetHeight + 'px'
			}

			for (var i = 0; i < headerCells.length; i++) {
				headerCells[i].style.removeProperty('width')
				headerCells[i].style.removeProperty('min-width')
				headerCells[i].style.removeProperty('max-width')
			}
		}

		function scheduleQueryReportHeaderNormalization() {
			if (!window.setTimeout) return
			var delays = [0, 80, 240, 600, 1200]
			for (var i = 0; i < delays.length; i++) {
				window.setTimeout(function () {
					normalizeQueryReportHeaderHeight()
				}, delays[i])
			}
		}

		function initQueryReportObserver() {
			if (!window.MutationObserver || state.queryReportObserver || !document.body) return

			state.queryReportObserver = new MutationObserver(function () {
				var route = window.frappe && frappe.get_route ? frappe.get_route() : []
				if (!route || route[0] !== 'query-report') return
				scheduleQueryReportHeaderNormalization()
			})

			state.queryReportObserver.observe(document.body, { childList: true, subtree: true })
		}

		function getWorkspaceApi() {
			return runtime.workspace || {}
		}

		function containsRiyalValue(value) {
			return typeof value === 'string' && RIYAL_TEXT_PATTERN.test(value)
		}

		function normalizeRiyalText(value) {
			return String(value || '')
				.replace(/ر\.س/g, RIYAL_SYMBOL)
				.replace(/﷼/g, RIYAL_SYMBOL)
				.replace(/ê/g, RIYAL_SYMBOL)
		}

		function scheduleWorkspaceEnhancement() {
			var workspace = getWorkspaceApi()
			if (workspace.scheduleEnhancement) workspace.scheduleEnhancement()
		}

	function getFont() {
		return helpers.ls(config.STORAGE_FONT) || config.DEFAULT_FONT
	}

	function isArabicProFontActive() {
		var bootFontManager = window.frappe && frappe.boot && frappe.boot.arabic_pro
		var storedFont = helpers.ls('arabic_pro_font')
		var computedFont = ''

		if (window.getComputedStyle) {
			computedFont = window.getComputedStyle(document.documentElement).getPropertyValue('--ap-font-family') || ''
		}

		return !!(bootFontManager || storedFont || computedFont.trim())
	}

	function syncArabicProFontCompatibility() {
		var active = isArabicProFontActive()

		if (active) {
			document.documentElement.setAttribute('data-ramotion-arabic-pro-font', '1')
			document.documentElement.removeAttribute('data-ramotion-font')
		} else {
			document.documentElement.removeAttribute('data-ramotion-arabic-pro-font')
		}

		return active
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
		syncArabicProFontCompatibility()
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

		helpers.setSvg(button, isDark() ? icons.sun : icons.moon)
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
		scheduleQueryReportHeaderNormalization()
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
			helpers.setSvg(darkButton, isDark() ? icons.sun : icons.moon)
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
			helpers.setSvg(settingsButton, icons.palette)
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

		function createPanelLabel(text, id, marginTop) {
			var label = document.createElement('span')
			label.className = 'rm-panel-label'
			if (id) label.id = id
			if (marginTop) label.style.marginTop = marginTop
			label.textContent = text
			return label
		}

		function createPaletteButton(palette) {
			var button = document.createElement('button')
			var dot = document.createElement('span')

			button.className = 'rm-palette-btn'
			button.setAttribute('data-palette', palette.id)
			button.appendChild(dot)
			button.appendChild(document.createTextNode(palette.label))

			dot.className = 'rm-color-dot'
			dot.style.background = palette.color

			button.addEventListener('click', function () {
				applyPalette(palette.id)
			})

			return button
		}

		function createFontButton(font) {
			var button = document.createElement('button')
			var name = document.createElement('span')
			var preview = document.createElement('span')

			button.className = 'rm-font-btn'
			button.setAttribute('data-font', font.id)

			name.className = 'rm-font-name'
			name.textContent = font.label

			preview.className = 'rm-font-preview'
			preview.textContent = font.preview
			if (font.family) preview.style.fontFamily = '\'' + font.family + '\',sans-serif'

			button.appendChild(name)
			button.appendChild(preview)
			button.addEventListener('click', function () {
				applyFont(font.id)
			})

			return button
		}

		var panel = document.createElement('div')
		var header = document.createElement('div')
		var headerTitle = document.createElement('span')
		var closeButton = document.createElement('button')
		var body = document.createElement('div')
		var paletteGrid = document.createElement('div')
		var darkRow = document.createElement('div')
		var darkText = document.createElement('span')
		var darkSwitch = document.createElement('div')
		var switchTrack = document.createElement('div')
		var switchThumb = document.createElement('div')
		var fontGrid = document.createElement('div')
		var fontNote = document.createElement('div')
		panel.id = 'rm-theme-panel'
		panel.className = 'rm-theme-panel'

		header.className = 'rm-theme-panel__header'
		headerTitle.textContent = 'Theme Settings'
		closeButton.className = 'rm-theme-panel__close'
		closeButton.id = 'rm-panel-close'
		helpers.setSvg(closeButton, icons.close)
		header.appendChild(headerTitle)
		header.appendChild(closeButton)

		body.className = 'rm-theme-panel__body'

		paletteGrid.className = 'rm-palette-grid'
		for (var i = 0; i < config.PALETTES.length; i++) {
			paletteGrid.appendChild(createPaletteButton(config.PALETTES[i]))
		}

		darkRow.className = 'rm-toggle-row'
		darkRow.id = 'rm-dark-row'
		darkText.textContent = 'Dark Mode'
		darkSwitch.className = 'rm-switch'
		switchTrack.className = 'rm-switch-track'
		switchThumb.className = 'rm-switch-thumb'
		darkSwitch.appendChild(switchTrack)
		darkSwitch.appendChild(switchThumb)
		darkRow.appendChild(darkText)
		darkRow.appendChild(darkSwitch)

		fontGrid.className = 'rm-font-grid'
		for (var j = 0; j < config.FONTS.length; j++) {
			fontGrid.appendChild(createFontButton(config.FONTS[j]))
		}

		fontNote.className = 'rm-font-note'
		fontNote.id = 'rm-font-note'

		body.appendChild(createPanelLabel('Color Palette'))
		body.appendChild(paletteGrid)
		body.appendChild(createPanelLabel('Appearance'))
		body.appendChild(darkRow)
		body.appendChild(createPanelLabel('الخط العربي', 'rm-font-label', '14px'))
		body.appendChild(fontGrid)
		body.appendChild(fontNote)

		panel.appendChild(header)
		panel.appendChild(body)

		document.body.appendChild(panel)

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

		var arabicProManaged = syncArabicProFontCompatibility()

		var palette = getPalette()
		var paletteButtons = panel.querySelectorAll('.rm-palette-btn')
		for (var i = 0; i < paletteButtons.length; i++) {
			paletteButtons[i].classList.toggle('rm-active', paletteButtons[i].getAttribute('data-palette') === palette)
		}

		var font = arabicProManaged ? config.DEFAULT_FONT : getFont()
		var fontButtons = panel.querySelectorAll('.rm-font-btn')
		for (var j = 0; j < fontButtons.length; j++) {
			fontButtons[j].disabled = arabicProManaged
			fontButtons[j].classList.toggle('rm-disabled', arabicProManaged)
			fontButtons[j].title = arabicProManaged ? 'Arabic Pro manages Arabic fonts on this site' : ''
			fontButtons[j].classList.toggle('rm-active', fontButtons[j].getAttribute('data-font') === font)
		}

		var fontLabel = panel.querySelector('#rm-font-label')
		var fontNote = panel.querySelector('#rm-font-note')
		if (fontLabel) {
			fontLabel.textContent = arabicProManaged ? 'الخط العربي - يُدار عبر Arabic Pro' : 'الخط العربي'
		}
		if (fontNote) {
			fontNote.textContent = arabicProManaged ? 'مدير الخطوط في Arabic Pro هو المتحكم النشط حالياً، لذلك يعرض الثيم الخط دون استبداله.' : ''
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

	function markRiyalContext(textNode) {
		if (!textNode || !textNode.parentElement) return

		var parent = textNode.parentElement
		var tagName = parent.tagName
		if (tagName === 'SCRIPT' || tagName === 'STYLE') return

		parent.classList.add('rm-has-riyal-symbol')
	}

	function buildRiyalFragment(textValue) {
		var normalized = normalizeRiyalText(textValue)
		if (normalized.indexOf(RIYAL_SYMBOL) === -1) return null

		var fragment = document.createDocumentFragment()
		var parts = normalized.split(RIYAL_SYMBOL)
		for (var i = 0; i < parts.length; i++) {
			var chunk = parts[i]
			if (i < parts.length - 1) chunk = chunk.replace(/\s+$/, '')
			if (i > 0) chunk = chunk.replace(/^\s+/, '')

			if (chunk) {
				fragment.appendChild(document.createTextNode(chunk))
			}

			if (i < parts.length - 1) {
				var symbolSpan = document.createElement('span')
				symbolSpan.className = 'rm-riyal-symbol'
				symbolSpan.setAttribute('aria-hidden', 'true')
				fragment.appendChild(symbolSpan)
			}
		}

		return fragment
	}

	function canDecorateRiyalElement(element) {
		if (!element) return false
		if (element.querySelector('.rm-riyal-amount, .rm-riyal-symbol')) return false
		if (element.childElementCount > 0) return false

		var tagName = element.tagName
		if (tagName === 'SCRIPT' || tagName === 'STYLE') return false

		return containsRiyalValue(element.textContent || '')
	}

	function decorateRiyalElements() {
		if (!document.body) return

		var elements = document.querySelectorAll(RIYAL_DECORATION_SELECTORS.join(','))
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i]
			if (!canDecorateRiyalElement(element)) continue

			var sourceText = element.textContent || ''
			var fragment = buildRiyalFragment(sourceText)
			if (!fragment) continue

			element.replaceChildren(fragment)
			element.classList.add('rm-has-riyal-symbol')
		}
	}

	function replaceTextNodeWithRiyalMarkup(textNode) {
		if (!textNode || !textNode.parentElement) return false
		if (textNode.parentElement.closest('.rm-riyal-symbol')) return false

		var tagName = textNode.parentElement.tagName
		if (tagName === 'SCRIPT' || tagName === 'STYLE') return false

		if (!containsRiyalValue(textNode.nodeValue || '')) return false

		var fragment = buildRiyalFragment(textNode.nodeValue || '')
		if (!fragment) return false

		textNode.parentElement.classList.add('rm-has-riyal-symbol')
		textNode.parentNode.replaceChild(fragment, textNode)
		return true
	}

	function applyRiyalSymbol() {
		if (!document.body) return

		decorateRiyalElements()

		var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)
		var nodes = []
		var node

		while ((node = walker.nextNode())) {
			if (!containsRiyalValue(node.nodeValue)) continue
			nodes.push(node)
		}

		nodes.forEach(function (textNode) {
			if (!replaceTextNodeWithRiyalMarkup(textNode)) {
				if (containsRiyalValue(textNode.nodeValue || '')) {
					textNode.nodeValue = normalizeRiyalText(textNode.nodeValue)
				}
				markRiyalContext(textNode)
			}
		})

		decorateRiyalElements()
	}

	function scheduleRiyalRefresh() {
		if (!window.setTimeout) return
		if (state.riyalRefreshTimeouts && state.riyalRefreshTimeouts.length) {
			for (var i = 0; i < state.riyalRefreshTimeouts.length; i++) {
				window.clearTimeout(state.riyalRefreshTimeouts[i])
			}
		}

		state.riyalRefreshTimeouts = [0, 120, 400, 900, 1800].map(function (delay) {
			return window.setTimeout(function () {
				applyRiyalSymbol()
			}, delay)
		})
	}

	function initRiyalObserver() {
		if (!window.MutationObserver || state.sarObserver || !document.body) return

		state.sarObserver = new MutationObserver(function (mutations) {
			var needsRefresh = false
			for (var i = 0; i < mutations.length; i++) {
				if (mutations[i].type === 'characterData') {
					var textValue = mutations[i].target && mutations[i].target.nodeValue
					if (containsRiyalValue(textValue)) {
						needsRefresh = true
						break
					}
				}

				for (var j = 0; j < mutations[i].addedNodes.length; j++) {
					var node = mutations[i].addedNodes[j]
					if (containsRiyalValue(node.textContent || '')) {
						needsRefresh = true
						break
					}
				}
				if (needsRefresh) break
			}

			if (needsRefresh) {
				applyRiyalSymbol()
				scheduleRiyalRefresh()
			}
		})

		state.sarObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
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

	function startRamotionTheme() {
		bootstrapTheme()
		applyRiyalSymbol()
		scheduleRiyalRefresh()
		initRiyalObserver()
		initQueryReportObserver()
		scheduleWorkspaceEnhancement()
		scheduleQueryReportHeaderNormalization()
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startRamotionTheme)
	} else {
		startRamotionTheme()
	}

	document.addEventListener('page-change', function () {
		bootstrapTheme()
		window.setTimeout(applyRiyalSymbol, 400)
		scheduleWorkspaceEnhancement()
		scheduleQueryReportHeaderNormalization()
	})

	document.addEventListener('ramotion-theme:change', scheduleWorkspaceEnhancement)
	window.addEventListener('hashchange', scheduleWorkspaceEnhancement)
	}

	initRamotionTheme()
})(window)
