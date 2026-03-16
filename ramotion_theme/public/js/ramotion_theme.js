;(function () {
	'use strict'

	/* ─────────────────────────────────────────────
	   CONSTANTS & STATE
	───────────────────────────────────────────── */
	var STORAGE_PALETTE = 'ramotion-theme-palette'
	var STORAGE_DARK    = 'ramotion-theme-dark'
	var DEFAULT_PALETTE = 'aurora'

	var workspaceTimer
	var intersectionObserver
	var listObserver
	var scrollListener
	var navbarRetries = 0

	var PALETTES = [
		{ id: 'aurora',    label: 'Aurora',    color: '#1556d4' },
		{ id: 'editorial', label: 'Editorial', color: '#1c3d6e' },
		{ id: 'sunrise',   label: 'Sunrise',   color: '#9a3f12' },
		{ id: 'luxury',    label: 'Luxury',    color: '#1e3454' }
	]

	/* ─────────────────────────────────────────────
	   HELPERS
	───────────────────────────────────────────── */
	function esc(v) {
		return String(v)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
	}

	function ls(key, val) {
		try {
			if (val !== undefined) window.localStorage.setItem(key, String(val))
			else return window.localStorage.getItem(key)
		} catch (e) {}
	}

	function svgIcon(path, size) {
		size = size || 16
		return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>'
	}

	var ICON_PALETTE = svgIcon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>', 15)
	var ICON_MOON    = svgIcon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 15)
	var ICON_SUN     = svgIcon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>', 15)
	var ICON_CLOSE   = svgIcon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 14)

	/* ─────────────────────────────────────────────
	   PALETTE
	───────────────────────────────────────────── */
	function getPalette() {
		return ls(STORAGE_PALETTE) || DEFAULT_PALETTE
	}

	function applyPalette(palette) {
		var p = palette || DEFAULT_PALETTE
		document.documentElement.setAttribute('data-ramotion-palette', p)
		if (document.body) document.body.setAttribute('data-ramotion-theme', '1')
		ls(STORAGE_PALETTE, p)
		scheduleEnhancement()
		document.dispatchEvent(new CustomEvent('ramotion-theme:change', { detail: { palette: p } }))
		updateSettingsPanelState()
	}

	/* ─────────────────────────────────────────────
	   DARK MODE
	───────────────────────────────────────────── */
	function isDark() {
		return ls(STORAGE_DARK) === '1'
	}

	function setDark(on) {
		if (on) {
			document.documentElement.setAttribute('data-ramotion-dark', '1')
			ls(STORAGE_DARK, '1')
		} else {
			document.documentElement.removeAttribute('data-ramotion-dark')
			ls(STORAGE_DARK, '0')
		}
		updateDarkToggleIcon()
		updateSettingsPanelState()
	}

	function toggleDark() {
		setDark(!isDark())
	}

	function updateDarkToggleIcon() {
		var btn = document.getElementById('rm-dark-toggle')
		if (!btn) return
		btn.innerHTML = isDark() ? ICON_SUN : ICON_MOON
		btn.title = isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
	}

	/* ─────────────────────────────────────────────
	   BOOTSTRAP
	───────────────────────────────────────────── */
	function bootstrapTheme() {
		applyPalette(getPalette())
		setDark(isDark())
		injectNavbarControls()
		initListAnimations()
		initScrollStickyHead()
		overrideFrappeCharts()
	}

	/* ─────────────────────────────────────────────
	   NAVBAR CONTROLS (dark toggle + settings btn)
	───────────────────────────────────────────── */
	function injectNavbarControls() {
		// Frappe navbar: header.navbar > div.container > div.collapse.navbar-collapse > ul.navbar-nav
		var navCollapse = document.querySelector('.navbar .navbar-collapse')
		if (!navCollapse) {
			// Frappe renders the navbar asynchronously — retry up to 15 times
			if (navbarRetries++ < 15) {
				setTimeout(injectNavbarControls, 350)
			}
			return
		}
		navbarRetries = 0
		// Find existing or inject container
		var container = document.getElementById('rm-navbar-controls')
		if (!container) {
			container = document.createElement('div')
			container.id = 'rm-navbar-controls'
			container.style.cssText = 'display:flex;align-items:center;gap:4px;padding:0 6px;'

			// Insert before the ul.navbar-nav (notification/avatar items)
			var navList = navCollapse.querySelector('ul.navbar-nav')
			if (navList) {
				navCollapse.insertBefore(container, navList)
			} else {
				navCollapse.appendChild(container)
			}
		}

		// Dark toggle
		if (!document.getElementById('rm-dark-toggle')) {
			var darkBtn = document.createElement('button')
			darkBtn.id = 'rm-dark-toggle'
			darkBtn.className = 'rm-settings-btn'
			darkBtn.innerHTML = isDark() ? ICON_SUN : ICON_MOON
			darkBtn.title = isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
			darkBtn.addEventListener('click', function (e) {
				e.stopPropagation()
				toggleDark()
			})
			container.appendChild(darkBtn)
		}

		// Settings (palette) btn
		if (!document.getElementById('rm-settings-btn')) {
			var settingsBtn = document.createElement('button')
			settingsBtn.id = 'rm-settings-btn'
			settingsBtn.className = 'rm-settings-btn'
			settingsBtn.innerHTML = ICON_PALETTE
			settingsBtn.title = 'Theme Settings'
			settingsBtn.addEventListener('click', function (e) {
				e.stopPropagation()
				toggleSettingsPanel()
			})
			container.appendChild(settingsBtn)
		}

		injectSettingsPanel()
	}

	/* ─────────────────────────────────────────────
	   THEME SETTINGS PANEL
	───────────────────────────────────────────── */
	function injectSettingsPanel() {
		if (document.getElementById('rm-theme-panel')) return

		var panel = document.createElement('div')
		panel.id = 'rm-theme-panel'
		panel.className = 'rm-theme-panel'

		var paletteButtons = PALETTES.map(function (p) {
			return '<button class="rm-palette-btn" data-palette="' + p.id + '">' +
				'<span class="rm-color-dot" style="background:' + p.color + '"></span>' +
				p.label +
				'</button>'
		}).join('')

		panel.innerHTML =
			'<div class="rm-theme-panel__header">' +
				'<span>Theme Settings</span>' +
				'<button class="rm-theme-panel__close" id="rm-panel-close">' + ICON_CLOSE + '</button>' +
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
			'</div>'

		document.body.appendChild(panel)

		// Palette buttons
		var btns = panel.querySelectorAll('.rm-palette-btn')
		for (var i = 0; i < btns.length; i++) {
			(function (btn) {
				btn.addEventListener('click', function () {
					applyPalette(btn.getAttribute('data-palette'))
				})
			})(btns[i])
		}

		// Dark row toggle
		document.getElementById('rm-dark-row').addEventListener('click', function () {
			toggleDark()
		})

		// Close button
		document.getElementById('rm-panel-close').addEventListener('click', function (e) {
			e.stopPropagation()
			closeSettingsPanel()
		})

		// Close on outside click
		document.addEventListener('click', function (e) {
			var p = document.getElementById('rm-theme-panel')
			var b = document.getElementById('rm-settings-btn')
			if (p && p.classList.contains('rm-open') && !p.contains(e.target) && e.target !== b) {
				closeSettingsPanel()
			}
		})

		updateSettingsPanelState()
	}

	function openSettingsPanel() {
		var panel = document.getElementById('rm-theme-panel')
		var btn   = document.getElementById('rm-settings-btn')
		if (panel) panel.classList.add('rm-open')
		if (btn)   btn.classList.add('rm-active')
	}

	function closeSettingsPanel() {
		var panel = document.getElementById('rm-theme-panel')
		var btn   = document.getElementById('rm-settings-btn')
		if (panel) panel.classList.remove('rm-open')
		if (btn)   btn.classList.remove('rm-active')
	}

	function toggleSettingsPanel() {
		var panel = document.getElementById('rm-theme-panel')
		if (panel && panel.classList.contains('rm-open')) closeSettingsPanel()
		else openSettingsPanel()
	}

	function updateSettingsPanelState() {
		var panel = document.getElementById('rm-theme-panel')
		if (!panel) return

		// Update active palette button
		var cur = getPalette()
		var btns = panel.querySelectorAll('.rm-palette-btn')
		for (var i = 0; i < btns.length; i++) {
			if (btns[i].getAttribute('data-palette') === cur) {
				btns[i].classList.add('rm-active')
			} else {
				btns[i].classList.remove('rm-active')
			}
		}

		// Update dark mode switch
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

	/* ─────────────────────────────────────────────
	   LIST VIEW ROW ANIMATIONS
	───────────────────────────────────────────── */
	function animateListRows(container) {
		var rows = container.querySelectorAll('.list-row, .result')
		for (var i = 0; i < rows.length; i++) {
			if (!rows[i].classList.contains('rm-row-visible')) {
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
	}

	function initListAnimations() {
		if (listObserver) listObserver.disconnect()

		listObserver = new MutationObserver(function (mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var added = mutations[i].addedNodes
				for (var j = 0; j < added.length; j++) {
					var node = added[j]
					if (node.nodeType !== 1) continue
					if (node.classList && (node.classList.contains('frappe-list') || node.classList.contains('list-result'))) {
						animateListRows(node)
					} else if (node.querySelector) {
						var list = node.querySelector('.frappe-list, .list-result')
						if (list) animateListRows(list)
					}
				}
			}
		})

		listObserver.observe(document.body, { childList: true, subtree: true })

		// Animate any existing list rows
		var existing = document.querySelectorAll('.frappe-list, .list-result')
		for (var k = 0; k < existing.length; k++) {
			animateListRows(existing[k])
		}
	}

	/* ─────────────────────────────────────────────
	   STICKY PAGE HEAD — adds shadow when scrolled
	───────────────────────────────────────────── */
	function initScrollStickyHead() {
		if (scrollListener) {
			window.removeEventListener('scroll', scrollListener, true)
		}
		scrollListener = function () {
			var head = document.querySelector('.page-head')
			if (!head) return
			if (window.scrollY > 10) {
				head.classList.add('rm-scrolled')
			} else {
				head.classList.remove('rm-scrolled')
			}
		}
		window.addEventListener('scroll', scrollListener, { passive: true, capture: true })
	}

	/* ─────────────────────────────────────────────
	   FRAPPE CHARTS COLOR OVERRIDE
	───────────────────────────────────────────── */
	function overrideFrappeCharts() {
		if (!window.frappe || !window.frappe.Chart) return

		var RM_COLORS = [
			'#1556d4', // rm-primary blue
			'#f25c22', // rm-accent orange
			'#0d6b3c', // green
			'#5e3bb7', // purple
			'#9a3f12', // sunrise brown
			'#0369a1', // cyan-blue
			'#a02a6a', // pink
			'#7a5c00', // yellow-dark
			'#374463', // grey-navy
			'#0a5c34', // dark green
		]

		var OrigChart = window.frappe.Chart
		window.frappe.Chart = function (el, config) {
			if (config && !config.colors) {
				config.colors = RM_COLORS
			} else if (config && config.colors && config.colors.length === 0) {
				config.colors = RM_COLORS
			}
			return new OrigChart(el, config)
		}

		// Preserve prototype and static properties
		window.frappe.Chart.prototype = OrigChart.prototype
		for (var key in OrigChart) {
			if (Object.prototype.hasOwnProperty.call(OrigChart, key)) {
				window.frappe.Chart[key] = OrigChart[key]
			}
		}
	}

	/* ─────────────────────────────────────────────
	   WORKSPACE ROUTE HELPERS
	───────────────────────────────────────────── */
	function getRoute() {
		return (window.frappe && window.frappe.get_route && window.frappe.get_route()) || []
	}

	function isWorkspacePage() {
		var r = getRoute()
		return r[0] === 'Workspaces' || window.location.pathname === '/app/home'
	}

	function scheduleEnhancement() {
		window.clearTimeout(workspaceTimer)
		workspaceTimer = window.setTimeout(runEnhancement, 180)
	}

	/* ─────────────────────────────────────────────
	   WORKSPACE ENHANCEMENT
	───────────────────────────────────────────── */
	function getGreeting() {
		var h = new Date().getHours()
		if (h < 12) return 'صباح الخير'
		if (h < 17) return 'مساء الخير'
		return 'مساء النور'
	}

	function getDateLabel() {
		try {
			return new Date().toLocaleDateString('ar-SA', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			})
		} catch (e) {
			return ''
		}
	}

	function runEnhancement() {
		var page = document.querySelector('.page-container[data-page-route="Workspaces"]')
		if (!page || !isWorkspacePage()) {
			if (document.body) document.body.removeAttribute('data-ramotion-workspace')
			return
		}
		if (document.body) document.body.setAttribute('data-ramotion-workspace', '1')
		decorateSidebar(page)
		injectHero(page)
		decorateGroups(page)
		observeWidgets(page)
		colorShortcuts(page)
	}

	/* ── Saudi Riyal Symbol ── */
	function applyRiyalSymbol() {
		// Replace text "ر.س" and "SAR" currency text nodes with ﷼ (U+FDFC)
		var SAR_SYMBOL = '\uFDFC'
		var walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			null,
			false
		)
		var nodes = []
		var node
		while ((node = walker.nextNode())) {
			if (node.nodeValue && node.nodeValue.indexOf('ر.س') !== -1) {
				nodes.push(node)
			}
		}
		nodes.forEach(function(n) {
			n.nodeValue = n.nodeValue.replace(/ر\.س/g, SAR_SYMBOL)
		})
	}

	// Run on page load and on every navigation
	document.addEventListener('DOMContentLoaded', applyRiyalSymbol)
	document.addEventListener('page-change', function() {
		setTimeout(applyRiyalSymbol, 400)
	})
	// Observe DOM for dynamically rendered currency values
	if (window.MutationObserver) {
		var sarObserver = new MutationObserver(function(mutations) {
			var needed = false
			mutations.forEach(function(m) {
				m.addedNodes.forEach(function(n) {
					if (n.textContent && n.textContent.indexOf('ر.س') !== -1) needed = true
				})
			})
			if (needed) applyRiyalSymbol()
		})
		sarObserver.observe(document.body || document.documentElement, { childList: true, subtree: true })
	}

	function colorShortcuts(page) {
		var colors = ['#0050E6', '#7C3AFF', '#FF3040', '#00B894', '#F59E0B', '#10B981']
		function applyColors() {
			var shortcuts = page.querySelectorAll('.shortcut-widget-box')
			for (var i = 0; i < shortcuts.length; i++) {
				shortcuts[i].setAttribute('data-rm-color-idx', String((i % colors.length) + 1))
			}
			return shortcuts.length
		}
		applyColors()
		// Watch for DOM changes — EditorJS replaces content async
		if (window._rmColorObserver) window._rmColorObserver.disconnect()
		window._rmColorObserver = new MutationObserver(function () { applyColors() })
		window._rmColorObserver.observe(page, { childList: true, subtree: true })
	}

	function decorateSidebar(page) {
		var sidebar = page.querySelector('.desk-sidebar')
		if (!sidebar) return

		// ── Inject brand header (once) ──────────────────────────
		if (!sidebar.querySelector('.rm-sidebar-brand')) {
			var siteName = (window.frappe && window.frappe.boot && window.frappe.boot.sysdefaults && window.frappe.boot.sysdefaults.company)
				|| (window.frappe && window.frappe.sys_defaults && window.frappe.sys_defaults.company)
				|| 'ERP Platform'
			// Shorten to max ~16 chars for display
			var shortName = siteName.length > 16 ? siteName.substring(0, 14) + '…' : siteName
			// First 2 chars as monogram
			var mono = siteName.replace(/[^A-Za-z\u0600-\u06FF\u0750-\u077F]/g, '').substring(0, 2).toUpperCase() || 'RM'

			var brand = document.createElement('div')
			brand.className = 'rm-sidebar-brand'
			brand.innerHTML =
				'<div class="rm-sidebar-brand__icon">' + esc(mono) + '</div>' +
				'<div class="rm-sidebar-brand__info">' +
					'<span class="rm-sidebar-brand__name">' + esc(shortName) + '</span>' +
					'<span class="rm-sidebar-brand__sub">' + __('Workspace') + '</span>' +
				'</div>'
			sidebar.insertBefore(brand, sidebar.firstChild)
		}

		// ── Decorate items ──────────────────────────────────────
		var items = sidebar.querySelectorAll('.sidebar-item-container')
		for (var i = 0; i < items.length; i++) {
			items[i].style.setProperty('--ramotion-item-order', String(i + 1))
			var labelEl = items[i].querySelector('.sidebar-item-label')
			if (labelEl && labelEl.textContent) {
				var fullText = labelEl.textContent.trim()
				// Apply translation if available (for workspace titles not going through __())
				var translatedText = (typeof __ === 'function') ? __(fullText) : fullText
				if (translatedText !== fullText) {
					labelEl.textContent = translatedText
					fullText = translatedText
				}
				items[i].setAttribute('data-ramotion-label', fullText.charAt(0).toUpperCase())
				// Add tooltip for truncated labels (over 18 chars)
				if (fullText.length > 18) {
					var anchor = items[i].querySelector('.item-anchor')
					if (anchor) anchor.setAttribute('title', fullText)
				}
			}
		}
	}

	function getWorkspaceTitle(page) {
		var selLabel  = page.querySelector('.desk-sidebar-item.selected .sidebar-item-label')
		var pageTitle = document.querySelector('.page-title .title-text')
		return (selLabel  && selLabel.textContent  && selLabel.textContent.trim())  ||
		       (pageTitle && pageTitle.textContent && pageTitle.textContent.trim()) ||
		       'Home'
	}

	function getLiveTime() {
		var now = new Date()
		var h   = String(now.getHours()).padStart(2, '0')
		var m   = String(now.getMinutes()).padStart(2, '0')
		return h + ':' + m
	}

	function injectHero(page) {
		var content = page.querySelector('.layout-main-section')
		var editor  = content && content.querySelector('.editor-js-container')
		if (!content || !editor) return

		var title        = getWorkspaceTitle(page)
		var groups       = page.querySelectorAll('.widget-group').length
		var shortcuts    = page.querySelectorAll('.shortcut-widget-box').length
		var insightCards = page.querySelectorAll('.number-widget-box').length
		var links        = page.querySelectorAll('.links-widget-box .link-item').length
		var greeting     = getGreeting()
		var dateLabel    = getDateLabel()
		var timeLabel    = getLiveTime()

		var hero = content.querySelector('.ramotion-workspace-hero')
		if (!hero) {
			hero = document.createElement('section')
			hero.className = 'ramotion-workspace-hero'
			content.insertBefore(hero, editor)
		}

		hero.innerHTML =
			'<div class="ramotion-workspace-hero__copy">' +
				'<div class="ramotion-workspace-hero__eyebrow">' +
					esc(greeting) +
					(dateLabel ? ' &nbsp;·&nbsp; ' + esc(dateLabel) : '') +
					' &nbsp;·&nbsp; <span id="rm-hero-clock">' + esc(timeLabel) + '</span>' +
				'</div>' +
				'<h1>' + esc(title) + '</h1>' +
			'</div>' +
			'<div class="ramotion-workspace-hero__stats">' +
				'<div class="ramotion-hero-stat"><span class="ramotion-hero-stat__label">' + __('Sections')  + '</span><strong>'  + groups      + '</strong></div>' +
				'<div class="ramotion-hero-stat"><span class="ramotion-hero-stat__label">' + __('Shortcuts') + '</span><strong>' + shortcuts   + '</strong></div>' +
				'<div class="ramotion-hero-stat"><span class="ramotion-hero-stat__label">' + __('Reports')   + '</span><strong>'   + insightCards+ '</strong></div>' +
				'<div class="ramotion-hero-stat"><span class="ramotion-hero-stat__label">' + __('Links')     + '</span><strong>'     + links       + '</strong></div>' +
			'</div>'

		// Live clock update every minute
		window.clearInterval(window._rmClockTimer)
		window._rmClockTimer = window.setInterval(function () {
			var el = document.getElementById('rm-hero-clock')
			if (el) el.textContent = getLiveTime()
			else window.clearInterval(window._rmClockTimer)
		}, 30000)
	}

	function decorateGroups(page) {
		var groups = page.querySelectorAll('.widget-group')
		for (var i = 0; i < groups.length; i++) {
			if (i === 0) groups[i].classList.add('ramotion-feature-group')
			else groups[i].classList.remove('ramotion-feature-group')
			if (i === 1) groups[i].classList.add('ramotion-secondary-group')
			else groups[i].classList.remove('ramotion-secondary-group')
			groups[i].style.setProperty('--ramotion-group-index', String(i + 1))

			// Set widget count on group head for CSS counter display
			var head = groups[i].querySelector('.widget-group-head')
			var widgetCount = groups[i].querySelectorAll('.widget').length
			if (head && widgetCount > 0) {
				head.setAttribute('data-rm-count', widgetCount + (widgetCount === 1 ? ' item' : ' items'))
			}
		}
	}

	function observeWidgets(page) {
		if (intersectionObserver) intersectionObserver.disconnect()
		var widgets = page.querySelectorAll('.widget')
		if (!widgets.length) return

		for (var i = 0; i < widgets.length; i++) {
			widgets[i].style.setProperty('--ramotion-widget-index', String(i + 1))
			if (!widgets[i].classList.contains('ramotion-widget-visible')) {
				widgets[i].classList.add('ramotion-widget-enter')
			}
		}

		if (!window.IntersectionObserver) return

		intersectionObserver = new IntersectionObserver(function (entries) {
			for (var j = 0; j < entries.length; j++) {
				if (entries[j].isIntersecting) {
					entries[j].target.classList.add('ramotion-widget-visible')
					intersectionObserver.unobserve(entries[j].target)
				}
			}
		}, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })

		for (var k = 0; k < widgets.length; k++) {
			intersectionObserver.observe(widgets[k])
		}
	}

	/* ─────────────────────────────────────────────
	   PUBLIC API
	───────────────────────────────────────────── */
	window.RamotionTheme = {
		applyPalette: applyPalette,
		getPalette:   getPalette,
		setDark:      setDark,
		isDark:       isDark,
		toggleDark:   toggleDark,
	}

	/* ─────────────────────────────────────────────
	   INIT
	───────────────────────────────────────────── */
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bootstrapTheme)
	} else {
		bootstrapTheme()
	}

	document.addEventListener('page-change', function () {
		bootstrapTheme()
		scheduleEnhancement()
	})

	document.addEventListener('ramotion-theme:change', scheduleEnhancement)
	window.addEventListener('hashchange', scheduleEnhancement)
})()
