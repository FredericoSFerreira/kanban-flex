<template>
  <div class="statistics-container">
    <div class="row g-4">
      <!-- Overview Cards -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0 bg-primary bg-opacity-10 rounded p-3">
                <LayoutList size="24" class="text-primary" />
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Total Columns</h6>
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
                <CheckSquare size="24" class="text-success" />
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Total Cards</h6>
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
                <Tag size="24" class="text-info" />
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Total Labels</h6>
                <h3 class="mb-0">{{ stats.uniqueLabels.length }}</h3>
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
                <MessageSquare size="24" class="text-warning" />
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Total Comments</h6>
                <h3 class="mb-0">{{ stats.totalComments }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards per Column Chart -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Cards per Column</h5>
            <div class="chart-container" style="height: 300px;">
              <div class="chart-placeholder d-flex align-items-center justify-content-center h-100">
                <div class="text-center">
                  <BarChart2 size="48" class="text-muted mb-3" />
                  <p class="text-muted">Chart visualization would go here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Labels Distribution -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Labels Distribution</h5>
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

      <!-- Activity Timeline -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Recent Activity</h5>
            <div class="timeline">
              <div v-for="(activity, index) in recentActivity" :key="index" class="timeline-item">
                <div class="timeline-icon" :class="activity.iconClass">
                  <component :is="activity.icon" size="16" />
                </div>
                <div class="timeline-content">
                  <p class="mb-1">{{ activity.description }}</p>
                  <small class="text-muted">{{ activity.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Engagement Metrics -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Engagement Metrics</h5>
            <div class="row g-4">
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <ThumbsUp size="24" class="text-success mb-2" />
                  <h3 class="mb-1">{{ stats.totalLikes }}</h3>
                  <p class="text-muted mb-0">Total Likes</p>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <ThumbsDown size="24" class="text-danger mb-2" />
                  <h3 class="mb-1">{{ stats.totalDislikes }}</h3>
                  <p class="text-muted mb-0">Total Dislikes</p>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <MessageSquare size="24" class="text-info mb-2" />
                  <h3 class="mb-1">{{ (stats.totalComments / stats.totalCards).toFixed(1) }}</h3>
                  <p class="text-muted mb-0">Comments per Card</p>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center p-3 rounded bg-light">
                  <Tag size="24" class="text-primary mb-2" />
                  <h3 class="mb-1">{{ (stats.totalLabels / stats.totalCards).toFixed(1) }}</h3>
                  <p class="text-muted mb-0">Labels per Card</p>
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
import { computed } from 'vue';
import {
  LayoutList,
  CheckSquare,
  Tag,
  MessageSquare,
  BarChart2,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Edit,
  ArrowRight
} from 'lucide-vue-next';

const props = defineProps<{
  columns: any[]
}>();

// Calculate statistics
const stats = computed(() => {
  const result = {
    totalColumns: props.columns.length,
    totalCards: 0,
    totalComments: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalLabels: 0,
    uniqueLabels: new Set<string>(),
    labelStats: [] as { name: string; count: number }[]
  };

  const labelCounts = new Map<string, number>();

  props.columns.forEach(column => {
    column.itens.forEach((card: any) => {
      result.totalCards++;
      result.totalComments += card.comments?.length || 0;
      result.totalLikes += card.likes || 0;
      result.totalDislikes += card.dislikes || 0;

      if (card.labels) {
        result.totalLabels += card.labels.length;
        card.labels.forEach((label: string) => {
          result.uniqueLabels.add(label);
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        });
      }
    });
  });

  result.labelStats = Array.from(labelCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return result;
});

// Mock recent activity data
const recentActivity = [
  {
    icon: Plus,
    iconClass: 'bg-success',
    description: 'New card "Update documentation" added to Development',
    time: '5 minutes ago'
  },
  {
    icon: Edit,
    iconClass: 'bg-primary',
    description: 'Card "Fix login bug" moved to Testing',
    time: '1 hour ago'
  },
  {
    icon: ArrowRight,
    iconClass: 'bg-info',
    description: 'New column "QA Review" added',
    time: '2 hours ago'
  }
];

// Utility function to get label class
const getLabelClass = (label: string) => {
  const hash = label.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash % 6);
  return `bg-${['primary', 'success', 'info', 'warning', 'danger', 'secondary'][index]}`;
};
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
