<template>
  <div class="bv-page">
    <!-- Header -->
    <div class="bv-header">
      <div>
        <h1 class="bv-title"><LayoutDashboardIcon :size="20" /> Boards</h1>
        <p class="bv-subtitle">{{ filteredBoards.length }} board(s) encontrado(s)</p>
      </div>
      <div class="bv-search">
        <SearchIcon :size="15" class="bv-search-icon" />
        <input v-model="search" type="text" placeholder="Buscar por nome ou owner..." class="bv-search-input" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bv-state">
      <div class="spinner"></div>
      <span>Carregando boards...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bv-error">
      <AlertCircleIcon :size="18" /> {{ error }}
    </div>

    <!-- Table -->
    <template v-else>
      <div class="bv-table-card">
        <table class="bv-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Owner</th>
              <th>Visibilidade</th>
              <th>Colunas</th>
              <th>Cards</th>
              <th>Membros</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedBoards.length === 0">
              <td colspan="8" class="bv-empty">Nenhum board encontrado.</td>
            </tr>
            <tr v-for="board in pagedBoards" :key="board.id" class="bv-row">
              <td><span class="board-name">{{ board.name }}</span></td>
              <td class="td-muted">{{ board.owner_email || '—' }}</td>
              <td>
                <span :class="['chip', board.is_public ? 'chip--pub' : 'chip--priv']">
                  <GlobeIcon v-if="board.is_public" :size="9" />
                  <LockIcon v-else :size="9" />
                  {{ board.is_public ? 'Público' : 'Privado' }}
                </span>
              </td>
              <td class="td-center"><span class="stat-pill">{{ board.totalColumns }}</span></td>
              <td class="td-center"><span class="stat-pill">{{ board.totalCards }}</span></td>
              <td class="td-center"><span class="stat-pill">{{ board.members?.length || 0 }}</span></td>
              <td class="td-muted">{{ fmt(board.createdAt) }}</td>
              <td>
                <button class="act-btn" @click="open(board.id)">
                  <ExternalLinkIcon :size="12" /> Abrir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="pg-btn" :disabled="page === 1" @click="page--">
          <ChevronLeftIcon :size="15" />
        </button>
        <button
          v-for="p in pagesToShow"
          :key="p"
          class="pg-btn"
          :class="{ 'pg-btn--active': p === page, 'pg-btn--ellipsis': p === '…' }"
          :disabled="p === '…'"
          @click="typeof p === 'number' && (page = p)"
        >{{ p }}</button>
        <button class="pg-btn" :disabled="page === totalPages" @click="page++">
          <ChevronRightIcon :size="15" />
        </button>
        <span class="pg-info">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredBoards.length) }} de {{ filteredBoards.length }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutDashboardIcon, SearchIcon, AlertCircleIcon, LockIcon, GlobeIcon, ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import api from '@/utils/api'

interface AdminBoard {
  id: string; name: string; owner_email: string | null; owner_id: string | null
  is_public: boolean; totalColumns: number; totalCards: number; members: any[]; createdAt: string | null
}

const PER_PAGE = 10

const boards  = ref<AdminBoard[]>([])
const search  = ref('')
const loading = ref(false)
const error   = ref('')
const page    = ref(1)
const perPage = PER_PAGE
const router  = useRouter()

watch(search, () => { page.value = 1 })

const filteredBoards = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return boards.value
  return boards.value.filter(b =>
    b.name?.toLowerCase().includes(q) || b.owner_email?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBoards.value.length / perPage)))

const pagedBoards = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredBoards.value.slice(start, start + perPage)
})

const pagesToShow = computed(() => {
  const total = totalPages.value
  const cur   = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('…')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function open(id: string) { router.push(`/board/${id}`) }

async function fetchBoards() {
  loading.value = true; error.value = ''
  try { boards.value = (await api.get('/admin/boards')).data }
  catch { error.value = 'Erro ao carregar boards.' }
  finally { loading.value = false }
}

fetchBoards()
</script>

<style scoped>
.bv-page { font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Header ── */
.bv-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.bv-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.bv-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0.2rem 0 0; }

.bv-search { position: relative; flex: 0 0 260px; }
.bv-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-label, #4b5563); pointer-events: none; }
.bv-search-input {
  width: 100%; background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d);
  border-radius: 9px; padding: 0.5rem 0.75rem 0.5rem 2.1rem;
  font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; transition: border-color .18s;
}
.bv-search-input::placeholder { color: var(--text-label, #4b5563); }
.bv-search-input:focus { border-color: rgba(99,102,241,.5); }

/* ── States ── */
.bv-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.bv-error { display: flex; align-items: center; gap: 0.45rem; color: #f87171; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.18); border-radius: 9px; padding: 0.85rem 1rem; }

/* ── Table ── */
.bv-table-card { background: var(--sidebar-bg, #111318); border: 1px solid var(--table-border, #1e2128); border-radius: 12px; overflow: auto; }
.bv-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }
.bv-table thead tr { background: var(--table-header-bg, #141720); border-bottom: 1px solid var(--table-border, #1e2128); }
.bv-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-label, #4b5563); white-space: nowrap; }
.bv-row { border-bottom: 1px solid var(--table-border, #1e2128); transition: background .12s; }
.bv-row:last-child { border-bottom: none; }
.bv-row:hover { background: var(--table-row-hover, #161923); }
.bv-table td { padding: 0.8rem 1rem; vertical-align: middle; color: var(--text, #e2e8f0); }
.bv-empty { text-align: center; color: var(--text-label, #4b5563); padding: 2.5rem !important; }

/* ── Cells ── */
.board-name { font-weight: 600; color: var(--text, #e2e8f0); }
.td-muted { color: var(--text-muted, #94a3b8); font-size: 0.83rem; }
.td-center { text-align: center; }

.stat-pill { display: inline-block; background: var(--pill-bg, rgba(255,255,255,.06)); border: 1px solid var(--pill-border, #2a2f3d); border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; font-weight: 600; color: var(--pill-color, #94a3b8); min-width: 26px; text-align: center; }

/* ── Chips ── */
.chip { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.chip--pub  { background: rgba(34,197,94,.1);  color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
.chip--priv { background: rgba(245,158,11,.1); color: #fbbf24; border: 1px solid rgba(245,158,11,.2); }

/* ── Action ── */
.act-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.28rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25); color: #a5b4fc; cursor: pointer; transition: all .15s; }
.act-btn:hover { background: rgba(99,102,241,.22); color: #fff; }

/* ── Pagination ── */
.pagination { display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
.pg-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; padding: 0 0.5rem; border-radius: 7px; font-size: 0.8rem; font-weight: 500; border: 1px solid var(--input-border, #2a2f3d); background: var(--input-bg, #161923); color: var(--text-muted, #94a3b8); cursor: pointer; transition: all .15s; }
.pg-btn:hover:not(:disabled):not(.pg-btn--active):not(.pg-btn--ellipsis) { background: var(--hover-bg, #1a1d25); color: var(--text, #e2e8f0); }
.pg-btn--active { background: linear-gradient(135deg, #6366f1, #7c3aed); border-color: transparent; color: #fff; font-weight: 600; }
.pg-btn--ellipsis { border-color: transparent; background: transparent; cursor: default; }
.pg-btn:disabled:not(.pg-btn--ellipsis) { opacity: .35; cursor: not-allowed; }
.pg-info { font-size: 0.75rem; color: var(--text-label, #4b5563); margin-left: 0.5rem; }

/* ── Spinner ── */
.spinner { display: inline-block; border-radius: 50%; animation: spin .65s linear infinite; border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1; width: 20px; height: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
