<template>
  <div class="min-vh-100 bg-light">
    <!-- Hero Section -->
    <section class="hero-section position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="hero-particles"></div>

      <div class="container position-relative">
        <div class="row min-vh-100 align-items-center">
          <div class="col-lg-6">
            <div class="hero-content">
              <div class="hero-badge mb-4">
                <Sparkles :size="16" class="me-2"/>
                {{ t('hero.new') }}
              </div>

              <h1 class="hero-title mb-4">
                <span class="typing-text">{{ currentText }}</span>
                <span class="gradient-text">KanbanFlex</span>
              </h1>

              <p class="hero-subtitle mb-5">
                {{ $t('hero.subtitle') }}
              </p>

              <div class="hero-actions d-flex flex-column flex-sm-row gap-3 mb-5">
                <button @click="openCreateBoardModal()" class="btn btn-outline-light btn-lg hero-demo">
                  {{ $t('hero.getStarted') }}
                  <ArrowRight class="ms-2" :size="20"/>
                </button>
                <!--                <button class="btn btn-outline-light btn-lg hero-demo" @click="createBoardDemo()">-->
                <!--                  <Play class="me-2" size="20"/>-->
                <!--                  {{ $t('hero.watchDemo') }}-->
                <!--                </button>-->
              </div>

              <div class="hero-stats d-flex flex-wrap gap-4" v-if="1 == 1">
                <div class="stat-item">
                  <div class="stat-number">50K+</div>
                  <div class="stat-label">Usuários Ativos</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">1M+</div>
                  <div class="stat-label">Tarefas Concluídas</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">99.9%</div>
                  <div class="stat-label">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="hero-visual">
              <!-- Animated Kanban Board -->
              <div class="demo-board">
                <div class="board-header">
                  <h3>{{ t('templates.types.demo.name') }}</h3>
                </div>

                <div class="demo-columns">
                  <div v-for="(column, columnIndex) in demoColumns" :key="column.id" class="demo-column">
                    <div class="column-header">
                      <div class="column-title">
                        <div class="column-dot" :class="column.color"></div>
                        {{ column.title }}
                      </div>
                    </div>

                    <div class="column-cards">
                      <div
                        v-for="card in column.cards"
                        :key="card.id"
                        class="demo-card"
                        :style="{ animationDelay: `${card.animationDelay}ms` }"
                      >
                        <div class="card-content">
                          <h6>{{ card.title }}</h6>
                          <div class="card-tags">
                            <span v-for="tag in card.tags" :key="tag" class="tag">{{ tag }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
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

    <!-- CTA Section with Blue Gradient -->
    <section class="cta-section">
      <div class="cta-background"></div>
      <div class="container position-relative">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <div class="cta-content">
              <h2 class="cta-title">{{ $t('cta.title') }}</h2>
              <p class="cta-subtitle">
                {{ $t('cta.subtitle') }}
              </p>
              <button @click="openCreateBoardModal()" class="btn btn-light btn-lg cta-button">
                {{ $t('cta.button') }}
                <ArrowRight class="ms-2" :size="20"/>
              </button>
            </div>
          </div>
        </div>
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
import {ref, onMounted, onUnmounted, computed, watch} from 'vue';
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
import {useCloudFunctions} from '@/composables/useCloudFunctions'

const {callFunction} = useCloudFunctions()

import {useSwal} from '@/utils/swal';

const Swal = useSwal();
import {useRouter} from 'vue-router';
import {useAuthStore} from "@/stores/auth";

const {t, locale, messages} = useI18n();
const router = useRouter();
const auth = useAuthStore()

const createBoardModalRef = ref(null);
const showScrollTop = ref(false);


// Text animation
const currentText = ref('');
const textVariations = computed(() => {
  return messages.value[locale.value]?.hero?.textVariations || []
})
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let textTimer: number;

// Demo board animation
const demoColumns = computed(() => {
  return [
    {
      id: 'todo',
      title: t('templates.types.contentCalendar.columns.first'),
      color: 'bg-info',
      cards: []
    },
    {
      id: 'progress',
      title: t('templates.types.projectManagement.columns.third'),
      color: 'bg-warning',
      cards: []
    },
    {
      id: 'done',
      title: t('templates.types.projectManagement.columns.fifth'),
      color: 'bg-success',
      cards: []
    }
  ]
});

const allCards = computed(() => {
  return [
    {
      id: 'card-1',
      title: t('templates.types.demo.card1.title'),
      tags: t('templates.types.demo.card1.labels').split(','),
      animationDelay: 0
    },
    {
      id: 'card-2',
      title: t('templates.types.demo.card2.title'),
      tags: t('templates.types.demo.card2.labels').split(','),
      animationDelay: 10
    },
    {
      id: 'card-3',
      title: t('templates.types.demo.card3.title'),
      tags: t('templates.types.demo.card3.labels').split(','),
      animationDelay: 0
    }
  ];
})

let animationTimer: number;
let currentCardIndex = 0;
let currentColumnIndex = 0;

const startBoardAnimation = () => {
  // Reset board
  demoColumns.value.forEach(column => column.cards = []);

  // Add all cards to first column initially
  demoColumns.value[0].cards = [...allCards.value];

  // Start moving cards
  animationTimer = setInterval(() => {
    moveNextCard();
  }, 5000);
};

const moveNextCard = () => {
  // Find current card position
  let cardFound = false;
  let cardToMove = null;
  let sourceColumnIndex = -1;

  for (let i = 0; i < demoColumns.value.length - 1; i++) {
    if (demoColumns.value[i].cards.length > 0) {
      cardToMove = demoColumns.value[i].cards[0];
      sourceColumnIndex = i;
      cardFound = true;
      break;
    }
  }

  if (cardFound && cardToMove && sourceColumnIndex >= 0) {
    // Remove card from source column
    demoColumns.value[sourceColumnIndex].cards.shift();

    // Add card to next column
    const targetColumnIndex = sourceColumnIndex + 1;
    demoColumns.value[targetColumnIndex].cards.push(cardToMove);
  } else {
    // Reset animation - move all cards back to first column
    const allCurrentCards: [] = [];
    demoColumns.value.forEach(column => {
      allCurrentCards.push(...column.cards);
      column.cards = [];
    });

    if (allCurrentCards.length > 0) {
      demoColumns.value[0].cards = allCurrentCards;
    }
  }
};
const typeText = () => {
  const currentVariation = textVariations.value[textIndex];

  if (isDeleting) {
    currentText.value = currentVariation.substring(0, charIndex - 1);
    charIndex--;
  } else {
    currentText.value = currentVariation.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100; // Velocidade mais lenta e suave

  if (!isDeleting && charIndex === currentVariation.length) {
    typeSpeed = 4000; // Pausa mais longa no final
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % textVariations.value.length;
    typeSpeed = 800; // Pausa mais longa antes do próximo texto
  }

  textTimer = setTimeout(typeText, typeSpeed);
};


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
    is_coming: false
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
  await callFunction('createBoard', {template: {...templateDemo, demo: true}})
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

const playAnimation = ref(false)
onMounted(() => {
  typeText();
  window.addEventListener('scroll', handleScroll);
  startBoardAnimation()
});

watch(locale, (_) => {
  if (animationTimer) clearInterval(animationTimer)
  startBoardAnimation()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>


/* Hero Section with Blue Theme */
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%);
  color: white;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 40% 40%, rgba(30, 58, 138, 0.2) 0%, transparent 50%);
}

.hero-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
  radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
  radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.4), transparent),
  radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.3), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: float 20s infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(0px) translateX(0px);
  }
  33% {
    transform: translateY(-10px) translateX(10px);
  }
  66% {
    transform: translateY(5px) translateX(-5px);
  }
  100% {
    transform: translateY(0px) translateX(0px);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: fadeInUp 0.8s ease-out;
}

@media (max-width: 768px) {
  .hero-badge {
    margin-top: 15px;
  }
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.typing-text {
  position: relative;
  display: inline-block;
}

.typing-text::after {
  content: '|';
  color: #60a5fa;
  animation: blink 1.2s infinite;
  margin-left: 2px;
  font-weight: 400;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.gradient-text {
  background: linear-gradient(45deg, #60a5fa 0%, #93c5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  opacity: 0.9;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.hero-cta {
  background: linear-gradient(45deg, #2563eb, #1d4ed8);
  border: none;
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.hero-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(37, 99, 235, 0.4);
  background: linear-gradient(45deg, #1d4ed8, #1e40af);
}

.hero-demo {
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.hero-demo:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.hero-stats {
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #93c5fd;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 600px;
  animation: fadeInRight 1s ease-out 0.5s both;
}

/* Demo Board Styles */
/* Demo Board Styles */
.demo-board {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.board-header {
  display: flex;
  justify-content: space-between; /* Corrigido de 'between' para 'space-between' */
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.board-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.board-stats {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.demo-columns {
  display: flex;
  gap: 1rem;
  min-height: 300px;
}

.demo-column {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  min-height: 280px;
}

.column-header {
  display: flex;
  justify-content: space-between; /* Corrigido de 'between' para 'space-between' */
  align-items: center;
  margin-bottom: 1rem;
}

.column-title {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.column-count {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.column-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: cardSlideIn 0.5s ease-out;
}

.demo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.demo-card .card-content h6 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.demo-card .card-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.demo-card .tag {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 500;
}

/* --- Media Queries --- */

/* Para telas menores que 768px (tablets e smartphones) */
@media (max-width: 768px) {
  .demo-board {
    padding: 1rem; /* Reduzir o padding em telas menores */
  }

  .board-header {
    flex-direction: column; /* Empilha o título e as estatísticas */
    align-items: flex-start; /* Alinha à esquerda */
    margin-bottom: 1rem; /* Ajusta a margem */
    padding-bottom: 0.75rem; /* Ajusta o padding */
  }

  .board-header h3 {
    margin-bottom: 0.5rem; /* Adiciona um pequeno espaçamento */
    font-size: 1.1rem; /* Reduz o tamanho da fonte */
  }

  .board-stats {
    font-size: 0.8rem; /* Reduz o tamanho da fonte */
  }

  .demo-columns {
    flex-direction: column; /* Empilha as colunas verticalmente */
    min-height: auto; /* Remove a altura mínima fixa */
  }

  .demo-column {
    min-height: auto; /* Remove a altura mínima fixa */
    width: 100%; /* Ocupa a largura total */
    margin-bottom: 1rem; /* Espaçamento entre as colunas empilhadas */
  }

  .column-header {
    margin-bottom: 0.75rem; /* Ajusta a margem */
  }

  .demo-card .card-content h6 {
    font-size: 0.8rem; /* Reduz o tamanho da fonte do título do cartão */
  }

  .demo-card .tag {
    font-size: 0.6rem; /* Reduz o tamanho da fonte das tags */
    padding: 0.1rem 0.4rem; /* Ajusta o padding das tags */
  }
}

/* Para telas muito pequenas (smartphones em modo retrato) */
@media (max-width: 480px) {
  .demo-board {
    padding: 0.75rem; /* Mais um ajuste no padding */
  }

  .board-header h3 {
    font-size: 1rem; /* Mais um ajuste no tamanho da fonte */
  }

  .board-stats {
    font-size: 0.75rem; /* Mais um ajuste no tamanho da fonte */
  }

  .demo-column {
    padding: 0.75rem; /* Reduz o padding das colunas */
  }
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dark-mode .hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #f1f5f9;
}

.dark-mode .hero-background {
  background: radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.3) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
  radial-gradient(circle at 40% 40%, rgba(30, 64, 175, 0.2) 0%, transparent 50%);
}

.dark-mode .hero-cta {
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2);
}

.dark-mode .hero-cta:hover {
  background: linear-gradient(45deg, #0369a1, #075985);
  box-shadow: 0 15px 40px rgba(14, 165, 233, 0.3);
}

.dark-mode .hero-demo {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .hero-demo:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark-mode .demo-board {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.dark-mode .demo-column {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.dark-mode .column-title,
.dark-mode .column-count,
.dark-mode .board-header h3,
.dark-mode .board-stats {
  color: #e2e8f0;
}

.dark-mode .demo-card {
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .demo-card .card-content h6 {
  color: #f8fafc;
}

.dark-mode .demo-card .tag {
  background: #1e40af;
  color: #bfdbfe;
}


/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.cta-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.cta-button {
  background: white;
  color: #1d4ed8;
  border: none;
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  color: #1d4ed8;
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.cta-feature {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  opacity: 0.9;
}

.cta-feature svg {
  margin-right: 0.5rem;
  color: #10b981;
}

.dark-mode .cta-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #f1f5f9;
}

.dark-mode .cta-background {
  background: radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.3) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

.dark-mode .cta-title {
  color: #f8fafc;
}

.dark-mode .cta-subtitle {
  color: #cbd5e1;
}

.dark-mode .cta-button {
  background: #1e40af;
  color: #f8fafc;
  box-shadow: 0 10px 30px rgba(30, 58, 138, 0.3);
}

.dark-mode .cta-button:hover {
  background: #1d4ed8;
  color: white;
  box-shadow: 0 15px 40px rgba(30, 58, 138, 0.5);
}

.dark-mode .cta-feature {
  color: #e2e8f0;
}

.dark-mode .cta-feature svg {
  color: #34d399; /* tom esverdeado mais suave no dark */
}

.hero-dashboard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
}

.dashboard-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dashboard-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.scroll-arrow {
  width: 2px;
  height: 30px;
  background: rgba(255, 255, 255, 0.5);
  position: relative;
  animation: scrollBounce 2s infinite;
}

.scroll-arrow::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -3px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(255, 255, 255, 0.5);
  border-bottom: 2px solid rgba(255, 255, 255, 0.5);
  transform: rotate(45deg);
}

@keyframes scrollBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}


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
