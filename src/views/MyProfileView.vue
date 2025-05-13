<template>
  <div class="container py-5">
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="row align-items-center">
          <div class="col-auto">
            <div class="position-relative">
              <img
                :src="user?.avatar ? user?.avatar : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.name}`"
                alt="Profile"
                class="rounded-circle"
                width="100"
                height="100"
                referrerpolicy="no-referrer"
              />
            </div>
          </div>
          <div class="col">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h1 class="h3 mb-1">{{ user.name }}</h1>
                <p class="text-muted mb-0">{{ user.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-transparent border-0 pb-0">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item" v-for="tab in tabs" :key="tab.id">
            <button
              class="nav-link"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <component :is="tab.icon" size="18" class="me-2"/>
              {{ tab.name }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-4">
        <div v-if="activeTab === 'logs'" class="logs-tab">
          <div class="text-center mt-3" v-if="showSpinner">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>


          <div class="timeline">
            <div v-for="(log, index) in accessLogs" :key="index" class="timeline-item">
              <div class="timeline-icon bg-info">
                <KeyRound size="16"/>
              </div>
              <div class="timeline-content">
                <p class="mb-1">{{ $t(`myProfile.${log.action}`) }}</p>
                <p class="mb-1">{{ log.ip }}</p>
                <p class="">{{ log.browser }}</p>
                <small class="text-muted">{{ new Date(log.createdAt).toLocaleString() }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {
  Layout,
  KeyRound,
} from 'lucide-vue-next';
import {useAuthStore} from '@/stores/auth'
import api from "@/utils/api";
import {useI18n} from "vue-i18n";


const {locale, t} = useI18n();
const user = useAuthStore().user
let accessLogs = ref(null)
const showSpinner = ref(false)

onMounted(() => {
  showSpinner.value = true;
  api.get('/access-logs').then(res => {
    accessLogs.value = res.data
    showSpinner.value = false;
  })
})


const tabs = [
  {id: 'logs', name: t('myProfile.accessLogs'), icon: Layout},
];

const activeTab = ref('logs');

</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 3rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 1.5rem;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-icon {
  position: absolute;
  left: -2rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.timeline-content {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}

/* Dark mode compatibility */
:deep(.dark-mode) {
  .timeline-content {
    background-color: #2d2d2d;
  }

  .timeline-item:not(:last-child)::before {
    background-color: #404040;
  }

  .card {
    background-color: #1e1e1e;
    border-color: #2d2d2d;
  }

  .nav-tabs .nav-link {
    color: #ffffff;
  }

  .nav-tabs .nav-link:hover {
    border-color: #404040;
  }

  .nav-tabs .nav-link.active {
    background-color: #1e1e1e;
    border-color: #404040 #404040 #1e1e1e;
    color: var(--bs-primary);
  }

  .table {
    color: #ffffff;
  }

  .table td, .table th {
    border-color: #404040;
  }

  .form-control,
  .form-select {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .form-control:focus,
  .form-select:focus {
    background-color: #363636;
    border-color: #4a4a4a;
    color: #ffffff;
  }

  .text-muted {
    color: #a0a0a0 !important;
  }
}
</style>
