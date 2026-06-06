<template>
  <div class="adv-page">
    <div class="adv-header">
      <div>
        <h1 class="adv-title"><ActivityIcon :size="20" /> Histórico de Atividade</h1>
        <p class="adv-subtitle">{{ logs.length }} registro(s) encontrado(s)</p>
      </div>
      <div class="adv-search">
        <SearchIcon :size="15" class="adv-search-icon" />
        <input v-model="search" type="text" placeholder="Buscar por ação, board ou usuário..." class="adv-search-input" />
      </div>
    </div>

    <div v-if="loading" class="adv-state">
      <div class="spinner"></div>
      <span>Carregando histórico...</span>
    </div>

    <div v-else-if="error" class="adv-error">
      <AlertCircleIcon :size="18" /> {{ error }}
    </div>

    <template v-else>
      <div class="adv-timeline">
        <div v-for="log in pagedLogs" :key="log.id" class="adv-item">
          <div class="adv-dot"></div>
          <div class="adv-card">
            <div class="adv-card-top">
              <div class="user-cell">
                <img :src="log.userAvatar || defaultAvatar" class="user-av" />
                <span class="adv-user">{{ log.userName }}</span>
              </div>
              <span :class="['chip', chipClass(log.action)]">{{ actionLabel(log.action) }}</span>
            </div>
            <p class="adv-desc">{{ log.details || log.description || '' }}</p>
            <div class="adv-meta">
              <span v-if="log.boardName" class="adv-board"><ColumnsIcon :size="12" /> {{ log.boardName }}</span>
              <span class="adv-time"><ClockIcon :size="12" /> {{ fmt(log.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="pagedLogs.length === 0 && !loading" class="adv-empty">
          Nenhum registro de atividade encontrado.
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button class="pg-btn" :disabled="page === 1" @click="page--"><ChevronLeftIcon :size="15" /></button>
        <button v-for="p in pagesToShow" :key="p" class="pg-btn" :class="{ 'pg-btn--active': p === page, 'pg-btn--ellipsis': p === '…' }" :disabled="p === '…'" @click="typeof p === 'number' && (page = p)">{{ p }}</button>
        <button class="pg-btn" :disabled="page === totalPages" @click="page++"><ChevronRightIcon :size="15" /></button>
        <span class="pg-info">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredLogs.length) }} de {{ filteredLogs.length }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ActivityIcon, SearchIcon, AlertCircleIcon, ColumnsIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import api from '@/utils/api'

const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
const PER_PAGE = 15

const logs = ref<any[]>([])
const search = ref('')
const loading = ref(false)
const error = ref('')
const page = ref(1)
const perPage = PER_PAGE

watch(search, () => { page.value = 1 })

const filteredLogs = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return logs.value
  return logs.value.filter(l =>
    l.action?.toLowerCase().includes(q) ||
    l.details?.toLowerCase().includes(q) ||
    l.boardName?.toLowerCase().includes(q) ||
    l.userName?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / perPage)))
const pagedLogs = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredLogs.value.slice(start, start + perPage)
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

function actionLabel(action: string) {
  const map: Record<string, string> = {
    move_card: 'Moveu cartão',
    create_card: 'Criou cartão',
    archive_card: 'Arquivou cartão',
    unarchive_card: 'Restaurou cartão',
    create_board: 'Criou board',
    invite_member: 'Convidou membro',
    remove_member: 'Removeu membro',
  }
  return map[action] || action
}

function chipClass(action: string) {
  if (!action) return 'chip--info'
  const a = action.toLowerCase()
  if (a.includes('criou') || a.includes('create') || a.includes('adicionou')) return 'chip--primary'
  if (a.includes('excluiu') || a.includes('delete') || a.includes('removeu')) return 'chip--danger'
  if (a.includes('editou') || a.includes('update') || a.includes('alterou') || a.includes('moveu')) return 'chip--warn'
  return 'chip--info'
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR')
}

async function fetchLogs() {
  loading.value = true; error.value = ''
  try {
    const params: any = {}
    if (search.value.trim()) params.search = search.value.trim()
    const res = (await api.get('/admin/activity-log', { params })).data
    logs.value = res.logs || []
  } catch { error.value = 'Erro ao carregar histórico.' }
  finally { loading.value = false }
}

onMounted(fetchLogs)
</script>

<style scoped>
.adv-page { font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.25rem; }
.adv-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.adv-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.adv-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0.2rem 0 0; }
.adv-search { position: relative; flex: 0 0 260px; }
.adv-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-label, #4b5563); pointer-events: none; }
.adv-search-input { width: 100%; background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d); border-radius: 9px; padding: 0.5rem 0.75rem 0.5rem 2.1rem; font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; transition: border-color .18s; }
.adv-search-input::placeholder { color: var(--text-label, #4b5563); }
.adv-search-input:focus { border-color: rgba(99,102,241,.5); }
.adv-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.adv-error { display: flex; align-items: center; gap: 0.45rem; color: #f87171; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.18); border-radius: 9px; padding: 0.85rem 1rem; }
.adv-timeline { display: flex; flex-direction: column; gap: 0.6rem; }
.adv-item { display: flex; gap: 0.65rem; align-items: flex-start; }
.adv-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #7c3aed); margin-top: 0.95rem; flex-shrink: 0; }
.adv-card { flex: 1; background: var(--sidebar-bg, #111318); border: 1px solid var(--table-border, #1e2128); border-radius: 10px; padding: 1rem 1.15rem; transition: border-color .15s; }
.adv-card:hover { border-color: #2a2f3d; }
.adv-card-top { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.55rem; }
.user-cell { display: flex; align-items: center; gap: 0.5rem; }
.user-av { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid var(--input-border, #2a2f3d); flex-shrink: 0; }
.adv-user { font-size: 0.81rem; font-weight: 600; color: var(--text, #e2e8f0); }
.adv-desc { font-size: 0.83rem; color: var(--text-muted, #94a3b8); margin: 0 0 0.55rem; line-height: 1.45; }
.adv-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.adv-board { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: #6366f1; background: rgba(99,102,241,.1); padding: 0.15rem 0.55rem; border-radius: 999px; }
.adv-time { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--text-label, #4b5563); }
.chip { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.67rem; font-weight: 600; white-space: nowrap; }
.chip--primary { background: rgba(99,102,241,.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,.28); }
.chip--info { background: rgba(6,182,212,.12); color: #67e8f9; border: 1px solid rgba(6,182,212,.22); }
.chip--warn { background: rgba(245,158,11,.12); color: #fbbf24; border: 1px solid rgba(245,158,11,.22); }
.chip--danger { background: rgba(239,68,68,.12); color: #fca5a5; border: 1px solid rgba(239,68,68,.22); }
.adv-empty { text-align: center; color: var(--text-label, #4b5563); padding: 2.5rem 0; }
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
