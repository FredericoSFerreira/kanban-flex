<template>
  <div class="dv-page">
    <!-- Header -->
    <div class="dv-header">
      <h1 class="dv-title"><BarChart3Icon :size="20" /> Dashboard</h1>
      <p class="dv-subtitle">Visão geral da plataforma</p>
    </div>

    <!-- KPI Cards -->
    <div class="dv-cards">
      <div class="dv-card">
        <div class="dv-card-icon" style="background: rgba(99,102,241,.12); color: #a5b4fc;">
          <UsersIcon :size="22" />
        </div>
        <div class="dv-card-info">
          <span class="dv-card-label">Total Usuários</span>
          <span class="dv-card-value">{{ usersStats.total }}</span>
        </div>
      </div>
      <div class="dv-card">
        <div class="dv-card-icon" style="background: rgba(139,92,246,.12); color: #c4b5fd;">
          <LayoutDashboardIcon :size="22" />
        </div>
        <div class="dv-card-info">
          <span class="dv-card-label">Total Boards</span>
          <span class="dv-card-value">{{ boardsStats.total }}</span>
        </div>
      </div>
      <div class="dv-card">
        <div class="dv-card-icon" style="background: rgba(34,197,94,.12); color: #4ade80;">
          <UserCheckIcon :size="22" />
        </div>
        <div class="dv-card-info">
          <span class="dv-card-label">Usuários Ativos</span>
          <span class="dv-card-value">{{ usersStats.active }}</span>
        </div>
      </div>
      <div class="dv-card">
        <div class="dv-card-icon" style="background: rgba(56,189,248,.12); color: #38bdf8;">
          <GlobeIcon :size="22" />
        </div>
        <div class="dv-card-info">
          <span class="dv-card-label">Boards Públicos</span>
          <span class="dv-card-value">{{ boardsStats.public }}</span>
        </div>
      </div>
      <div class="dv-card">
        <div class="dv-card-icon" style="background: rgba(245,158,11,.12); color: #fbbf24;">
          <CheckSquareIcon :size="22" />
        </div>
        <div class="dv-card-info">
          <span class="dv-card-label">Total Cards</span>
          <span class="dv-card-value">{{ boardsStats.totalCards }}</span>
        </div>
      </div>
      <div class="dv-card">
        <div class="dv-card-icon" style="background: rgba(236,72,153,.12); color: #f472b6;">
          <PaperclipIcon :size="22" />
        </div>
        <div class="dv-card-info">
          <span class="dv-card-label">Total Anexos</span>
          <span class="dv-card-value">{{ attachmentsStats.total }}</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="dv-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="dv-tab"
        :class="{ 'dv-tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" :size="15" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="dv-state">
      <div class="spinner"></div>
      <span>Carregando dados...</span>
    </div>

    <template v-else>
      <!-- Tab: Dashboard -->
      <div v-if="activeTab === 'dashboard'" class="dv-tab-content">
        <div class="dv-row">
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Usuários</h3>
            <div class="dv-chart-wrap"><canvas ref="usersChartRef"></canvas></div>
          </div>
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Boards</h3>
            <div class="dv-chart-wrap"><canvas ref="boardsChartRef"></canvas></div>
          </div>
        </div>
        <div class="dv-row">
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Crescimento de Usuários</h3>
            <div class="dv-chart-wrap"><canvas ref="usersGrowthRef"></canvas></div>
          </div>
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Crescimento de Boards</h3>
            <div class="dv-chart-wrap"><canvas ref="boardsGrowthRef"></canvas></div>
          </div>
        </div>
        <div class="dv-chart-card dv-chart-card--full">
          <h3 class="dv-chart-title">Top 5 Boards com mais Cards</h3>
          <div class="dv-chart-wrap"><canvas ref="topBoardsRef"></canvas></div>
        </div>
      </div>

      <!-- Tab: Atividade -->
      <div v-if="activeTab === 'activity'" class="dv-tab-content">
        <div class="dv-chart-card dv-chart-card--full">
          <h3 class="dv-chart-title">Heatmap de Acessos (últimos 30 dias)</h3>
          <div class="dv-heatmap">
            <div class="dv-heatmap-labels-y">
              <span v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" :key="day">{{ day }}</span>
            </div>
            <div class="dv-heatmap-grid">
              <div class="dv-heatmap-labels-x">
                <span v-for="h in [0, 4, 8, 12, 16, 20]" :key="h">{{ h }}h</span>
              </div>
              <div class="dv-heatmap-rows">
                <div v-for="(row, dayIdx) in heatmapData" :key="dayIdx" class="dv-heatmap-row">
                  <div
                    v-for="(val, hourIdx) in row"
                    :key="hourIdx"
                    class="dv-heatmap-cell"
                    :style="{ backgroundColor: getHeatmapColor(val) }"
                    :title="`${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayIdx]} ${hourIdx}h: ${val} acessos`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dv-row">
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Taxa de Engajamento (30 dias)</h3>
            <div class="dv-chart-wrap"><canvas ref="engagementRef"></canvas></div>
          </div>
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Cards por Coluna (média)</h3>
            <div class="dv-chart-wrap"><canvas ref="columnDistRef"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Tab: Crescimento -->
      <div v-if="activeTab === 'growth'" class="dv-tab-content">
        <div class="dv-chart-card dv-chart-card--full">
          <h3 class="dv-chart-title">Evolução Público vs Privado</h3>
          <div class="dv-chart-wrap" style="height: 300px;"><canvas ref="visibilityTrendRef"></canvas></div>
        </div>
        <div class="dv-row">
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Anexos por Mês</h3>
            <div class="dv-chart-wrap"><canvas ref="attachmentsGrowthRef"></canvas></div>
          </div>
          <div class="dv-chart-card">
            <h3 class="dv-chart-title">Armazenamento por Mês (MB)</h3>
            <div class="dv-chart-wrap"><canvas ref="storageGrowthRef"></canvas></div>
          </div>
        </div>
        <div class="dv-chart-card dv-chart-card--full" style="max-width: 500px; margin: 0 auto;">
          <h3 class="dv-chart-title">Métodos de Login</h3>
          <div class="dv-chart-wrap"><canvas ref="loginMethodsRef"></canvas></div>
        </div>
      </div>

      <!-- Tab: Colaboração -->
      <div v-if="activeTab === 'collaboration'" class="dv-tab-content">
        <div class="dv-chart-card dv-chart-card--full" style="max-width: 600px; margin: 0 auto;">
          <h3 class="dv-chart-title">Funil de Convites</h3>
          <div class="dv-funnel">
            <div v-for="(item, idx) in funnelData" :key="idx" class="dv-funnel-item" :style="{ width: item.percent + '%', background: item.color }">
              <span class="dv-funnel-label">{{ item.label }}</span>
              <span class="dv-funnel-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div class="dv-chart-card dv-chart-card--full">
          <h3 class="dv-chart-title">Top 5 Boards mais Engajados</h3>
          <div class="dv-chart-wrap"><canvas ref="mostEngagedRef"></canvas></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import {
  BarChart3Icon,
  UsersIcon,
  LayoutDashboardIcon,
  UserCheckIcon,
  GlobeIcon,
  CheckSquareIcon,
  PaperclipIcon,
  LayoutDashboard,
  Activity,
  TrendingUp,
  UsersRound,
} from 'lucide-vue-next'
import {
  Chart, DoughnutController, LineController, BarController, ArcElement,
  LineElement, BarElement, PointElement, CategoryScale, LinearScale,
  Tooltip, Legend, Title, Filler,
} from 'chart.js'
import api from '@/utils/api'

Chart.register(
  DoughnutController, LineController, BarController, ArcElement,
  LineElement, BarElement, PointElement, CategoryScale, LinearScale,
  Tooltip, Legend, Title, Filler
)

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'activity', label: 'Atividade', icon: Activity },
  { key: 'growth', label: 'Crescimento', icon: TrendingUp },
  { key: 'collaboration', label: 'Colaboração', icon: UsersRound },
]

const activeTab = ref('dashboard')
const loading = ref(false)

const usersStats = ref({ total: 0, active: 0, inactive: 0, admins: 0 })
const boardsStats = ref({ total: 0, public: 0, private: 0, totalCards: 0 })
const growth = ref({ usersByMonth: [] as { label: string; count: number }[], boardsByMonth: [] as { label: string; count: number }[] })
const topBoards = ref([] as { name: string; totalCards: number }[])
const heatmapData = ref<number[][]>([])
const engagement = ref({ active: 0, inactive: 0, total: 0 })
const columnDistribution = ref([] as { name: string; avgCards: number; totalCards: number }[])
const attachmentsGrowth = ref({ attachmentsByMonth: [] as { label: string; count: number }[], storageByMonth: [] as { label: string; size: number }[] })
const visibilityTrend = ref({ publicByMonth: [] as { label: string; count: number }[], privateByMonth: [] as { label: string; count: number }[] })
const loginMethods = ref({ email: 0, google: 0, total: 0 })
const inviteFunnel = ref({ total: 0, used: 0, expired: 0, pending: 0 })
const mostEngagedBoards = ref([] as { name: string; engagementScore: number; totalCards: number; totalComments: number; totalVotes: number }[])
const attachmentsStats = ref({ total: 0 })

const usersChartRef = ref<HTMLCanvasElement | null>(null)
const boardsChartRef = ref<HTMLCanvasElement | null>(null)
const usersGrowthRef = ref<HTMLCanvasElement | null>(null)
const boardsGrowthRef = ref<HTMLCanvasElement | null>(null)
const topBoardsRef = ref<HTMLCanvasElement | null>(null)
const engagementRef = ref<HTMLCanvasElement | null>(null)
const columnDistRef = ref<HTMLCanvasElement | null>(null)
const visibilityTrendRef = ref<HTMLCanvasElement | null>(null)
const attachmentsGrowthRef = ref<HTMLCanvasElement | null>(null)
const storageGrowthRef = ref<HTMLCanvasElement | null>(null)
const loginMethodsRef = ref<HTMLCanvasElement | null>(null)
const mostEngagedRef = ref<HTMLCanvasElement | null>(null)

let charts: Chart[] = []

function destroyCharts() {
  charts.forEach(c => c.destroy())
  charts = []
}

function createDoughnut(canvas: HTMLCanvasElement, labels: string[], data: number[], colors: string[]) {
  return new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } }, tooltip: { backgroundColor: 'rgba(17,19,24,.9)', padding: 10, cornerRadius: 8 } },
      cutout: '65%',
    },
  })
}

function createLine(canvas: HTMLCanvasElement, labels: string[], data: number[], color: string) {
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Criados', data, borderColor: color, backgroundColor: color + '20', fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: color, borderWidth: 2.5 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(17,19,24,.9)', padding: 10, cornerRadius: 8 } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: 'rgba(148,163,184,.1)' }, ticks: { font: { size: 11 }, stepSize: 1 } } },
    },
  })
}

function createBar(canvas: HTMLCanvasElement, labels: string[], data: number[], colors?: string[]) {
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Cards', data, backgroundColor: colors || ['rgba(99,102,241,.7)', 'rgba(139,92,246,.7)', 'rgba(56,189,248,.7)', 'rgba(34,197,94,.7)', 'rgba(245,158,11,.7)'], borderRadius: 8, barThickness: 36 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(17,19,24,.9)', padding: 10, cornerRadius: 8 } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: 'rgba(148,163,184,.1)' }, ticks: { font: { size: 11 }, stepSize: 1 } } },
    },
  })
}

function createStackedLine(canvas: HTMLCanvasElement, labels: string[], data1: number[], data2: number[], label1: string, label2: string, color1: string, color2: string) {
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: label1, data: data1, borderColor: color1, backgroundColor: color1 + '30', fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: color1, borderWidth: 2.5 },
        { label: label2, data: data2, borderColor: color2, backgroundColor: color2 + '30', fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: color2, borderWidth: 2.5 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } }, tooltip: { backgroundColor: 'rgba(17,19,24,.9)', padding: 10, cornerRadius: 8 } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: 'rgba(148,163,184,.1)' }, ticks: { font: { size: 11 }, stepSize: 1 } } },
    },
  })
}

function getHeatmapColor(value: number) {
  if (value === 0) return 'rgba(148,163,184,.08)'
  if (value < 5) return 'rgba(99,102,241,.25)'
  if (value < 15) return 'rgba(99,102,241,.5)'
  if (value < 30) return 'rgba(99,102,241,.75)'
  return '#6366f1'
}

const funnelData = computed(() => {
  const f = inviteFunnel.value
  if (!f.total) return []
  return [
    { label: 'Enviados', value: f.total, percent: 100, color: 'rgba(99,102,241,.7)' },
    { label: 'Aceitos', value: f.used, percent: Math.max(20, (f.used / f.total) * 100), color: 'rgba(34,197,94,.7)' },
    { label: 'Pendentes', value: f.pending, percent: Math.max(15, (f.pending / f.total) * 100), color: 'rgba(245,158,11,.7)' },
    { label: 'Expirados', value: f.expired, percent: Math.max(10, (f.expired / f.total) * 100), color: 'rgba(239,68,68,.7)' },
  ]
})

async function fetchData() {
  loading.value = true
  try {
    const [u, b, g, t, h, e, c, a, v, l, i, m] = await Promise.all([
      api.get('/admin/dashboard/users-stats'),
      api.get('/admin/dashboard/boards-stats'),
      api.get('/admin/dashboard/growth'),
      api.get('/admin/dashboard/top-boards'),
      api.get('/admin/dashboard/activity-heatmap'),
      api.get('/admin/dashboard/engagement'),
      api.get('/admin/dashboard/column-distribution'),
      api.get('/admin/dashboard/attachments-growth'),
      api.get('/admin/dashboard/visibility-trend'),
      api.get('/admin/dashboard/login-methods'),
      api.get('/admin/dashboard/invite-funnel'),
      api.get('/admin/dashboard/most-engaged-boards'),
    ])
    usersStats.value = u.data
    boardsStats.value = b.data
    growth.value = g.data
    topBoards.value = t.data
    heatmapData.value = h.data.heatmap
    engagement.value = e.data
    columnDistribution.value = c.data
    attachmentsGrowth.value = a.data
    visibilityTrend.value = v.data
    loginMethods.value = l.data
    inviteFunnel.value = i.data
    mostEngagedBoards.value = m.data
    attachmentsStats.value = { total: a.data.attachmentsByMonth.reduce((acc: number, x: any) => acc + x.count, 0) }
  } catch (e) {
    console.error('Erro ao carregar dashboard:', e)
  } finally {
    loading.value = false
  }
}

function renderCharts() {
  destroyCharts()
  if (usersChartRef.value) charts.push(createDoughnut(usersChartRef.value, ['Ativos', 'Inativos'], [usersStats.value.active, usersStats.value.inactive], ['#4ade80', '#f87171']))
  if (boardsChartRef.value) charts.push(createDoughnut(boardsChartRef.value, ['Públicos', 'Privados'], [boardsStats.value.public, boardsStats.value.private], ['#38bdf8', '#fbbf24']))
  if (usersGrowthRef.value) charts.push(createLine(usersGrowthRef.value, growth.value.usersByMonth.map(x => x.label), growth.value.usersByMonth.map(x => x.count), '#6366f1'))
  if (boardsGrowthRef.value) charts.push(createLine(boardsGrowthRef.value, growth.value.boardsByMonth.map(x => x.label), growth.value.boardsByMonth.map(x => x.count), '#8b5cf6'))
  if (topBoardsRef.value) charts.push(createBar(topBoardsRef.value, topBoards.value.map(x => x.name), topBoards.value.map(x => x.totalCards)))
  if (engagementRef.value) charts.push(createDoughnut(engagementRef.value, ['Ativos', 'Inativos'], [engagement.value.active, engagement.value.inactive], ['#4ade80', '#94a3b8']))
  if (columnDistRef.value) charts.push(createBar(columnDistRef.value, columnDistribution.value.map(x => x.name), columnDistribution.value.map(x => x.avgCards), ['rgba(139,92,246,.7)', 'rgba(99,102,241,.7)', 'rgba(56,189,248,.7)', 'rgba(34,197,94,.7)', 'rgba(245,158,11,.7)', 'rgba(236,72,153,.7)']))
  if (visibilityTrendRef.value) {
    charts.push(createStackedLine(
      visibilityTrendRef.value,
      visibilityTrend.value.publicByMonth.map(x => x.label),
      visibilityTrend.value.publicByMonth.map(x => x.count),
      visibilityTrend.value.privateByMonth.map(x => x.count),
      'Públicos', 'Privados', '#38bdf8', '#fbbf24'
    ))
  }
  if (attachmentsGrowthRef.value) charts.push(createLine(attachmentsGrowthRef.value, attachmentsGrowth.value.attachmentsByMonth.map(x => x.label), attachmentsGrowth.value.attachmentsByMonth.map(x => x.count), '#ec4899'))
  if (storageGrowthRef.value) charts.push(createLine(storageGrowthRef.value, attachmentsGrowth.value.storageByMonth.map(x => x.label), attachmentsGrowth.value.storageByMonth.map(x => x.size), '#f472b6'))
  if (loginMethodsRef.value) charts.push(createDoughnut(loginMethodsRef.value, ['Email', 'Google'], [loginMethods.value.email, loginMethods.value.google], ['#6366f1', '#f87171']))
  if (mostEngagedRef.value) {
    charts.push(createBar(
      mostEngagedRef.value,
      mostEngagedBoards.value.map(x => x.name),
      mostEngagedBoards.value.map(x => x.engagementScore),
      ['rgba(99,102,241,.7)', 'rgba(139,92,246,.7)', 'rgba(56,189,248,.7)', 'rgba(34,197,94,.7)', 'rgba(245,158,11,.7)']
    ))
  }
}

onMounted(async () => {
  await fetchData()
  await nextTick()
  renderCharts()
})

watch(activeTab, async () => {
  await nextTick()
  renderCharts()
})
</script>

<style scoped>
.dv-page {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dv-header { display: flex; flex-direction: column; gap: 0.2rem; }
.dv-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.dv-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0; }

/* Cards */
.dv-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.dv-card {
  display: flex; align-items: center; gap: 0.875rem;
  background: var(--sidebar-bg, #111318);
  border: 1px solid var(--table-border, #1e2128);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  transition: transform .15s, box-shadow .15s;
}
.dv-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
.dv-card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
}
.dv-card-info { display: flex; flex-direction: column; gap: 0.15rem; }
.dv-card-label { font-size: 0.72rem; color: var(--text-muted, #94a3b8); font-weight: 500; }
.dv-card-value { font-size: 1.4rem; font-weight: 700; color: var(--text, #e2e8f0); line-height: 1; }

/* Tabs */
.dv-tabs {
  display: flex; gap: 0.3rem;
  background: var(--sidebar-bg, #111318);
  border: 1px solid var(--table-border, #1e2128);
  border-radius: 10px;
  padding: 0.3rem;
  width: fit-content;
}
.dv-tab {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem; font-weight: 500;
  color: var(--text-muted, #94a3b8);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .15s;
}
.dv-tab:hover { color: var(--text, #e2e8f0); background: var(--hover-bg, #1a1d25); }
.dv-tab--active {
  background: var(--active-bg, rgba(99,102,241,.18));
  color: var(--active-color, #a5b4fc);
  border-color: var(--active-border, rgba(99,102,241,.35));
}

/* State */
.dv-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.spinner { display: inline-block; border-radius: 50%; animation: spin .65s linear infinite; border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1; width: 20px; height: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Tab content */
.dv-tab-content { display: flex; flex-direction: column; gap: 1.25rem; }

/* Rows */
.dv-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }

/* Chart card */
.dv-chart-card {
  background: var(--sidebar-bg, #111318);
  border: 1px solid var(--table-border, #1e2128);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.dv-chart-card--full { grid-column: 1 / -1; }
.dv-chart-title { font-size: 0.85rem; font-weight: 600; color: var(--text, #e2e8f0); margin: 0; }
.dv-chart-wrap { position: relative; height: 240px; width: 100%; }

/* Heatmap */
.dv-heatmap {
  display: flex; gap: 0.5rem;
  padding: 1rem 0;
  overflow-x: auto;
}
.dv-heatmap-labels-y {
  display: flex; flex-direction: column; gap: 0.3rem;
  padding-top: 1.5rem;
}
.dv-heatmap-labels-y span {
  font-size: 0.65rem; color: var(--text-muted, #94a3b8);
  height: 18px; display: flex; align-items: center;
  width: 32px;
}
.dv-heatmap-grid { display: flex; flex-direction: column; gap: 0.3rem; }
.dv-heatmap-labels-x {
  display: flex; gap: 0.2rem;
  padding-left: 0.2rem;
}
.dv-heatmap-labels-x span {
  font-size: 0.65rem; color: var(--text-muted, #94a3b8);
  width: 18px; text-align: center;
}
.dv-heatmap-rows { display: flex; flex-direction: column; gap: 0.2rem; }
.dv-heatmap-row { display: flex; gap: 0.2rem; }
.dv-heatmap-cell {
  width: 18px; height: 18px; border-radius: 3px;
  transition: transform .1s;
}
.dv-heatmap-cell:hover { transform: scale(1.3); z-index: 1; }

/* Funnel */
.dv-funnel {
  display: flex; flex-direction: column; gap: 0.6rem;
  padding: 1.5rem 1rem;
  align-items: center;
}
.dv-funnel-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem; font-weight: 500;
  min-width: 200px;
  transition: width .3s ease;
}
.dv-funnel-label { display: flex; align-items: center; gap: 0.4rem; }
.dv-funnel-value { font-weight: 700; }

@media (max-width: 768px) {
  .dv-row { grid-template-columns: 1fr; }
  .dv-chart-wrap { height: 200px; }
  .dv-cards { grid-template-columns: repeat(2, 1fr); }
  .dv-tabs { width: 100%; flex-wrap: wrap; }
}
</style>
