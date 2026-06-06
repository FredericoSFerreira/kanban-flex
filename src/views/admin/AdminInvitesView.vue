<template>
  <div class="iv-page">
    <div class="iv-header">
      <div>
        <h1 class="iv-title"><MailIcon :size="20" /> Convites</h1>
        <p class="iv-subtitle">{{ filteredInvites.length }} convite(s) encontrado(s)</p>
      </div>
      <div class="iv-search">
        <SearchIcon :size="15" class="iv-search-icon" />
        <input v-model="search" type="text" placeholder="Buscar por email..." class="iv-search-input" />
      </div>
    </div>

    <div class="iv-filters">
      <select v-model="statusFilter" class="iv-select">
        <option value="">Todos os status</option>
        <option value="pending">Pendentes</option>
        <option value="used">Aceitos</option>
        <option value="expired">Expirados</option>
      </select>
    </div>

    <div v-if="loading" class="iv-state">
      <div class="spinner"></div>
      <span>Carregando convites...</span>
    </div>

    <div v-else-if="error" class="iv-error">
      <AlertCircleIcon :size="18" /> {{ error }}
    </div>

    <template v-else>
      <div class="iv-table-card">
        <table class="iv-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Board</th>
              <th>Convidado por</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Expira em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedInvites.length === 0">
              <td colspan="7" class="iv-empty">Nenhum convite encontrado.</td>
            </tr>
            <tr v-for="invite in pagedInvites" :key="invite.id" class="iv-row">
              <td><span class="td-muted">{{ invite.email }}</span></td>
              <td>
                <a v-if="invite.boardId" class="board-link" @click.prevent="goToBoard(invite.boardId)">
                  {{ invite.boardName || invite.boardId }}
                  <ExternalLinkIcon :size="12" />
                </a>
                <span v-else class="td-muted">—</span>
              </td>
              <td class="td-muted">{{ invite.invitedByName || '—' }}</td>
              <td>
                <span :class="['chip', statusClass(invite.status)]">{{ statusLabel(invite.status) }}</span>
              </td>
              <td class="td-muted">{{ fmt(invite.createdAt) }}</td>
              <td class="td-muted">{{ fmt(invite.expiresAt) }}</td>
              <td>
                <div class="actions-cell">
                  <button v-if="invite.status === 'pending'" class="act-btn" :disabled="resending === invite.id" @click="resendInvite(invite.id)">
                    <SendIcon :size="12" /> Reenviar
                  </button>
                  <button v-if="invite.status === 'pending'" class="act-btn act-btn--warn" @click="invalidateInvite(invite.id)">
                    <BanIcon :size="12" /> Invalidar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button class="pg-btn" :disabled="page === 1" @click="page--"><ChevronLeftIcon :size="15" /></button>
        <button v-for="p in pagesToShow" :key="p" class="pg-btn" :class="{ 'pg-btn--active': p === page, 'pg-btn--ellipsis': p === '…' }" :disabled="p === '…'" @click="typeof p === 'number' && (page = p)">{{ p }}</button>
        <button class="pg-btn" :disabled="page === totalPages" @click="page++"><ChevronRightIcon :size="15" /></button>
        <span class="pg-info">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredInvites.length) }} de {{ filteredInvites.length }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { MailIcon, SearchIcon, AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon, SendIcon, BanIcon, ExternalLinkIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { useSwal } from '@/utils/swal'

const Swal = useSwal()
const router = useRouter()

const PER_PAGE = 10

const invites = ref<any[]>([])
const search = ref('')
const statusFilter = ref('')
const loading = ref(false)
const error = ref('')
const page = ref(1)
const perPage = PER_PAGE
const resending = ref<string | null>(null)

watch(search, () => { page.value = 1 })
watch(statusFilter, () => { page.value = 1; fetchInvites() })

const filteredInvites = computed(() => {
  let list = invites.value
  const q = search.value.toLowerCase().trim()
  if (q) list = list.filter(i => i.email?.toLowerCase().includes(q))
  if (statusFilter.value) list = list.filter(i => i.status === statusFilter.value)
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredInvites.value.length / perPage)))
const pagedInvites = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredInvites.value.slice(start, start + perPage)
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

function statusClass(s: string) {
  if (s === 'pending') return 'chip--warn'
  if (s === 'used') return 'chip--on'
  return 'chip--off'
}

function statusLabel(s: string) {
  if (s === 'pending') return 'Pendente'
  if (s === 'used') return 'Aceito'
  return 'Expirado'
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchInvites() {
  loading.value = true; error.value = ''
  try {
    const params: any = {}
    if (search.value.trim()) params.search = search.value.trim()
    if (statusFilter.value) params.status = statusFilter.value
    invites.value = (await api.get('/admin/invites', { params })).data
  } catch { error.value = 'Erro ao carregar convites.' }
  finally { loading.value = false }
}

function goToBoard(id: string) {
  router.push(`/board/${id}`)
}

async function invalidateInvite(id: string) {
  const result = await Swal.fire({
    title: 'Invalidar convite?',
    text: 'Este convite não poderá mais ser usado.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, invalidar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return
  try { await api.patch(`/admin/invites/${id}/invalidate`); await fetchInvites() }
  catch (e) { console.error(e) }
}

async function resendInvite(id: string) {
  resending.value = id
  try { await api.post(`/admin/invites/${id}/resend`) }
  catch (e) { console.error(e) }
  finally { resending.value = null }
}

onMounted(fetchInvites)
</script>

<style scoped>
.iv-page { font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.25rem; }
.iv-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.iv-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.iv-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0.2rem 0 0; }
.iv-search { position: relative; flex: 0 0 260px; }
.iv-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-label, #4b5563); pointer-events: none; }
.iv-search-input { width: 100%; background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d); border-radius: 9px; padding: 0.5rem 0.75rem 0.5rem 2.1rem; font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; transition: border-color .18s; }
.iv-search-input::placeholder { color: var(--text-label, #4b5563); }
.iv-search-input:focus { border-color: rgba(99,102,241,.5); }
.iv-filters { display: flex; gap: 0.5rem; }
.iv-select { background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d); border-radius: 9px; padding: 0.5rem 0.75rem; font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; }
.iv-select:focus { border-color: rgba(99,102,241,.5); }
.iv-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.iv-error { display: flex; align-items: center; gap: 0.45rem; color: #f87171; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.18); border-radius: 9px; padding: 0.85rem 1rem; }
.iv-table-card { background: var(--sidebar-bg, #111318); border: 1px solid var(--table-border, #1e2128); border-radius: 12px; overflow: auto; }
.iv-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }
.iv-table thead tr { background: var(--table-header-bg, #141720); border-bottom: 1px solid var(--table-border, #1e2128); }
.iv-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-label, #4b5563); white-space: nowrap; }
.iv-row { border-bottom: 1px solid var(--table-border, #1e2128); transition: background .12s; }
.iv-row:last-child { border-bottom: none; }
.iv-row:hover { background: var(--table-row-hover, #161923); }
.iv-table td { padding: 0.8rem 1rem; vertical-align: middle; color: var(--text, #e2e8f0); }
.iv-empty { text-align: center; color: var(--text-label, #4b5563); padding: 2.5rem !important; }
.td-muted { color: var(--text-muted, #94a3b8); font-size: 0.83rem; }
.chip { display: inline-flex; align-items: center; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.chip--on  { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.22); }
.chip--off { background: rgba(239,68,68,.1);  color: #f87171; border: 1px solid rgba(239,68,68,.18); }
.chip--warn { background: rgba(245,158,11,.1); color: #fbbf24; border: 1px solid rgba(245,158,11,.22); }
.board-link { display: inline-flex; align-items: center; gap: 0.3rem; color: #a5b4fc; cursor: pointer; font-weight: 500; transition: color .15s; text-decoration: none; }
.board-link:hover { color: #c7d2fe; text-decoration: underline; }
.actions-cell { display: flex; gap: 0.4rem; align-items: center; }
.act-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.28rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25); color: #a5b4fc; cursor: pointer; transition: all .15s; }
.act-btn:hover { background: rgba(99,102,241,.22); color: #fff; }
.act-btn:disabled { opacity: .45; cursor: not-allowed; }
.act-btn--warn { background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.22); color: #fbbf24; }
.act-btn--warn:hover:not(:disabled) { background: rgba(245,158,11,.18); }
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
