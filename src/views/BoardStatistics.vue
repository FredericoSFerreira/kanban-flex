<template>
  <div class="container mt-3 mb-3">
    <div class="row g-4">

      <div class="col-11">
        <h2>{{ stats.boardName }}</h2>
      </div>
      <div class="col-1">
        <button class="btn btn-primary" @click="router.push(`/board/${route.params.id}`)">
          <Undo2 size="18"/>
        </button>
      </div>

      <!-- Overview Cards -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 bg-primary bg-opacity-10 rounded p-3">
                <LayoutList :size="24" class="text-primary"/>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">{{ $t('boardStatistics.totalColumns') }}</h6>
                <h3 class="mb-0">{{ stats.totalColumns }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 bg-success bg-opacity-10 rounded p-3">
                <CheckSquare :size="24" class="text-success"/>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">{{ $t('boardStatistics.totalCards') }}</h6>
                <h3 class="mb-0">{{ stats.totalCards }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 bg-info bg-opacity-10 rounded p-3">
                <Tag :size="24" class="text-info"/>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">{{ $t('boardStatistics.totalLabels') }}</h6>
                <h3 class="mb-0">{{ stats.totalLabels }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 bg-warning bg-opacity-10 rounded p-3">
                <MessageSquare :size="24" class="text-warning"/>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">{{ $t('boardStatistics.totalComments') }}</h6>
                <h3 class="mb-0">{{ stats.totalComments }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Board Summary -->
      <div class="col-md-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">{{ $t('boardStatistics.boardSummary') }}</h5>
              <button class="btn btn-sm btn-outline-primary" @click="generateBoardSummary(true)">
                <RefreshCw class="me-2"/>
                {{ $t('boardStatistics.boardSummaryRegenerateButton') }}
              </button>
            </div>
            <div class="board-summary">

              <div class="text-center py-5" v-if="showSpinner">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <p class="text-muted mb-4" v-if="!showSpinner">
                {{ stats.boardSummary }}
              </p>
              <div class="d-flex align-items-center">
                <Sparkles ::size="22" class="text-primary me-2"/>
                <small class="text-muted">{{ $t('boardStatistics.boardSummaryAIText') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">{{ $t('boardStatistics.teamMembers') }} ({{ stats.teamMembers.length }})</h5>
            </div>
            <div class="members-list">
              <div v-for="member in stats.teamMembers" :key="member.user_id"
                   class="member-item d-flex align-items-center mb-3">
                <img
                  :src="member.avatar"
                  :alt="member.name"
                  class="rounded-circle me-3"
                  width="40"
                  height="40"
                />
                <div class="flex-grow-1">
                  <h6 class="mb-0">{{ member.name }}</h6>
                  <small class="text-muted">{{ member.role }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Labels Distribution -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">{{ $t('boardStatistics.labelsDistribution') }}</h5>
            <div class="labels-list">
              <div v-for="label in stats.labelStats" :key="label.name" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge" :class="getLabelClass(label.name)">{{ label.name }}</span>
                  <span class="text-muted">{{ label.count }} cards</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div
                    class="progress-bar"
                    :class="getLabelClass(label.name)"
                    :style="{ width: `${(label.count / stats.totalCards) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Engagement Metrics -->
      <div class="col-md-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">{{ $t('boardStatistics.engagementMetrics') }}</h5>
            <div class="row g-4">
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <ThumbsUp ::size="24" class="text-success mb-2"/>
                  <h3 class="mb-1">{{ stats.totalLikes }}</h3>
                  <p class="text-muted mb-0">{{ $t('boardStatistics.totalLikes') }}</p>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <ThumbsDown ::size="24" class="text-danger mb-2"/>
                  <h3 class="mb-1">{{ stats.totalDislikes }}</h3>
                  <p class="text-muted mb-0">{{ $t('boardStatistics.totalDislikes') }}</p>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <MessageSquare ::size="24" class="text-info mb-2"/>
                  <h3 class="mb-1">{{ (stats.totalComments / stats.totalCards).toFixed(1) }}</h3>
                  <p class="text-muted mb-0">{{ $t('boardStatistics.commentsPerCard') }}</p>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <Tag ::size="24" class="text-primary mb-2"/>
                  <h3 class="mb-1">{{ (stats.totalLabels / stats.totalCards).toFixed(1) }}</h3>
                  <p class="text-muted mb-0">{{ $t('boardStatistics.labelsPerCards') }}</p>
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
import {onMounted, reactive, ref} from 'vue';
import {useSwal} from '@/utils/swal';

const {t} = useI18n();

const $swal = useSwal();
import {
  LayoutList,
  CheckSquare,
  Tag,
  MessageSquare,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Undo2
} from 'lucide-vue-next';
import api from "@/utils/api";
import {useRoute} from "vue-router";
import router from "@/router";
import {useI18n} from "vue-i18n";

const route = useRoute();

const stats = reactive({
  boardSummary: '',
  boardName: '',
  totalColumns: 0,
  totalCards: 0,
  totalComments: 0,
  totalLikes: 0,
  totalDislikes: 0,
  totalLabels: 0,
  labelStats: [] as { name: string; count: number }[],
  teamMembers: [] as { name: string, avatar?: string, user_id: string }[]
})

const showSpinner = ref(false)

function sanitizeAiResponse() {
  stats.boardSummary = stats.boardSummary.replace(/\\n+/g, '');
  stats.boardSummary = stats.boardSummary.replace(/\*+/g, '*');
  return stats.boardSummary.trim();
}

const getLabelClass = (label: string) => {
  const hash = label.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash % 6);
  return `bg-${['primary', 'success', 'info', 'warning', 'danger', 'secondary'][index]}`;
};

const getStats = () => {
  api.get(`boards/stats/${route.params.id}`)
    .then((response) => {
      const {data} = response
      console.log(data)
      const totals = data.totals[0]
      const boardInfo = data.board_info[0]
      stats.totalComments = totals.total_comments;
      stats.totalLikes = totals.total_likes;
      stats.totalDislikes = totals.total_dislikes;
      stats.teamMembers = data.unique_users;
      stats.totalLabels = data.label_counts.length;
      stats.totalColumns = boardInfo.totalColumns;
      stats.boardName = boardInfo.boardName;
      stats.totalCards = boardInfo.totalItems;
      stats.labelStats = data.label_counts.map((label: any) => ({
        name: label.label,
        count: label.count
      }))

    })
    .catch((error) => {
      console.log(error);
      $swal.fire({
        icon: "error",
        title: t('boardStatistics.notSupportTitle'),
        text: t('boardStatistics.notSupport'),
      });
      const redirectPath = route.query.redirect
      if (typeof redirectPath === 'string') {
        router.push(redirectPath)
      } else {
        router.push('/my-boards')
      }
    });
}

const generateBoardSummary = (regenerate: boolean = false) => {
  showSpinner.value = true
  api.get(`boards/summary/${route.params.id}?retry=${regenerate}`).then((response) => {
    const {data} = response
    showSpinner.value = false
    stats.boardSummary = data.summary
    sanitizeAiResponse()
  }).catch(error => {
    showSpinner.value = false
    console.log(error)
  })
}


onMounted(async () => {
  await getStats();
  await generateBoardSummary();
})
</script>

<style scoped>
.statistics-container {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 1rem;
}

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

.chart-placeholder {
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
}

/* Custom scrollbar styles */
.statistics-container::-webkit-scrollbar {
  width: 6px;
}

.statistics-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.statistics-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.statistics-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode compatibility */
:deep(.dark-mode) {
  .card {
    background-color: #2d2d2d;
    border-color: #404040;
  }

  .timeline-content {
    background-color: #363636;
  }

  .timeline-item:not(:last-child)::before {
    background-color: #404040;
  }

  .chart-placeholder {
    border-color: #404040;
  }

  .bg-light {
    background-color: #363636 !important;
  }

  .text-muted {
    color: #a0a0a0 !important;
  }

  /* Dark mode scrollbar */

  .statistics-container::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  .statistics-container::-webkit-scrollbar-thumb {
    background: #4a4a4a;
  }

  .statistics-container::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
  }
}
</style>
