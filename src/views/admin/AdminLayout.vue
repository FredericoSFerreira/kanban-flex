<template>
  <div class="admin-shell" :class="isDark ? 'theme-dark' : 'theme-light'">
    <aside class="sidebar">
      <div class="sidebar-top">
        <!-- Brand -->
        <div class="brand">
          <img src="@/assets/logo-kanbanflex.png" alt="KanbanFlex" class="brand-logo" />
          <span class="brand-badge">Admin</span>
        </div>

        <!-- Nav -->
        <nav class="nav">
          <RouterLink to="/admin/dashboard" class="nav-link" active-class="nav-link--active">
            <BarChart3Icon :size="17" />
            <span>Dashboard</span>
          </RouterLink>
          <RouterLink to="/admin/users" class="nav-link" active-class="nav-link--active">
            <UsersIcon :size="17" />
            <span>Usuários</span>
          </RouterLink>
          <RouterLink to="/admin/boards" class="nav-link" active-class="nav-link--active">
            <LayoutDashboardIcon :size="17" />
            <span>Boards</span>
          </RouterLink>
        </nav>
      </div>

      <div class="sidebar-bottom">
        <!-- Actions -->
        <div class="sidebar-actions">
          <button class="s-btn s-btn--secondary" @click="goToApp">
            <ArrowLeftIcon :size="14" />
            Voltar ao App
          </button>
        </div>
      </div>

    </aside>

    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { UsersIcon, LayoutDashboardIcon, ArrowLeftIcon, BarChart3Icon } from 'lucide-vue-next'

const router = useRouter()

const isDark = ref(localStorage.getItem('theme') === 'dark')

onMounted(() => {
  window.addEventListener('theme-changed', (e: any) => {
    isDark.value = e.detail
  })
})

function goToApp() { router.push('/my-boards') }
</script>

<style scoped>
/* ══ Dark theme tokens ══════════════════════════════════ */
.theme-dark {
  --shell-bg:         #0d0f14;
  --sidebar-bg:       #111318;
  --sidebar-border:   #1e2128;
  --main-bg:          #0d0f14;
  --text:             #e2e8f0;
  --text-muted:       #94a3b8;
  --text-label:       #4b5563;
  --hover-bg:         #1a1d25;
  --active-bg:        rgba(99,102,241,.18);
  --active-color:     #a5b4fc;
  --active-border:    rgba(99,102,241,.35);
  --user-bg:          #161923;
  --user-border:      #1e2128;
  --input-bg:         #161923;
  --input-border:     #2a2f3d;
  --table-header-bg:  #141720;
  --table-row-hover:  #161923;
  --table-border:     #1e2128;
  --pill-bg:          rgba(255,255,255,.06);
  --pill-border:      #2a2f3d;
  --pill-color:       #94a3b8;
}

/* ══ Light theme tokens ═════════════════════════════════ */
.theme-light {
  --shell-bg:         #f8fafc;
  --sidebar-bg:       #ffffff;
  --sidebar-border:   #e2e8f0;
  --main-bg:          #f1f5f9;
  --text:             #1e293b;
  --text-muted:       #64748b;
  --text-label:       #94a3b8;
  --hover-bg:         #f1f5f9;
  --active-bg:        rgba(99,102,241,.1);
  --active-color:     #4f46e5;
  --active-border:    rgba(99,102,241,.25);
  --user-bg:          #f8fafc;
  --user-border:      #e2e8f0;
  --input-bg:         #ffffff;
  --input-border:     #e2e8f0;
  --table-header-bg:  #f8fafc;
  --table-row-hover:  #f1f5f9;
  --table-border:     #e2e8f0;
  --pill-bg:          #f1f5f9;
  --pill-border:      #e2e8f0;
  --pill-color:       #64748b;
}

/* ══ Layout ═════════════════════════════════════════════ */
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--shell-bg);
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text);
  transition: background .2s, color .2s;
}

/* ══ Sidebar ════════════════════════════════════════════ */
.sidebar {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  padding: 1.25rem 0.875rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: background .2s, border-color .2s;
}

.sidebar-top { display: flex; flex-direction: column; gap: 1.75rem; }

/* Brand */
.brand { display: flex; align-items: center; gap: 0.5rem; padding: 0 0.25rem; }
.brand-logo { height: 28px; object-fit: contain; }
.brand-badge {
  font-size: 0.6rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; padding: 0.18rem 0.45rem; border-radius: 999px;
}

/* Nav */
.nav { display: flex; flex-direction: column; gap: 0.2rem; }
.nav-link {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.6rem 0.75rem; border-radius: 9px;
  font-size: 0.845rem; font-weight: 500;
  color: var(--text-muted); text-decoration: none;
  transition: all .15s; border: 1px solid transparent;
}
.nav-link:hover { background: var(--hover-bg); color: var(--text); }
.nav-link--active {
  background: var(--active-bg);
  color: var(--active-color);
  border-color: var(--active-border);
}

/* ══ Sidebar bottom ═════════════════════════════════════ */
.sidebar-bottom { display: flex; flex-direction: column; gap: 0.875rem; }

.sidebar-user {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  background: var(--user-bg); border: 1px solid var(--user-border); border-radius: 10px;
}
.sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.sidebar-user-info { display: flex; flex-direction: column; min-width: 0; }
.sidebar-user-name { font-size: 0.78rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-role { font-size: 0.67rem; color: #a5b4fc; font-weight: 500; }

.sidebar-actions { display: flex; flex-direction: column; gap: 0.3rem; }

.s-btn {
  display: flex; align-items: center; gap: 0.45rem;
  justify-content: center; padding: 0.5rem;
  border-radius: 8px; font-size: 0.775rem; font-weight: 500;
  border: 1px solid transparent; cursor: pointer; transition: all .15s;
  width: 100%;
}
.s-btn--ghost {
  background: transparent;
  border-color: var(--input-border);
  color: var(--text-muted);
}
.s-btn--ghost:hover { background: var(--hover-bg); color: var(--text); }

.s-btn--secondary {
  background: var(--hover-bg);
  border-color: var(--input-border);
  color: var(--text-muted);
}
.s-btn--secondary:hover { color: var(--text); }


/* ══ Main ═══════════════════════════════════════════════ */
.admin-main {
  flex: 1; overflow-y: auto;
  padding: 1.75rem 2rem;
  min-width: 0;
  background: var(--main-bg);
  transition: background .2s;
}

/* ══ Responsive ═════════════════════════════════════════ */
@media (max-width: 768px) {
  .admin-shell { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; gap: 1rem; padding: 1rem; }
  .sidebar-top { flex-direction: row; align-items: center; gap: 1rem; }
  .sidebar-bottom { flex-direction: row; align-items: center; }
  .sidebar-actions { flex-direction: row; }
  .admin-main { padding: 1rem; }
}
</style>
