<template>
  <div class="container py-5" style="padding-bottom: 10rem !important;">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h2 mb-0">{{ $t('myAttachments.title') }}</h1>
      <router-link to="/my-profile" class="btn btn-outline-secondary">
        <ArrowLeft :size="18" class="me-2"/>
        {{ $t('myAttachments.backToProfile') }}
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="mb-4" v-if="attachments.length > 0 || searchTerm">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          v-model="searchTerm"
          :placeholder="$t('myAttachments.search.placeholder')"
          @input="handleSearchInput"
        >
        <button class="btn btn-outline-secondary" type="button" @click="searchFiles()">
          <Search :size="18"/>
        </button>
        <button
          v-if="searchTerm"
          class="btn btn-outline-danger"
          type="button"
          @click="clearSearch()"
        >
          <X :size="18"/>
        </button>
      </div>
    </div>

    <!-- Storage Usage Info -->
    <div class="alert alert-info mb-4" v-if="storageInfo">
      <div class="d-flex align-items-center">
        <HardDrive :size="20" class="me-2"/>
        <div class="flex-grow-1">
          <strong>{{ $t('myAttachments.storageUsed') }}:</strong>
          {{ formatBytes(storageInfo.totalSize) }} / {{ formatBytes(storageInfo.maxSize) }}
          <div class="progress mt-2" style="height: 6px;">
            <div
              class="progress-bar"
              :class="getStorageBarClass()"
              :style="{ width: `${getStoragePercentage()}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center py-5" v-if="showSpinner">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="attachments.length === 0 && !showSpinner && !searchTerm" class="text-center py-5">
      <FileText :size="70" class="text-primary mb-3"/>
      <h2 class="h3 mb-4">{{ $t('myAttachments.emptyState.title') }}</h2>
      <p class="text-muted mb-5">{{ $t('myAttachments.emptyState.description') }}</p>
    </div>

    <!-- No Search Results -->
    <div v-else-if="searchTerm && attachments.length === 0 && !showSpinner" class="text-center py-5">
      <SearchX :size="48" class="text-muted mb-3"/>
      <h2 class="h4 mb-3">{{ $t('myAttachments.search.noResults') }}</h2>
      <p class="text-muted mb-4">{{ $t('myAttachments.search.noResultsDesc', {query: searchTerm}) }}</p>
      <button class="btn btn-outline-primary" @click="clearSearch">
        {{ $t('myAttachments.search.showAll') }}
      </button>
    </div>

    <!-- Search Results Info -->
    <div v-if="searchTerm && attachments.length > 0" class="alert alert-light mb-4">
      <Search :size="16" class="me-2"/>
      {{ $t('myAttachments.search.results', {count: attachments.length, query: searchTerm}) }}
    </div>

    <!-- Files Table -->
    <div v-if="attachments.length > 0 && !showSpinner" class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>{{ $t('myAttachments.fileName') }}</th>
              <th>{{ $t('myAttachments.fileType') }}</th>
              <th>{{ $t('myAttachments.fileSize') }}</th>
              <th>{{ $t('myAttachments.uploadDate') }}</th>
              <th class="text-center">{{ $t('myAttachments.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in attachments" :key="file.id">
              <td>
                <div class="d-flex align-items-center">
                  <div class="file-icon me-3">
                    <FileImage v-if="file.isImage" :size="24" class="text-primary"/>
                    <FileText v-else :size="24" class="text-secondary"/>
                  </div>
                  <div>
                    <div class="fw-medium" v-html="highlightSearchTerm(file.name)"></div>
                    <small class="text-muted" v-if="file.boardId">
                      {{ $t('myAttachments.attachedToBoard') }}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" :class="getFileTypeBadgeClass(file.type)">
                  {{ getFileTypeLabel(file.type) }}
                </span>
              </td>
              <td>{{ formatBytes(file.size) }}</td>
              <td>{{ formatDate(file.createdAt) }}</td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-primary"
                    @click="downloadFile(file)"
                    :disabled="downloadingFiles[file.id]"
                  >
                    <Download v-if="!downloadingFiles[file.id]" :size="16"/>
                    <div v-else class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    @click="confirmDeleteFile(file)"
                    :disabled="deletingFiles[file.id]"
                  >
                    <Trash2 v-if="!deletingFiles[file.id]" :size="16"/>
                    <div v-else class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteFileModal" tabindex="-1" aria-labelledby="deleteFileModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteFileModalLabel">{{ $t('myAttachments.deleteModal.title') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ $t('myAttachments.deleteModal.message', {fileName: fileToDelete?.name || ''}) }}</p>
            <p class="text-danger fw-bold">{{ $t('myAttachments.deleteModal.warning') }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ $t('myAttachments.deleteModal.cancel') }}
            </button>
            <button type="button" class="btn btn-danger" @click="deleteFile" :disabled="deletingFiles[fileToDelete?.id]">
              <Trash2 v-if="!deletingFiles[fileToDelete?.id]" :size="16" class="me-1"/>
              <div v-else class="spinner-border spinner-border-sm me-1" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              {{ $t('myAttachments.deleteModal.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { Modal } from 'bootstrap';
import {
  Search,
  SearchX,
  FileText,
  FileImage,
  Download,
  Trash2,
  HardDrive,
  ArrowLeft,
  X
} from 'lucide-vue-next';
import api from '@/utils/api';
import { formatDate } from '@/utils/utils';

const { t } = useI18n();

// Reactive data
const attachments = ref([]);
const searchTerm = ref('');
const showSpinner = ref(false);
const storageInfo = ref(null);
const downloadingFiles = reactive({});
const deletingFiles = reactive({});
const fileToDelete = ref(null);

// Search functionality
let searchTimeout: NodeJS.Timeout;

const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchFiles();
  }, 500);
};

const searchFiles = async () => {
  showSpinner.value = true;
  try {
    const params = searchTerm.value ? { search: searchTerm.value } : {};
    const response = await api.get('/attachments/user', { params });
    attachments.value = response.data.attachments || [];
  } catch (error) {
    console.error('Error searching files:', error);
    toast.error(t('myAttachments.errors.searchFailed'));
    attachments.value = [];
  } finally {
    showSpinner.value = false;
  }
};

const clearSearch = () => {
  searchTerm.value = '';
  loadAttachments();
};

// Load attachments
const loadAttachments = async () => {
  showSpinner.value = true;
  try {
    const [attachmentsResponse, storageResponse] = await Promise.all([
      api.get('/attachments/user'),
      api.get('/attachments/user/size')
    ]);

    attachments.value = attachmentsResponse.data.attachments || [];
    storageInfo.value = storageResponse.data;
  } catch (error) {
    console.error('Error loading attachments:', error);
    toast.error(t('myAttachments.errors.loadFailed'));
    attachments.value = [];
  } finally {
    showSpinner.value = false;
  }
};

// File operations
const downloadFile = async (file: any) => {
  downloadingFiles[file.id] = true;
  try {
    const response = await api.get(`/attachments/${file.id}/download`);
    if (response.data.success && response.data.url) {
      // Open download link in new tab
      window.open(response.data.url, '_blank');
      toast.success(t('myAttachments.downloadStarted'));
    } else {
      throw new Error('Download URL not available');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error(t('myAttachments.errors.downloadFailed'));
  } finally {
    downloadingFiles[file.id] = false;
  }
};

const confirmDeleteFile = (file: any) => {
  fileToDelete.value = file;
  const modalElement = document.getElementById('deleteFileModal');
  if (modalElement) {
    const modal = new Modal(modalElement);
    modal.show();
  }
};

const deleteFile = async () => {
  if (!fileToDelete.value) return;

  deletingFiles[fileToDelete.value.id] = true;
  try {
    const response = await api.delete(`/attachments/${fileToDelete.value.id}`);
    if (response.data.success) {
      // Remove from list
      attachments.value = attachments.value.filter(f => f.id !== fileToDelete.value.id);
      toast.success(t('myAttachments.deleteSuccess'));

      // Hide modal
      const modalElement = document.getElementById('deleteFileModal');
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        modal?.hide();
      }

      // Refresh storage info
      try {
        const storageResponse = await api.get('/attachments/user/size');
        storageInfo.value = storageResponse.data;
      } catch (e) {
        console.warn('Failed to refresh storage info');
      }
    } else {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.error(t('myAttachments.errors.deleteFailed'));
  } finally {
    deletingFiles[fileToDelete.value.id] = false;
    fileToDelete.value = null;
  }
};

// Utility functions
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
};

const getStoragePercentage = () => {
  if (!storageInfo.value) return 0;
  return (storageInfo.value.totalSize / storageInfo.value.maxSize) * 100;
};

const getStorageBarClass = () => {
  const percentage = getStoragePercentage();
  if (percentage >= 90) return 'bg-danger';
  if (percentage >= 75) return 'bg-warning';
  return 'bg-primary';
};

const getFileTypeLabel = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'IMG';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word')) return 'DOC';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'XLS';
  return 'FILE';
};

const getFileTypeBadgeClass = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'bg-primary';
  if (mimeType.includes('pdf')) return 'bg-danger';
  if (mimeType.includes('word')) return 'bg-info';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'bg-success';
  return 'bg-secondary';
};

const highlightSearchTerm = (text: string) => {
  if (!searchTerm.value || !text) return text;
  const regex = new RegExp(`(${searchTerm.value})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Initialize
onMounted(() => {
  loadAttachments();
});
</script>

<style scoped>
.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.table th {
  border-top: none;
  font-weight: 600;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

mark {
  background-color: #fff3cd;
  padding: 0.1rem 0.2rem;
  border-radius: 0.2rem;
}
</style>
