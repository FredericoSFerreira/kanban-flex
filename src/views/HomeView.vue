<template>
  <div class="min-vh-100 bg-light">
    <!-- Hero Section -->
    <section class="py-5 py-md-7">
      <div class="container">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <h1 class="display-3 fw-bold mb-4">
              {{ t('hero.title') }} <span class="text-primary">KanbanFlex</span>
            </h1>
            <p class="lead mb-5 text-muted">
              {{ t('hero.subtitle') }}
            </p>
            <div class="d-flex justify-content-center gap-3">
              <button class="btn btn-primary btn-lg d-inline-flex align-items-center" @click="openCreateBoardModal()">
                {{ t('hero.getStarted') }}
                <ArrowRight class="ms-2" :size="20"/>
              </button>

<!--              <button class="btn btn-outline-primary btn-lg" @click="createBoardDemo()" v-if="!auth.isAuthenticated">-->
<!--                {{ t('hero.watchDemo') }}-->
<!--              </button>-->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-5 py-md-7 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold">{{ t('features.title') }}</h2>
          <p class="lead text-muted">
            {{ t('features.subtitle') }}
          </p>
        </div>

        <div class="row g-4">
          <div v-for="(feature, index) in features" :key="index" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm coming-soon-card">
              <div class="card-body p-4">
                <div class="coming-soon-badge" v-if="feature.is_coming">{{ t('features.coming') }}</div>
                <component :is="feature.icon" class="text-primary mb-3" :size="40"/>
                <h3 class="h4 fw-bold">{{ t(`features.${feature.title}.title`) }}</h3>
                <p class="text-muted">
                  {{ t(`features.${feature.description}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-5 py-md-7 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold">{{ t('pricing.title') }}</h2>
          <p class="lead text-muted">
            {{ t('pricing.subtitle') }}
          </p>
        </div>

        <div class="row g-4 justify-content-center">
          <div v-for="(plan, index) in plans" :key="index" class="col-md-6 col-lg-4">
            <div class="card h-100 border" :class="{ 'border-primary shadow': plan.popular }">
              <div v-if="plan.popular" class="card-header bg-primary text-white text-center py-2">
                Most Popular
              </div>
              <div class="card-body p-4">
                <h3 class="h4 fw-bold">{{ t(`pricing.${plan.name}.name`) }}</h3>
                <p class="text-muted">{{ t(`pricing.${plan.name}.description`) }}</p>
                <div class="my-4">
                  <span class="display-5 fw-bold">{{ t(`pricing.${plan.name}.price`) }}</span>
                  <span class="text-muted">{{ t(`pricing.${plan.name}.period`) }}</span>
                </div>
                <ul class="list-unstyled mb-4">
                  <li v-for="(feature, featureIndex) in plan.features" :key="featureIndex"
                      class="mb-2 d-flex align-items-center">
                    <component :is="plan.icon" class="text-success me-2" :size="20"/>
                    <span>{{ t(`pricing.features.${feature}`) }}</span>
                  </li>
                </ul>
                <a :href="plan.link"
                   class="btn w-100"
                   :class="plan.popular ? 'btn-primary' : 'btn-outline-primary'">
                  {{ t(`pricing.${plan.name}.button`) }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-5 py-md-7 bg-primary text-white">
      <div class="container text-center">
        <h2 class="display-5 fw-bold">{{ t('cta.title') }}</h2>
        <p class="lead opacity-75 mb-5">
          {{ t('cta.subtitle') }}
        </p>
        <button @click="openCreateBoardModal()" class="btn btn-light btn-lg text-primary px-5">
          {{ t('cta.button') }}
        </button>
      </div>
    </section>
  </div>

  <button
    class="btn btn-primary scroll-to-top"
    :class="{ 'show': showScrollTop }"
    @click="scrollToTop()"
    aria-label="Scroll to top"
  >
    <ArrowUp :size="20"/>
  </button>

  <CreateBoardModal ref="createBoardModalRef"></CreateBoardModal>

</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue';
import CreateBoardModal from '@/components/CreateBoardModal.vue';
import {
  CheckSquare,
  Users,
  BarChart3,
  ThumbsUp,
  Sparkles,
  Trello,
  ArrowRight,
  ArrowUp,
} from 'lucide-vue-next';
import {useI18n} from "vue-i18n";
import {getTemplate} from "@/utils/templates";
import { useCloudFunctions } from '@/composables/useCloudFunctions'
const { callPublicFunction } = useCloudFunctions()

import {useSwal} from '@/utils/swal';

const Swal = useSwal();
import {useRouter} from 'vue-router';
import {useAuthStore} from "@/stores/auth";

const {t} = useI18n();
const router = useRouter();
const auth = useAuthStore()

const createBoardModalRef = ref(null);
const showScrollTop = ref(false);

const features = ref([
  {
    icon: CheckSquare,
    title: 'taskManagement',
    description: 'taskManagement'
  },
  {
    icon: Users,
    title: 'teamCollaboration',
    description: 'teamCollaboration'
  },
  {
    icon: Trello,
    title: 'customization',
    description: 'customization'
  },
  {
    icon: ThumbsUp,
    title: 'voting',
    description: 'voting'
  },
  {
    icon: BarChart3,
    title: 'analytics',
    description: 'analytics',
  },
  {
    icon: Sparkles,
    title: 'ai',
    description: 'ai',
    is_coming: true
  },
]);

const plans = ref([
  {
    name: 'free',
    features: [
      'unlimited',
      'unlimitedMembers',
      'boardSummaryAi',
      'unlimitedTemplates'
    ],
    icon: CheckSquare,
    link: '#',
    popular: false
  },
]);


const openCreateBoardModal = () => {
  createBoardModalRef.value.showTemplateModal();
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 100;
};

const createBoardDemo = async () => {
  const templateDemo = getTemplate(8)
  await callPublicFunction('createBoard', {template: {...templateDemo, demo: true}})
    .then((result: any) => {
      return router.push(`/board/${result.board.id}?demo=true`)
    }, (error: any) => {
      console.log('Failed to create new object, with error code: ' + error.message)
      return Swal.fire({
        icon: "error",
        title: t('createBoard.error.title'),
        text: t('createBoard.error.message'),
      })
    })
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.coming-soon-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0 !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.coming-soon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.coming-soon-badge {
  position: absolute;
  top: 12px;
  right: -35px;
  background: linear-gradient(45deg, #2563eb, #3b82f6);
  color: white;
  padding: 6px 40px;
  font-size: 0.75rem;
  font-weight: 600;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content {
  margin-top: 50px; /* espaço para o menu fixo */
  margin-bottom: 50px; /* espaço para o rodapé fixo */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 180px); /* calcula a altura restante entre o menu e o rodapé */
  text-align: center;
}

.icon-logo {
  font-size: 80px;
  color: #007bff; /* cor do ícone */
}

.btn-primary {
  background-color: #007bff; /* cor do botão */
  border-color: #007bff; /* borda do botão */
}

.btn-primary:hover {
  background-color: #0056b3; /* cor do botão ao passar o mouse */
  border-color: #004085; /* borda ao passar o mouse */
}

:deep(.dark-mode) {
  .coming-soon-card {
    border-color: #2d2d2d !important;
  }
}

/* Scroll to Top Button */
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.scroll-to-top.show {
  opacity: 1;
  visibility: visible;
}

.scroll-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
</style>
