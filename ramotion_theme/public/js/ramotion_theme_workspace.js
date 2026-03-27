;(function (window) {
	'use strict'

	var runtime = window.RamotionThemeRuntime
	if (!runtime) return

	var state = runtime.state
	var helpers = runtime.helpers

	function getRoute() {
		return (window.frappe && window.frappe.get_route && window.frappe.get_route()) || []
	}

	function isWorkspacePage() {
		var route = getRoute()
		return route[0] === 'Workspaces' || window.location.pathname === '/app/home'
	}

	function scheduleEnhancement() {
		window.clearTimeout(state.workspaceTimer)
		state.workspaceTimer = window.setTimeout(runEnhancement, 180)
	}

	function scheduleWorkspaceRefresh() {
		window.clearTimeout(state.workspaceRefreshTimer)
		state.workspaceRefreshTimer = window.setTimeout(function () {
			var page = document.querySelector('.page-container[data-page-route="Workspaces"]')
			if (page && isWorkspacePage()) runEnhancement()
		}, 120)
	}

	function getGreeting() {
		var hour = new Date().getHours()
		if (hour < 12) return 'صباح الخير'
		if (hour < 17) return 'مساء الخير'
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
			if (state.workspaceObserver) state.workspaceObserver.disconnect()
			if (document.body) document.body.removeAttribute('data-ramotion-workspace')
			return
		}

		if (document.body) document.body.setAttribute('data-ramotion-workspace', '1')
		decorateSidebar(page)
		injectHero(page)
		decorateGroups(page)
		observeWidgets(page)
		colorShortcuts(page)
		watchWorkspaceChanges(page)
	}

	function watchWorkspaceChanges(page) {
		if (!window.MutationObserver) return

		var content = page.querySelector('.layout-main-section')
		var editor = content && content.querySelector('.editor-js-container')
		var sidebar = page.querySelector('.desk-sidebar')

		if (state.workspaceObserver) state.workspaceObserver.disconnect()

		state.workspaceObserver = new MutationObserver(function () {
			scheduleWorkspaceRefresh()
		})

		if (editor) {
			state.workspaceObserver.observe(editor, {
				childList: true,
				subtree: true,
			})
		}

		if (sidebar) {
			state.workspaceObserver.observe(sidebar, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['class'],
			})
		}
	}

	function colorShortcuts(page) {
		var colors = ['#0050E6', '#7C3AFF', '#FF3040', '#00B894', '#F59E0B', '#10B981']

		function applyColors() {
			var shortcuts = page.querySelectorAll('.shortcut-widget-box')
			for (var i = 0; i < shortcuts.length; i++) {
				shortcuts[i].setAttribute('data-rm-color-idx', String((i % colors.length) + 1))
			}
		}

		applyColors()
		if (state.colorObserver) state.colorObserver.disconnect()
		state.colorObserver = new MutationObserver(function () {
			applyColors()
		})
		state.colorObserver.observe(page, { childList: true, subtree: true })
	}

	function decorateSidebar(page) {
		var sidebar = page.querySelector('.desk-sidebar')
		if (!sidebar) return

		if (!sidebar.querySelector('.rm-sidebar-brand')) {
			var siteName = (window.frappe && window.frappe.boot && window.frappe.boot.sysdefaults && window.frappe.boot.sysdefaults.company)
				|| (window.frappe && window.frappe.sys_defaults && window.frappe.sys_defaults.company)
				|| 'ERP Platform'
			var shortName = siteName.length > 16 ? siteName.substring(0, 14) + '…' : siteName
			var mono = siteName.replace(/[^A-Za-z\u0600-\u06FF\u0750-\u077F]/g, '').substring(0, 2).toUpperCase() || 'RM'

			var brand = document.createElement('div')
			var icon = document.createElement('div')
			var info = document.createElement('div')
			var name = document.createElement('span')
			var sub = document.createElement('span')
			brand.className = 'rm-sidebar-brand'

			icon.className = 'rm-sidebar-brand__icon'
			icon.textContent = mono

			info.className = 'rm-sidebar-brand__info'
			name.className = 'rm-sidebar-brand__name'
			name.textContent = shortName
			sub.className = 'rm-sidebar-brand__sub'
			sub.textContent = helpers.translateText('Workspace')

			info.appendChild(name)
			info.appendChild(sub)
			brand.appendChild(icon)
			brand.appendChild(info)
			sidebar.insertBefore(brand, sidebar.firstChild)
		}

		var items = sidebar.querySelectorAll('.sidebar-item-container')
		for (var i = 0; i < items.length; i++) {
			items[i].style.setProperty('--ramotion-item-order', String(i + 1))
			var labelEl = items[i].querySelector('.sidebar-item-label')
			if (!labelEl || !labelEl.textContent) continue

			var fullText = labelEl.textContent.trim()
			var translatedText = helpers.translateText(fullText)
			if (translatedText !== fullText) {
				labelEl.textContent = translatedText
				fullText = translatedText
			}

			items[i].setAttribute('data-ramotion-label', fullText.charAt(0).toUpperCase())
			if (fullText.length > 18) {
				var anchor = items[i].querySelector('.item-anchor')
				if (anchor) anchor.setAttribute('title', fullText)
			}
		}
	}

	function getWorkspaceTitle(page) {
		function normalizePath(path) {
			return String(path || '').replace(/[?#].*$/, '').replace(/\/+$/, '')
		}

		function getRouteTitle() {
			var route = getRoute()
			if (!route || route[0] !== 'Workspaces' || !route[1]) return ''
			return helpers.translateText(route[1])
		}

		function getSidebarRouteLabel() {
			var currentPath = normalizePath(window.location.pathname)
			var links = page.querySelectorAll('.desk-sidebar a[href]')
			for (var i = 0; i < links.length; i++) {
				var href = normalizePath(links[i].getAttribute('href'))
				if (!href || href === '/app') continue
				if (href === currentPath) {
					var label = links[i].querySelector('.sidebar-item-label')
					var text = (label && label.textContent) || links[i].textContent
					if (text && text.trim()) return text.trim()
				}
			}
			return ''
		}

		var pageTitle =
			document.querySelector('.page-head h3') ||
			document.querySelector('.page-title .title-text') ||
			document.querySelector('.title-area .title-text')
		var routeTitle = getRouteTitle()
		var sidebarTitle = getSidebarRouteLabel()
		var activeLink =
			page.querySelector('.desk-sidebar .selected .sidebar-item-label') ||
			page.querySelector('.desk-sidebar .sidebar-item-container a.active .sidebar-item-label')

		return routeTitle ||
			sidebarTitle ||
			(pageTitle && pageTitle.textContent && pageTitle.textContent.trim()) ||
			(activeLink && activeLink.textContent && activeLink.textContent.trim()) ||
			'Home'
	}

	function getWorkspaceMetrics(page) {
		return {
			groups: page.querySelectorAll('.widget-group').length,
			shortcuts: page.querySelectorAll('.shortcut-widget-box').length,
			insightCards: page.querySelectorAll('.number-widget-box').length,
			links: page.querySelectorAll('.links-widget-box .link-item').length,
		}
	}

	function getLiveTime() {
		var now = new Date()
		var hours = String(now.getHours()).padStart(2, '0')
		var minutes = String(now.getMinutes()).padStart(2, '0')
		return hours + ':' + minutes
	}

	function injectHero(page) {
		function createHeroStat(label, value) {
			var stat = document.createElement('div')
			var statLabel = document.createElement('span')
			var statValue = document.createElement('strong')

			stat.className = 'ramotion-hero-stat'
			statLabel.className = 'ramotion-hero-stat__label'
			statLabel.textContent = label
			statValue.textContent = String(value)

			stat.appendChild(statLabel)
			stat.appendChild(statValue)
			return stat
		}

		var content = page.querySelector('.layout-main-section')
		var editor = content && content.querySelector('.editor-js-container')
		if (!content || !editor) return

		var title = getWorkspaceTitle(page)
		var metrics = getWorkspaceMetrics(page)
		var greeting = getGreeting()
		var dateLabel = getDateLabel()
		var timeLabel = getLiveTime()
		var copy = document.createElement('div')
		var eyebrow = document.createElement('div')
		var clock = document.createElement('span')
		var heading = document.createElement('h1')
		var stats = document.createElement('div')

		var hero = content.querySelector('.ramotion-workspace-hero')
		if (!hero) {
			hero = document.createElement('section')
			hero.className = 'ramotion-workspace-hero'
			content.insertBefore(hero, editor)
		}

		hero.style.background = 'linear-gradient(135deg, #3b414b 0%, #515966 60%, #6c7684 100%)'
		hero.style.boxShadow = '0 24px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.05)'
		hero.style.border = '1px solid rgba(255,255,255,0.05)'

			copy.className = 'ramotion-workspace-hero__copy'
			eyebrow.className = 'ramotion-workspace-hero__eyebrow'
			clock.className = 'rm-hero-clock'
			heading.textContent = title
			stats.className = 'ramotion-workspace-hero__stats'

			eyebrow.appendChild(document.createTextNode(greeting))
			if (dateLabel) {
				eyebrow.appendChild(document.createTextNode(' · ' + dateLabel))
			}
			eyebrow.appendChild(document.createTextNode(' · '))
			clock.textContent = timeLabel
			eyebrow.appendChild(clock)

			copy.appendChild(eyebrow)
			copy.appendChild(heading)
			stats.appendChild(createHeroStat(__('Sections'), metrics.groups))
			stats.appendChild(createHeroStat(__('Shortcuts'), metrics.shortcuts))
			stats.appendChild(createHeroStat(__('Reports'), metrics.insightCards))
			stats.appendChild(createHeroStat(__('Links'), metrics.links))

			hero.replaceChildren(copy, stats)

		window.clearInterval(state.heroClockTimer)
		state.heroClockTimer = window.setInterval(function () {
			var clock = hero.querySelector('.rm-hero-clock')
			if (clock) clock.textContent = getLiveTime()
			else window.clearInterval(state.heroClockTimer)
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

			var head = groups[i].querySelector('.widget-group-head')
			var widgetCount = groups[i].querySelectorAll('.widget').length
			if (head && widgetCount > 0) {
				head.setAttribute('data-rm-count', widgetCount + (widgetCount === 1 ? ' item' : ' items'))
			}
		}
	}

	function observeWidgets(page) {
		if (state.intersectionObserver) state.intersectionObserver.disconnect()
		var widgets = page.querySelectorAll('.widget')
		if (!widgets.length) return

		for (var i = 0; i < widgets.length; i++) {
			widgets[i].style.setProperty('--ramotion-widget-index', String(i + 1))
			if (!widgets[i].classList.contains('ramotion-widget-visible')) {
				widgets[i].classList.add('ramotion-widget-enter')
			}
		}

		if (!window.IntersectionObserver) return

		state.intersectionObserver = new IntersectionObserver(function (entries) {
			for (var j = 0; j < entries.length; j++) {
				if (entries[j].isIntersecting) {
					entries[j].target.classList.add('ramotion-widget-visible')
					state.intersectionObserver.unobserve(entries[j].target)
				}
			}
		}, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })

		for (var k = 0; k < widgets.length; k++) {
			state.intersectionObserver.observe(widgets[k])
		}
	}

	runtime.workspace = {
		getRoute: getRoute,
		isWorkspacePage: isWorkspacePage,
		scheduleEnhancement: scheduleEnhancement,
		runEnhancement: runEnhancement,
	}
})(window)
