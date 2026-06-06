<template>
  <div class="alv-page">
    <div class="alv-header">
      <div>
        <h1 class="alv-title"><FileTextIcon :size="20" /> Logs de Acesso</h1>
        <p class="alv-subtitle">{{ logs.length }} log(s) encontrado(s)</p>
      </div>
      <div class="alv-search">
        <SearchIcon :size="15" class="alv-search-icon" />
        <input v-model="search" type="text" placeholder="Buscar por nome, email ou IP..." class="alv-search-input" />
      </div>
    </div>

    <div v-if="loading" class="alv-state">
      <div class="spinner"></div>
      <span>Carregando logs...</span>
    </div>

    <div v-else-if="error" class="alv-error">
      <AlertCircleIcon :size="18" /> {{ error }}
    </div>

    <template v-else>
      <div class="alv-table-card">
        <table class="alv-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>IP</th>
              <th>Navegador</th>
              <th>Dispositivo</th>
              <th>Ação</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="7" class="alv-empty">Nenhum log encontrado.</td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="alv-row">
              <td>
                <div class="user-cell">
                  <img :src="log.userAvatar || defaultAvatar" class="user-av" />
                  <span>{{ log.userName }}</span>
                </div>
              </td>
              <td class="td-muted">{{ log.userEmail }}</td>
              <td><code class="ip-cell">{{ log.ip }}</code></td>
              <td class="td-muted">{{ log.browser || '—' }}</td>
              <td class="td-muted">{{ deviceLabel(log.device) }}</td>
              <td>
                <span :class="['chip', log.action === 'register' ? 'chip--info' : 'chip--primary']">{{ log.action }}</span>
              </td>
              <td class="td-muted">{{ fmt(log.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button class="pg-btn" :disabled="page === 1" @click="changePage(page - 1)"><ChevronLeftIcon :size="15" /></button>
        <button v-for="p in pagesToShow" :key="p" class="pg-btn" :class="{ 'pg-btn--active': p === page, 'pg-btn--ellipsis': p === '…' }" :disabled="p === '…'" @click="typeof p === 'number' && changePage(p)">{{ p }}</button>
        <button class="pg-btn" :disabled="page === totalPages" @click="changePage(page + 1)"><ChevronRightIcon :size="15" /></button>
        <span class="pg-info">Página {{ page }} de {{ totalPages }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { FileTextIcon, SearchIcon, AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import api from '@/utils/api'

const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

const logs = ref<any[]>([])
const search = ref('')
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const totalLogs = ref(0)

let searchTimer: number | null = null

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchLogs() }, 500) as unknown as number
})

const pagesToShow = computed(() => {
  const total = totalPages.value; const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('…')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

function deviceLabel(device: any) {
  if (!device) return '—'
  return [device.vendor, device.model].filter(Boolean).join(' ') || '—'
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR')
}

function changePage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p; fetchLogs()
}

async function fetchLogs() {
  loading.value = true; error.value = ''
  try {
    const params: any = { page: page.value, limit: 50 }
    if (search.value.trim()) params.search = search.value.trim()
    const res = await api.get('/admin/access-logs', { params })
    logs.value = res.data.logs
    totalPages.value = res.data.totalPages || 1
    totalLogs.value = res.data.total || 0
  } catch { error.value = 'Erro ao carregar logs.' }
  finally { loading.value = false }
}

onMounted(fetchLogs)
</script>

<style scoped>
.alv-page { font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.25rem; }
.alv-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.alv-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.alv-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0.2rem 0 0; }
.alv-search { position: relative; flex: 0 0 260px; }
.alv-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-label, #4b5563); pointer-events: none; }
.alv-search-input { width: 100%; background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d); border-radius: 9px; padding: 0.5rem 0.75rem 0.5rem 2.1rem; font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; transition: border-color .18s; }
.alv-search-input::placeholder { color: var(--text-label, #4b5563); }
.alv-search-input:focus { border-color: rgba(99,102,241,.5); }
.alv-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.alv-error { display: flex; align-items: center; gap: 0.45rem; color: #f87171; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.18); border-radius: 9px; padding: 0.85rem 1rem; }
.alv-table-card { background: var(--sidebar-bg, #111318); border: 1px solid var(--table-border, #1e2128); border-radius: 12px; overflow: auto; }
.alv-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }
.alv-table thead tr { background: var(--table-header-bg, #141720); border-bottom: 1px solid var(--table-border, #1e2128); }
.alv-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-label, #4b5563); white-space: nowrap; }
.alv-row { border-bottom: 1px solid var(--table-border, #1e2128); transition: background .12s; }
.alv-row:last-child { border-bottom: none; }
.alv-row:hover { background: var(--table-row-hover, #161923); }
.alv-table td { padding: 0.8rem 1rem; vertical-align: middle; color: var(--text, #e2e8f0); }
.alv-empty { text-align: center; color: var(--text-label, #4b5563); padding: 2.5rem !important; }
.user-cell { display: flex; align-items: center; gap: 0.55rem; }
.user-av { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 2px solid var(--input-border, #2a2f3d); flex-shrink: 0; }
.td-muted { color: var(--text-muted, #94a3b8); font-size: 0.83rem; }
.ip-cell { font-size: 0.78rem; color: var(--text-muted, #94a3b8); background: var(--pill-bg, rgba(255,255,255,.06)); padding: 0.1rem 0.4rem; border-radius: 4px; }
.chip { display: inline-flex; align-items: center; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.chip--primary { background: rgba(99,102,241,.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,.28); }
.chip--info { background: rgba(6,182,212,.12); color: #67e8f9; border: 1px solid rgba(6,182,212,.22); }
.pagination { display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
.pg-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; padding: 0 0.5rem; border-radius: 7px; font-size: 0.8rem; font-weight: 500; border: 1px solid var(--input-border, #2a2f3d); background: var(--input-bg, #161923); color: var(--text-muted, #94a3b8); cursor: pointer; transition: all .15s; }
.pg-btn:hover:not(:disabled):not(.pg-btn--active):not(.pg-btn--ellipsis) { background: var(--hover-bg, #1a1d25); color: var(--text, #e2e8f0); }
.pg-btn--active { background: linear-gradient(135deg, #6366f1, #7c3aed); border-color: transparent; color: #fff; font-weight: 600; }
.pg-btn--ellipsis { border-color: transparent; background: transparent; cursor: default; }
.pg-btn:disabled:not(.pg-btn--ellipsis) { opacity: .35; cursor: not-allowed; }
.pg-info { font-size: 0.75rem; color: var(--text-label, #4b5563); margin-left: 0.5rem; }
.spinner { display: inline-block; border-radius: 50%; animation: spin .65s linear infinite; border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1; width: 20px; height: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
