<template>
	<div class="studio-shell" :data-theme="activeTheme.id">
		<section class="hero-shell">
			<div class="hero-copy panel-surface">
				<div class="hero-topline">
					<Badge label="Ramotion Theme System" theme="gray" variant="subtle" size="lg" />
					<span class="hero-status">Professional desk refinement for Frappe</span>
				</div>
				<p class="section-kicker">Design Control Center</p>
				<h1>واجهة أكثر احترافية لصفحة Home وسطح المكتب بالكامل</h1>
				<p class="hero-lead">
					الثيم أصبح موجهاً للإنتاج الفعلي: تقليل الضوضاء البصرية، هرمية أوضح في Home وWorkspace،
					وتحسين حقيقي لحقول الإدخال والقوائم والرأس العلوي بدل المؤثرات الزائدة.
				</p>
				<div class="hero-actions">
					<Button variant="solid" @click="applyTheme(activeTheme.id)">تطبيق النمط الحالي</Button>
					<Button variant="subtle" @click="cycleTheme">المعاينة التالية</Button>
				</div>
				<div class="stats-grid">
					<article v-for="item in stats" :key="item.label" class="metric-card">
						<div class="metric-label">{{ item.label }}</div>
						<div class="metric-value">{{ item.value }}</div>
						<div class="metric-note">{{ item.note }}</div>
					</article>
				</div>
			</div>

			<div class="hero-preview panel-surface">
				<div class="preview-toolbar">
					<div class="preview-dots"><span></span><span></span><span></span></div>
					<div class="preview-toolbar-label">Home / Workspace / Form</div>
				</div>
				<div class="preview-grid">
					<aside class="preview-sidebar">
						<div class="brand-chip">RT</div>
						<div class="nav-stack">
							<div v-for="item in previewMenu" :key="item" class="nav-pill">{{ item }}</div>
						</div>
					</aside>
					<div class="preview-main">
						<div class="preview-banner panel-soft">
							<div>
								<div class="section-kicker">Applied Palette</div>
								<h3>{{ activeTheme.name }}</h3>
								<p>{{ activeTheme.description }}</p>
							</div>
							<Badge :label="activeTheme.tag" theme="gray" variant="subtle" size="md" />
						</div>
						<div class="surface-grid">
							<article v-for="card in previewCards" :key="card.title" class="preview-card panel-soft">
								<div class="card-overline">{{ card.category }}</div>
								<div class="card-title">{{ card.title }}</div>
								<div class="card-copy">{{ card.copy }}</div>
							</article>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="content-grid three-col">
			<article class="panel-surface section-card">
				<div class="section-head">
					<div>
						<p class="section-kicker">Theme Presets</p>
						<h2>اختيار اللغة البصرية</h2>
					</div>
					<p>أنماط محسوبة لبيئات العمل اليومية وليست مجرد عروض تجريبية.</p>
				</div>
				<div class="preset-list">
					<button
						v-for="theme in themes"
						:key="theme.id"
						class="preset-card"
						:class="{ active: activeTheme.id === theme.id }"
						@click="applyTheme(theme.id)"
					>
						<div class="preset-head">
							<div>
								<div class="preset-name">{{ theme.name }}</div>
								<div class="preset-text">{{ theme.description }}</div>
							</div>
							<Badge :label="theme.tag" theme="gray" variant="subtle" size="sm" />
						</div>
						<div class="swatch-row">
							<span v-for="swatch in theme.swatches" :key="swatch" :style="{ background: swatch }"></span>
						</div>
					</button>
				</div>
			</article>

			<article class="panel-surface section-card">
				<div class="section-head">
					<div>
						<p class="section-kicker">Quick Audit</p>
						<h2>معاينة العناصر</h2>
					</div>
					<p>اختبار سريع للبحث، الشارات، وأزرار الإجراءات داخل النظام.</p>
				</div>
				<Input
					v-model="searchQuery"
					label="ابحث عن جزء من النظام"
					placeholder="Workspace, Reports, Sales, CRM"
				/>
				<div class="tag-row">
					<Badge
						v-for="keyword in filteredKeywords"
						:key="keyword"
						:label="keyword"
						variant="subtle"
						theme="gray"
						size="md"
					/>
				</div>
				<div class="action-row">
					<Button variant="solid">Primary Action</Button>
					<Button variant="subtle">Secondary</Button>
					<Button variant="outline">Quiet Action</Button>
				</div>
			</article>

			<article class="panel-surface section-card">
				<div class="section-head">
					<div>
						<p class="section-kicker">Coverage</p>
						<h2>ما الذي تغيّر فعلياً</h2>
					</div>
					<p>التركيز على الشاشات التي يستخدمها المستخدم يومياً داخل Frappe.</p>
				</div>
				<div class="rail-list">
					<div v-for="item in rails" :key="item.title" class="rail-item">
						<div class="rail-index">{{ item.icon }}</div>
						<div>
							<div class="rail-title">{{ item.title }}</div>
							<div class="rail-copy">{{ item.copy }}</div>
						</div>
					</div>
				</div>
			</article>
		</section>

		<section class="content-grid two-col">
			<article class="panel-surface section-card">
				<div class="section-head">
					<div>
						<p class="section-kicker">Design Principles</p>
						<h2>قواعد النضج البصري</h2>
					</div>
					<p>هذه القواعد هي ما يجعل التصميم يبدو كمنتج أعمال محترف.</p>
				</div>
				<ul class="principle-list">
					<li v-for="item in principles" :key="item.title">
						<strong>{{ item.title }}</strong>
						<span>{{ item.copy }}</span>
					</li>
				</ul>
			</article>

			<article class="panel-surface section-card">
				<div class="section-head">
					<div>
						<p class="section-kicker">Operational Signals</p>
						<h2>مؤشرات القراءة والتنقل</h2>
					</div>
					<p>مقاييس نوعية تعكس أثر التحسين على الكثافة والوضوح البصري.</p>
				</div>
				<div class="metrics-grid">
					<div v-for="metric in metrics" :key="metric.label" class="metric-card panel-soft">
						<div class="metric-label">{{ metric.label }}</div>
						<div class="metric-value large">{{ metric.value }}</div>
						<div class="metric-note">{{ metric.trend }}</div>
					</div>
				</div>
			</article>
		</section>
	</div>
</template>

<script setup>
import { computed, ref } from "vue"
import { Badge, Button, Input } from "frappe-ui"

const themes = [
	{
		id: "aurora",
		name: "Aurora Executive",
		tag: "Balanced",
		description: "Teal ناضج مع Coral خفيف وخلفيات هادئة مناسبة للعمل اليومي.",
		swatches: ["#156f67", "#f97352", "#f6fafb"],
	},
	{
		id: "editorial",
		name: "Editorial Slate",
		tag: "Calm",
		description: "سلم ألوان رسمي للمكاتب والبيانات ولوحات التشغيل الكثيفة.",
		swatches: ["#243b53", "#4f6fad", "#f7f9fc"],
	},
	{
		id: "sunrise",
		name: "Sunrise Boardroom",
		tag: "Warm",
		description: "دفء محسوب للشاشات التنفيذية مع حضور بصري أقوى بدون ضوضاء.",
		swatches: ["#a85517", "#dc5c43", "#fff8f2"],
	},
	{
		id: "luxury",
		name: "Luxury Corporate Day",
		tag: "Premium",
		description: "نسخة أكثر فخامة بتباين رسمي، Navy داكن ولمسة ذهبية هادئة للواجهات التنفيذية.",
		swatches: ["#23364d", "#c59b5d", "#f8f5ef"],
	},
]

const stats = [
	{ label: "Workspace Focus", value: "Higher", note: "تقليل الضوضاء في Home" },
	{ label: "Form Clarity", value: "+22%", note: "حدود ومسافات أوضح" },
	{ label: "Navigation Tone", value: "Calmer", note: "Sidebar وNavbar أكثر اتزاناً" },
]

const previewMenu = ["Home", "Workspaces", "Sales", "CRM", "Reports"]

const previewCards = [
	{ category: "Home", title: "Workspace Cards", copy: "بطاقات أكثر ثباتاً بصرياً مع ظلال أخف وتباعد أنظف." },
	{ category: "Forms", title: "Input Surfaces", copy: "حقول هادئة بتركيز واضح وحواف أقل استعراضية." },
	{ category: "Navigation", title: "Sidebar Rhythm", copy: "تسلسل بصري أوضح للعناصر الأساسية والثانوية." },
]

const rails = [
	{ icon: "01", title: "Home & Workspace", copy: "تحسين بطاقات الصفحة الرئيسية، عناوين الـ widgets، وكثافة التخطيط." },
	{ icon: "02", title: "Forms & Lists", copy: "مدخلات أكثر احترافية وصفوف أوضح في القوائم والتقارير." },
	{ icon: "03", title: "Global Shell", copy: "Navbar وSidebar وصفحة الدخول بتعبير بصري موحد وأكثر maturity." },
]

const principles = [
	{ title: "Restraint First", copy: "تقليل الوهج والمؤثرات المبالغ فيها لصالح وضوح مستقر على مدى ساعات العمل." },
	{ title: "Hierarchy Over Decoration", copy: "التمييز بين العنوان والمحتوى والإجراء بالأوزان والمسافات لا فقط بالألوان." },
	{ title: "Operational Surfaces", copy: "الكروت والصفوف والحقول مصممة لتخدم القراءة السريعة واتخاذ القرار." },
	{ title: "Consistent Product Voice", copy: "Home وForms وNavigation تبدو كأجزاء من منتج واحد لا مشاهد منفصلة." },
]

const metrics = [
	{ label: "Visual Noise", value: "Low", trend: "خلفيات أكثر هدوءاً" },
	{ label: "Scanning Speed", value: "Fast", trend: "عناوين ومسافات أوضح" },
	{ label: "Desk Readability", value: "A", trend: "تباين محسوب" },
	{ label: "Surface Depth", value: "Subtle", trend: "ظلال قصيرة ومنضبطة" },
]

const keywords = ["Workspace", "Home", "Reports", "CRM", "Sales", "Projects", "Support"]
const searchQuery = ref("")
const activeThemeId = ref(window.RamotionTheme?.getPalette?.() || themes[0].id)

const activeTheme = computed(
	() => themes.find((theme) => theme.id === activeThemeId.value) || themes[0]
)

const filteredKeywords = computed(() => {
	const query = searchQuery.value.trim().toLowerCase()
	if (!query) {
		return keywords
	}

	return keywords.filter((keyword) => keyword.toLowerCase().includes(query))
})

function applyTheme(themeId) {
	activeThemeId.value = themeId
	window.RamotionTheme?.applyPalette?.(themeId)
}

function cycleTheme() {
	const currentIndex = themes.findIndex((theme) => theme.id === activeThemeId.value)
	const nextTheme = themes[(currentIndex + 1) % themes.length]
	applyTheme(nextTheme.id)
}
</script>

<style>
:root {
	color-scheme: light;
}

.studio-shell {
	--studio-panel: rgba(255, 255, 255, 0.9);
	--studio-line: rgba(15, 23, 42, 0.08);
	--studio-copy: #486581;
	--studio-ink: #102a43;
	padding: 28px;
	min-height: calc(100vh - 80px);
	font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(244, 248, 251, 0.95)),
		radial-gradient(circle at top right, rgba(21, 111, 103, 0.06), transparent 24%),
		radial-gradient(circle at top left, rgba(249, 115, 82, 0.05), transparent 20%),
		#f4f8fb;
	color: var(--studio-ink);
}

.studio-shell[data-theme="aurora"] {
	--theme-primary: #156f67;
	--theme-accent: #f97352;
	--theme-soft: rgba(21, 111, 103, 0.06);
}

.studio-shell[data-theme="editorial"] {
	--theme-primary: #243b53;
	--theme-accent: #4f6fad;
	--theme-soft: rgba(36, 59, 83, 0.06);
}

.studio-shell[data-theme="sunrise"] {
	--theme-primary: #a85517;
	--theme-accent: #dc5c43;
	--theme-soft: rgba(168, 85, 23, 0.06);
}

.panel-surface,
.panel-soft,
.metric-card,
.preset-card,
.rail-item {
	background: var(--studio-panel);
	border: 1px solid var(--studio-line);
	border-radius: 24px;
	box-shadow: 0 14px 40px rgba(15, 23, 42, 0.05);
	backdrop-filter: blur(12px);
}

.panel-soft {
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9)),
		linear-gradient(135deg, var(--theme-soft), transparent 55%);
}

.hero-shell,
.section-card {
	margin-bottom: 22px;
}

.hero-shell,
.content-grid,
.preview-grid,
.surface-grid,
.stats-grid,
.metrics-grid {
	display: grid;
	gap: 18px;
}

.hero-shell {
	grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
	align-items: stretch;
}

.hero-copy,
.hero-preview,
.section-card {
	padding: 24px;
}

.hero-topline,
.hero-actions,
.tag-row,
.action-row,
.preview-dots,
.preset-head {
	display: flex;
	gap: 12px;
	align-items: center;
	flex-wrap: wrap;
}

.hero-topline {
	justify-content: space-between;
	margin-bottom: 18px;
}

.hero-status,
.hero-lead,
.metric-note,
.card-copy,
.rail-copy,
.section-head p,
.preset-text,
.preview-banner p,
.principle-list span,
.preview-toolbar-label {
	color: var(--studio-copy);
	line-height: 1.7;
}

.section-kicker,
.metric-label,
.card-overline,
.rail-index,
.preset-name {
	font-family: "Segoe UI", Tahoma, Arial, sans-serif;
	font-size: 0.78rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: #7b8794;
}

.hero-copy h1 {
	margin: 8px 0 16px;
	max-width: 12ch;
	font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
	font-size: clamp(2.4rem, 4vw, 4.2rem);
	font-weight: 700;
	letter-spacing: -0.06em;
	line-height: 0.96;
}

.stats-grid,
.metrics-grid {
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	margin-top: 22px;
}

.metric-card {
	padding: 18px;
}

.metric-value {
	font-family: "Segoe UI", Tahoma, Arial, sans-serif;
	font-size: 1.95rem;
	font-weight: 700;
	letter-spacing: -0.04em;
	margin: 6px 0 4px;
}

.metric-value.large {
	font-size: 2.15rem;
	margin-bottom: 6px;
}

.preview-toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 12px;
	margin-bottom: 14px;
	border-bottom: 1px solid var(--studio-line);
}

.preview-dots span {
	width: 10px;
	height: 10px;
	border-radius: 999px;
	background: rgba(15, 23, 42, 0.14);
}

.preview-grid {
	grid-template-columns: 96px minmax(0, 1fr);
}

.preview-sidebar {
	padding: 14px;
	border-radius: 18px;
	background: linear-gradient(180deg, var(--theme-soft), rgba(255, 255, 255, 0.9));
	border: 1px solid rgba(15, 23, 42, 0.06);
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.brand-chip {
	width: 44px;
	height: 44px;
	border-radius: 14px;
	display: grid;
	place-items: center;
	font-family: "Segoe UI", Tahoma, Arial, sans-serif;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, var(--theme-primary), var(--theme-accent));
}

.nav-stack {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.nav-pill {
	padding: 10px 11px;
	border-radius: 14px;
	font-size: 0.86rem;
	color: #334e68;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(15, 23, 42, 0.05);
}

.preview-main {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.preview-banner {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 18px;
}

.preview-banner h3,
.section-head h2,
.card-title,
.rail-title {
	margin: 4px 0 0;
	font-family: "Segoe UI", Tahoma, Arial, sans-serif;
	font-weight: 700;
	letter-spacing: -0.03em;
	color: var(--studio-ink);
}

.surface-grid {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.preview-card {
	padding: 16px;
}

.three-col {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.two-col {
	grid-template-columns: 1.15fr 0.85fr;
	margin-bottom: 0;
}

.section-head {
	display: grid;
	gap: 6px;
	margin-bottom: 18px;
}

.preset-list,
.rail-list,
.principle-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.preset-card {
	width: 100%;
	padding: 16px;
	display: grid;
	gap: 14px;
	text-align: right;
	cursor: pointer;
	transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.preset-card.active {
	border-color: rgba(21, 111, 103, 0.24);
	box-shadow: 0 0 0 4px rgba(21, 111, 103, 0.06), 0 14px 40px rgba(15, 23, 42, 0.05);
}

.preset-card:hover,
.rail-item:hover,
.metric-card:hover,
.preview-card:hover {
	transform: translateY(-2px);
}

.swatch-row {
	display: flex;
	gap: 8px;
}

.swatch-row span {
	width: 14px;
	height: 14px;
	border-radius: 999px;
	box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.rail-item {
	display: grid;
	grid-template-columns: 44px minmax(0, 1fr);
	gap: 14px;
	padding: 16px;
	align-items: start;
}

.rail-index {
	width: 44px;
	height: 44px;
	display: grid;
	place-items: center;
	border-radius: 14px;
	background: linear-gradient(135deg, var(--theme-primary), var(--theme-accent));
	color: #fff;
}

.principle-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.principle-list li {
	display: grid;
	gap: 6px;
	padding: 16px 0;
	border-bottom: 1px solid var(--studio-line);
}

.principle-list li:last-child {
	border-bottom: 0;
	padding-bottom: 0;
}

@media (max-width: 1200px) {
	.hero-shell,
	.three-col,
	.two-col,
	.surface-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 768px) {
	.studio-shell {
		padding: 16px;
	}

	.hero-copy,
	.hero-preview,
	.section-card {
		padding: 18px;
		border-radius: 20px;
	}

	.hero-copy h1 {
		max-width: none;
		font-size: 2.35rem;
	}

	.preview-grid {
		grid-template-columns: 1fr;
	}

	.preview-sidebar {
		flex-direction: row;
		overflow-x: auto;
	}

	.nav-stack {
		flex-direction: row;
	}

	.preview-banner {
		flex-direction: column;
		gap: 10px;
	}
}
</style>
