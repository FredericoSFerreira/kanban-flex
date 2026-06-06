<template>
  <div class="atv-page">
    <div class="atv-header">
      <div>
        <h1 class="atv-title"><PaperclipIcon :size="20" /> Anexos</h1>
        <p class="atv-subtitle">{{ filteredAttachments.length }} anexo(s) encontrado(s)</p>
      </div>
      <div class="atv-search">
        <SearchIcon :size="15" class="atv-search-icon" />
        <input v-model="search" type="text" placeholder="Buscar por nome do arquivo..." class="atv-search-input" />
      </div>
    </div>

    <div v-if="loading" class="atv-state">
      <div class="spinner"></div>
      <span>Carregando anexos...</span>
    </div>

    <div v-else-if="error" class="atv-error">
      <AlertCircleIcon :size="18" /> {{ error }}
    </div>

    <template v-else>
      <div class="atv-table-card">
        <table class="atv-table">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Usuário</th>
              <th>Board</th>
              <th>Tipo</th>
              <th>Tamanho</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedAttachments.length === 0">
              <td colspan="7" class="atv-empty">Nenhum anexo encontrado.</td>
            </tr>
            <tr v-for="att in pagedAttachments" :key="att.id" class="atv-row">
              <td>
                <div class="file-cell">
                  <FileTextIcon :size="16" class="td-muted" />
                  <span class="file-name">{{ att.name }}</span>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <img :src="att.userAvatar || defaultAvatar" class="user-av" />
                  <span>{{ att.userName }}</span>
                </div>
              </td>
              <td class="td-muted">{{ att.boardName }}</td>
              <td><span class="td-muted" style="font-size:.75rem">{{ att.type }}</span></td>
              <td><span class="stat-pill">{{ size(att.size) }}</span></td>
              <td class="td-muted">{{ fmt(att.createdAt) }}</td>
              <td>
                <div class="actions-cell">
                  <a :href="att.url" target="_blank" class="act-btn">
                    <DownloadIcon :size="12" /> Download
                  </a>
                  <button class="act-btn act-btn--warn" @click="confirmDelete(att)">
                    <Trash2Icon :size="12" /> Excluir
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
        <span class="pg-info">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredAttachments.length) }} de {{ filteredAttachments.length }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { PaperclipIcon, SearchIcon, AlertCircleIcon, FileTextIcon, DownloadIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import api from '@/utils/api'
import { useSwal } from '@/utils/swal'

const Swal = useSwal()
const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
const PER_PAGE = 10

const attachments = ref<any[]>([])
const search = ref('')
const loading = ref(false)
const error = ref('')
const page = ref(1)
const perPage = PER_PAGE

watch(search, () => { page.value = 1 })

const filteredAttachments = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return attachments.value
  return attachments.value.filter(a => a.name?.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAttachments.value.length / perPage)))
const pagedAttachments = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredAttachments.value.slice(start, start + perPage)
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

function size(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0; let s = bytes
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++ }
  return `${s.toFixed(1)} ${units[i]}`
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function fetchAttachments() {
  loading.value = true; error.value = ''
  try {
    const params: any = {}
    if (search.value.trim()) params.search = search.value.trim()
    attachments.value = (await api.get('/admin/attachments', { params })).data
  } catch { error.value = 'Erro ao carregar anexos.' }
  finally { loading.value = false }
}

async function confirmDelete(att: any) {
  const result = await Swal.fire({
    title: 'Excluir anexo?',
    text: `Tem certeza que deseja excluir "${att.name}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return
  try {
    await api.delete(`/admin/attachments/${att.id}`)
    await fetchAttachments()
    Swal.fire({ title: 'Excluído!', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch {
    Swal.fire({ title: 'Erro', text: 'Erro ao excluir anexo.', icon: 'error' })
  }
}

onMounted(fetchAttachments)
</script>

<style scoped>
.atv-page { font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.25rem; }
.atv-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.atv-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1.25rem; font-weight: 700; color: var(--text, #e2e8f0); margin: 0; }
.atv-subtitle { font-size: 0.78rem; color: var(--text-label, #4b5563); margin: 0.2rem 0 0; }
.atv-search { position: relative; flex: 0 0 260px; }
.atv-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-label, #4b5563); pointer-events: none; }
.atv-search-input { width: 100%; background: var(--input-bg, #161923); border: 1px solid var(--input-border, #2a2f3d); border-radius: 9px; padding: 0.5rem 0.75rem 0.5rem 2.1rem; font-size: 0.83rem; color: var(--text, #e2e8f0); outline: none; transition: border-color .18s; }
.atv-search-input::placeholder { color: var(--text-label, #4b5563); }
.atv-search-input:focus { border-color: rgba(99,102,241,.5); }
.atv-state { display: flex; align-items: center; gap: 0.65rem; color: var(--text-muted, #94a3b8); padding: 2rem 0; }
.atv-error { display: flex; align-items: center; gap: 0.45rem; color: #f87171; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.18); border-radius: 9px; padding: 0.85rem 1rem; }
.atv-table-card { background: var(--sidebar-bg, #111318); border: 1px solid var(--table-border, #1e2128); border-radius: 12px; overflow: auto; }
.atv-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }
.atv-table thead tr { background: var(--table-header-bg, #141720); border-bottom: 1px solid var(--table-border, #1e2128); }
.atv-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-label, #4b5563); white-space: nowrap; }
.atv-row { border-bottom: 1px solid var(--table-border, #1e2128); transition: background .12s; }
.atv-row:last-child { border-bottom: none; }
.atv-row:hover { background: var(--table-row-hover, #161923); }
.atv-table td { padding: 0.8rem 1rem; vertical-align: middle; color: var(--text, #e2e8f0); }
.atv-empty { text-align: center; color: var(--text-label, #4b5563); padding: 2.5rem !important; }
.file-cell { display: flex; align-items: center; gap: 0.45rem; }
.file-name { font-weight: 500; color: var(--text, #e2e8f0); }
.user-cell { display: flex; align-items: center; gap: 0.45rem; }
.user-av { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid var(--input-border, #2a2f3d); flex-shrink: 0; }
.td-muted { color: var(--text-muted, #94a3b8); font-size: 0.83rem; }
.stat-pill { display: inline-block; background: var(--pill-bg, rgba(255,255,255,.06)); border: 1px solid var(--pill-border, #2a2f3d); border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; font-weight: 600; color: var(--pill-color, #94a3b8); min-width: 26px; text-align: center; }
.actions-cell { display: flex; gap: 0.4rem; align-items: center; }
.act-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.28rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25); color: #a5b4fc; cursor: pointer; transition: all .15s; text-decoration: none; }
.act-btn:hover { background: rgba(99,102,241,.22); color: #fff; }
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
