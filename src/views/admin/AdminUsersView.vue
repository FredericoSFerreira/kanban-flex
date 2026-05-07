<template>
  <div class="av-page">
    <!-- Page header -->
    <div class="av-header">
      <div>
        <h1 class="av-title"><UsersIcon :size="20" /> Usuários</h1>
        <p class="av-subtitle">{{ filteredUsers.length }} usuário(s) encontrado(s)</p>
      </div>
      <div class="av-search">
        <SearchIcon :size="15" class="av-search-icon" />
        <input v-model="search" type="text" placeholder="Buscar por nome ou e-mail..." class="av-search-input" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="av-state">
      <div class="spinner"></div>
      <span>Carregando usuários...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="av-error">
      <AlertCircleIcon :size="18" /> {{ error }}
    </div>

    <!-- Table -->
    <template v-else>
      <div class="av-table-card">
        <table class="av-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Papel</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedUsers.length === 0">
              <td colspan="7" class="av-empty">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-for="user in pagedUsers" :key="user.id" class="av-row">
              <td>
                <div class="user-cell">
                  <img :src="user.avatar || genAvatar(user)" :alt="user.name" class="user-av" />
                  <span class="user-name">{{ user.name || '—' }}</span>
                </div>
              </td>
              <td class="td-muted">{{ user.email }}</td>
              <td class="td-muted">{{ user.phone || '—' }}</td>
              <td>
                <span :class="['chip', user.isAdmin ? 'chip--admin' : 'chip--user']">
                  {{ user.isAdmin ? 'Admin' : 'Usuário' }}
                </span>
              </td>
              <td>
                <span :class="['chip', user.active ? 'chip--on' : 'chip--off']">
                  {{ user.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="td-muted">{{ fmt(user.createdAt) }}</td>
              <td>
                <button
                  v-if="!user.isAdmin"
                  class="act-btn"
                  :class="user.active ? 'act-btn--warn' : 'act-btn--ok'"
                  :disabled="toggling === user.id"
                  @click="toggle(user)"
                >
                  <span v-if="toggling === user.id" class="spinner spinner--xs"></span>
                  <template v-else>{{ user.active ? 'Desativar' : 'Ativar' }}</template>
                </button>
                <span v-else class="td-muted" style="font-size:.72rem">Protegido</span>
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
        <span class="pg-info">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredUsers.length) }} de {{ filteredUsers.length }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { UsersIcon, SearchIcon, AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import api from '@/utils/api'

interface AdminUser {
  id: string; name: string; email: string; phone: string | null
  avatar: string | null; active: boolean; isAdmin: boolean; createdAt: string | null
}

const PER_PAGE = 10

const users    = ref<AdminUser[]>([])
const search   = ref('')
const loading  = ref(false)
const error    = ref('')
const toggling = ref<string | null>(null)
const page     = ref(1)
const perPage  = PER_PAGE

// Reset page when search changes
watch(search, () => { page.value = 1 })

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter(u =>
    u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage)))

const pagedUsers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredUsers.value.slice(start, start + perPage)
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

function genAvatar(u: AdminUser) {
  return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(u.name || 'U')}`
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchUsers() {
  loading.value = true; error.value = ''
  try { users.value = (await api.get('/admin/users')).data }
  catch { error.value = 'Erro ao carregar usuários.' }
  finally { loading.value = false }
}

async function toggle(user: AdminUser) {
  toggling.value = user.id
  try {
    await api.patch(`/admin/users/${user.id}/toggle`, { active: !user.active })
    user.active = !user.active
  } catch (e) { console.error(e) }
  finally { toggling.value = null }
}

fetchUsers()
</script>

<style scoped>
/* These vars are set by AdminLayout on the parent .admin-shell */
.av-page {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex; flex-direction: column; gap: 1.25rem;
}

/* ── Header ── */
.av-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.av-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.av-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0.2rem 0 0; }

.av-search { position: relative; flex: 0 0 260px; }
.av-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-label, #4b5563); pointer-events: none; }
.av-search-input {
  width: 100%; background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d);
  border-radius: 9px; padding: 0.5rem 0.75rem 0.5rem 2.1rem;
  font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; transition: border-color .18s;
}
.av-search-input::placeholder { color: var(--text-label, #4b5563); }
.av-search-input:focus { border-color: rgba(99,102,241,.5); }

/* ── States ── */
.av-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.av-error { display: flex; align-items: center; gap: 0.45rem; color: #f87171; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.18); border-radius: 9px; padding: 0.85rem 1rem; }

/* ── Table card ── */
.av-table-card {
  background: var(--sidebar-bg, #111318);
  border: 1px solid var(--table-border, #1e2128);
  border-radius: 12px; overflow: auto;
}

.av-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }

.av-table thead tr {
  background: var(--table-header-bg, #141720);
  border-bottom: 1px solid var(--table-border, #1e2128);
}

.av-table th {
  padding: 0.75rem 1rem; text-align: left;
  font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-label, #4b5563); white-space: nowrap;
}

.av-row { border-bottom: 1px solid var(--table-border, #1e2128); transition: background .12s; }
.av-row:last-child { border-bottom: none; }
.av-row:hover { background: var(--table-row-hover, #161923); }
.av-table td { padding: 0.8rem 1rem; vertical-align: middle; color: var(--text, #e2e8f0); }

.av-empty { text-align: center; color: var(--text-label, #4b5563); padding: 2.5rem !important; }

/* ── Cells ── */
.user-cell { display: flex; align-items: center; gap: 0.55rem; }
.user-av { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 2px solid var(--input-border, #2a2f3d); flex-shrink: 0; }
.user-name { font-weight: 500; white-space: nowrap; color: var(--text, #e2e8f0); }
.td-muted { color: var(--text-muted, #94a3b8); font-size: 0.83rem; }

/* ── Chips ── */
.chip { display: inline-flex; align-items: center; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.chip--admin { background: rgba(99,102,241,.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,.28); }
.chip--user  { background: var(--pill-bg, rgba(255,255,255,.06)); color: var(--text-muted, #94a3b8); border: 1px solid var(--pill-border, #2a2f3d); }
.chip--on    { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.22); }
.chip--off   { background: rgba(239,68,68,.1);  color: #f87171; border: 1px solid rgba(239,68,68,.18); }

/* ── Action buttons ── */
.act-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.28rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; border: 1px solid transparent; cursor: pointer; transition: all .15s; }
.act-btn:disabled { opacity: .45; cursor: not-allowed; }
.act-btn--warn  { background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.22); color: #fbbf24; }
.act-btn--warn:hover:not(:disabled) { background: rgba(245,158,11,.18); }
.act-btn--ok    { background: rgba(34,197,94,.1);  border-color: rgba(34,197,94,.22);  color: #4ade80; }
.act-btn--ok:hover:not(:disabled) { background: rgba(34,197,94,.18); }

/* ── Pagination ── */
.pagination { display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }

.pg-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px; padding: 0 0.5rem;
  border-radius: 7px; font-size: 0.8rem; font-weight: 500;
  border: 1px solid var(--input-border, #2a2f3d);
  background: var(--input-bg, #161923); color: var(--text-muted, #94a3b8);
  cursor: pointer; transition: all .15s;
}
.pg-btn:hover:not(:disabled):not(.pg-btn--active):not(.pg-btn--ellipsis) {
  background: var(--hover-bg, #1a1d25); color: var(--text, #e2e8f0);
}
.pg-btn--active {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  border-color: transparent; color: #fff; font-weight: 600;
}
.pg-btn--ellipsis { border-color: transparent; background: transparent; cursor: default; }
.pg-btn:disabled:not(.pg-btn--ellipsis) { opacity: .35; cursor: not-allowed; }
.pg-info { font-size: 0.75rem; color: var(--text-label, #4b5563); margin-left: 0.5rem; }

/* ── Spinner ── */
.spinner { display: inline-block; border-radius: 50%; animation: spin .65s linear infinite; border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1; }
.spinner { width: 20px; height: 20px; }
.spinner--xs { width: 12px; height: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
