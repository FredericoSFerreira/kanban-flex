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
              <component :is="tab.icon" :size="18" class="me-2"/>
              {{ $t(tab.name) }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-4">
        <div v-if="activeTab === 'profile'" class="settings-tab">
          <form @submit.prevent="saveProfile">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" v-model="profile.name" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" v-model="profile.email" disabled>
                </div>
                <div class="mb-3">
                  <label class="form-label">Phone</label>

                  <div class="form-floating">
                    <vue-tel-input
                      v-model="profile.phone"
                      :inputOptions="{placeholder: $t('auth.phone')}"
                      mode="auto"
                      :valid-characters-only="true"
                      :enable-area-codes="true"
                      :default-country="defaultCountry"
                      :preferred-countries="['BR', 'US']"
                      :input-classes="['form-control', 'form-control-lg']"
                      @validate="validatePhone"
                      @on-input="inputPhone"
                    ></vue-tel-input>

                    <div v-if="!isPhoneValid && profile.phone" class="text-danger small mt-1">
                      {{ $t('auth.invalidPhone') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-check mt-4 mb-3">
              <input class="form-check-input" type="checkbox" required id="lgpdConsent">
              <label class="form-check-label" for="lgpdConsent">
                {{ $t('myProfile.accept') }}
                <a href="/privacy-policy" target="_blank">{{ $t('cookies.privacyPolicy') }}</a>.
              </label>
            </div>
            <div class="mt-4 pt-3 border-top">
              <button type="submit" class="btn btn-primary" :disabled="!isValidForm">Save Changes</button>
              <button type="button" class="btn btn-outline-danger ms-2" @click="confirmDeleteAccount">Delete Account</button>
            </div>

            <!-- Delete Account Confirmation Modal -->
            <div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="deleteAccountModalLabel">{{ $t('myProfile.confirmDelete') }}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <p>{{ $t('myProfile.deleteWarning') }}</p>
                      <p class="text-danger fw-bold">{{ $t('myProfile.deleteIrreversible') }}</p>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('myProfile.cancel') }}</button>
                      <button type="button" class="btn btn-danger" @click="deleteAccount">{{ $t('myProfile.confirmDeleteBtn') }}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div v-if="activeTab === 'logs'" class="logs-tab">
          <div class="text-center mt-3" v-if="showSpinner">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div class="table-responsive security-logs-table">
            <table class="table">
              <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Browser</th>
                <th>Device</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="log in accessLogs" :key="log.objectId">
                <td>
                  <div>{{ formatDate(log.createdAt) }}</div>
                  <small class="text-muted">{{ formatTime(log.createdAt) }}</small>
                </td>
                <td>
                    <span class="badge" :class="getActionBadgeClass(log.action)">
                      {{ $t(`myProfile.${log.action}`) }}
                    </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <Globe size="16" class="me-2 text-muted"/>
                    {{ log.browser }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <Monitor :size="16" class="me-2 text-muted"/>
                    {{ log.device.os || 'Unknown' }}
                    <span v-if="log.device.model" class="ms-1">({{ log.device.model }})</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <MapPin :size="16" class="me-2 text-muted"/>
                    {{ log.ip == '::1' ? '127.0.0.1' : log.ip }}
                  </div>
                </td>
                <td>
                  <span class="badge bg-success"> {{ $t('myProfile.success') }}</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="activeTab === 'plan'" class="plan-tab">
          <div class="row">
            <div class="col-md-8">
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                  <div class="d-flex align-items-center mb-4">
                    <CreditCard :size="24" class="text-primary me-3"/>
                    <div>
                      <h5 class="mb-1">{{ $t('myProfile.freePlan') }}</h5>
                      <p class="text-muted mb-0">{{ $t('myProfile.freePlanDescription') }}</p>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h6 class="mb-3">{{ $t('myProfile.storageUsage') }}</h6>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="text-muted">{{ formatBytes(limitUploadUsed) }} / {{ formatBytes(limitMaxUpload) }}</span>
                      <span class="badge bg-primary">{{ storagePercentage.toFixed(1) }}%</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div
                        class="progress-bar bg-primary"
                        role="progressbar"
                        :style="{ width: `${storagePercentage}%` }"
                        :aria-valuenow="storagePercentage"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small class="text-muted mt-1 d-block">
                      {{ $t('myProfile.storageRemaining') }} {{ formatBytes(limitMaxUpload - limitUploadUsed) }}
                    </small>
                  </div>

                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4 text-center">
                  <h6 class="mb-3">{{ $t('myProfile.upgradePlan') }}</h6>
                  <p class="text-muted small">
                    {{ $t('myProfile.upgradeDescription') }}
                  </p>
                  <button class="btn btn-outline-primary btn-sm" disabled>
                    {{ $t('myProfile.comingSoon') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, reactive} from 'vue';
import {
  Layout,
  User,
  Globe,
  Monitor,
  MapPin,
  CreditCard
} from 'lucide-vue-next';
import {useAuthStore} from '@/stores/auth'
import api from "@/utils/api";
import {useI18n} from "vue-i18n";
import {formatDate, formatTime} from "@/utils/utils";
import {VueTelInput} from "vue-tel-input";
import {toast} from "vue3-toastify";
import {Modal} from 'bootstrap';
import type { PhoneType} from '@/utils/types';

const {locale, t} = useI18n();
const user = useAuthStore().user
let accessLogs = ref([])
const showSpinner = ref(false)
const isPhoneValid = ref(false);
const phoneObject: PhoneType = reactive({})  as PhoneType;

const profile = reactive({
  id: user?.id,
  name: user?.name,
  email: user?.email,
  phone: user?.phone,
  avatar: user?.avatar,
});


const validatePhone = ({valid}: { valid: boolean }) => {
  isPhoneValid.value = valid;
};

const inputPhone = (_: string, phoneObj: PhoneType) => {
  Object.assign(phoneObject, phoneObj);
};

const fetchUserData = async () => {
  try {
    const response = await api.get('/user/me');
    const userData = response.data;

    // Update storage data with values from backend (in bytes)
    limitMaxUpload.value = userData.limitStorage || 0;
    limitUploadUsed.value = userData.usedStorage || 0;
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Keep default values if API fails
  }
};

onMounted(() => {
  showSpinner.value = true;

  // Fetch both access logs and user data
  Promise.all([
    api.get('/access-logs'),
    fetchUserData()
  ]).then(([logsResponse]) => {
    accessLogs.value = logsResponse.data;
    showSpinner.value = false;
  }).catch(error => {
    console.error('Error loading profile data:', error);
    showSpinner.value = false;
  });
})


const getActionBadgeClass = (action: string) => {
  switch (action.toLowerCase()) {
    case 'login':
      return 'bg-success';
    case 'logout':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
};

const isValidForm = computed(() => {
  return profile?.name.trim().length >= 2 && isPhoneValid.value;
});

const tabs = [
  {id: 'profile', name: 'myProfile.profile', icon: User},
  {id: 'logs', name: 'myProfile.accessLogs', icon: Layout},
  {id: 'plan', name: 'myProfile.myPlan', icon: CreditCard},
];

const defaultCountry = computed(() => {
  return locale.value === 'pt-BR' ? 'BR' : 'US';
});

const activeTab = ref('profile');

// Storage data from backend (in bytes)
const limitMaxUpload = ref(0); // Storage limit in bytes
const limitUploadUsed = ref(0); // Storage used in bytes

const storagePercentage = computed(() => {
  if (limitMaxUpload.value === 0) return 0;
  return (limitUploadUsed.value / limitMaxUpload.value) * 100;
});

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i >= 3) { // GB or larger
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  } else if (i >= 2) { // MB
    return `${(bytes / Math.pow(k, i)).toFixed(0)} ${sizes[i]}`;
  } else {
    return `${(bytes / Math.pow(k, i)).toFixed(0)} ${sizes[i]}`;
  }
};

const saveProfile = () => {
  showSpinner.value = true;

  api.put('/user', {...profile, phone: phoneObject.number}).then(res => {
    accessLogs.value = res.data
    showSpinner.value = false;
    useAuthStore().updateUser({...profile, phone: phoneObject.number})
    toast.success(t('myProfile.saveProfile'), {
      position: toast.POSITION.TOP_CENTER,
    });
  }).catch(err => {
    toast.error(t('myProfile.errorSaveProfile'), {
      position: toast.POSITION.TOP_CENTER,
    });
  })
  console.log('Profile saved:', profile);
};

const confirmDeleteAccount = () => {
  const modalElement = document.getElementById('deleteAccountModal');
  if (modalElement) {
    const modal = new Modal(modalElement);
    modal.show();
  }
};

const deleteAccount = () => {
  showSpinner.value = true;

  const deactivatedProfile = {
    ...profile,
    active: false
  };

  api.put('/user', deactivatedProfile).then(res => {
    showSpinner.value = false;

    // Hide the modal
    const modalElement = document.getElementById('deleteAccountModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }

    toast.success(t('myProfile.accountDeactivated'), {
      position: toast.POSITION.TOP_CENTER,
    });

    // Log out the user
    setTimeout(() => {
      useAuthStore().logout();
      window.location.href = '/login';
    }, 2000);
  }).catch(err => {
    showSpinner.value = false;
    toast.error(t('myProfile.errorDeactivating'), {
      position: toast.POSITION.TOP_CENTER,
    });
  });
};

</script>

<style scoped>
.dark-mode .table {
  background-color: #1e1e1e;
  color: #ffffff;
}

.dark-mode .table tbody tr {
  border-bottom: 1px solid #404040;
}

.dark-mode .table tbody tr:hover {
  background-color: #2d2d2d;
}

</style>
