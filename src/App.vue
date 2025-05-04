<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <!-- Navigation - Hidden on admin route -->
    <nav class="navbar navbar-expand-md"
         :class="isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white shadow-sm'">
      <div class="container">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <Trello class="text-primary" size="32"/>
          <span class="ms-2 fw-bold">KanbanFlex</span>
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">{{ $t('nav.home') }}</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/my-boards">{{ $t('nav.myBoards') }}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" @click.prevent="navigateToSection('features')" href="#features">{{
                  $t('nav.features')
                }}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" @click.prevent="navigateToSection('pricing')" href="#pricing">{{
                  $t('nav.pricing')
                }}</a>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <div class="dropdown me-3">
              <button
                class="btn btn-link text-decoration-none dropdown-toggle"
                :class="isDarkMode ? 'text-light' : 'text-dark'"
                type="button"
                id="languageDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                ref="languageDropdownBtn"
              >
                <country-flag :country="currentLocale === 'en' ? 'usa' : 'bra'" size='small' rounded="true"/>

                {{ $t(`language.${currentLocale}`) }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="languageDropdown">
                <li v-for="locale in availableLocales" :key="locale">
                  <button
                    class="dropdown-item"
                    :class="{ active: currentLocale === locale }"
                    @click="changeLocale(locale)"
                  >
                    <country-flag :country="locale === 'en' ? 'usa' : 'bra'" size='small' rounded="true"/>
                    {{ $t(`language.${locale}`) }}
                  </button>
                </li>
              </ul>
            </div>
            <button
              class="btn btn-link p-0 me-3"
              :class="isDarkMode ? 'text-light' : 'text-dark'"
              @click="toggleTheme"
            >
              <Sun v-if="isDarkMode" :size="20"/>
              <Moon v-else :size="20"/>
            </button>
            <router-link v-if="!auth.isAuthenticated" to="/login" class="btn btn-link text-decoration-none me-3"
                         :class="isDarkMode ? 'text-light' : 'text-dark'">{{ $t('nav.login') }}
            </router-link>
            <router-link v-if="!auth.isAuthenticated" to="/register" class="btn btn-primary">{{ $t('nav.signUp') }}</router-link>


          <div class="d-flex align-items-center" v-if="auth.isAuthenticated">
            <div class="dropdown me-3">
              <button
                class="btn btn-link text-decoration-none dropdown-toggle"
                :class="isDarkMode ? 'text-light' : 'text-dark'"
                type="button"
                id="languageDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                ref="languageDropdownBtn"
              >
                {{ getFirstAndLastName() }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="languageDropdown">
                <li >
                  <button
                    class="dropdown-item"
                    @click="logout()"
                  >
                    {{ $t('auth.logout') }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    </nav>

    <router-view/>

    <!-- Footer - Hidden on admin route -->
    <footer class="bg-dark text-white">
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-lg-4 col-md-4">
            <div class="d-flex align-items-center mb-3">
              <Trello class="text-primary" size="32"/>
              <span class="ms-2 h5 fw-bold mb-0">KanbanFlex</span>
            </div>
            <p class="text-light">
              {{ $t('hero.subtitle_footer') }}
            </p>
          </div>

          <div v-for="(column, index) in footerColumns" :key="index" class="col-lg-2 col-md-2 col-sm-3">
            <h3 class="h5 fw-bold mb-3 text-light">{{ $t(`footer.${column.key}.title`) }}</h3>
            <ul class="list-unstyled">
              <li v-for="(link, linkIndex) in column.links" :key="linkIndex" class="mb-2">
                <a :href="`${link.path}`" :target="link.target || '_self'"
                   class="text-light text-decoration-none hover-opacity">{{
                    $t(`footer.${column.key}.${link.label}`)
                  }}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-top border-secondary mt-3 pt-4 text-center text-light">
          <p>{{ $t('footer.copyright') }}</p>       <a href="https://github.com/FredericoSFerreira/Open-Sprint-Retro"
                                                       class="text-light hover-opacity">
          <Github :size="24"/>
        </a>
        </div>
      </div>
    </footer>
  </div>
  <CookieConsent/>
</template>

<script setup lang="ts">
import CookieConsent from './components/Lgdp.vue';
import {ref, computed, watchEffect, onMounted} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRouter, useRoute} from 'vue-router';
import {useAuthStore} from "@/stores/auth";
import {Dropdown} from 'bootstrap';
import {
  Trello,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon
} from 'lucide-vue-next';

const auth = useAuthStore()
const {locale, t} = useI18n();
const router = useRouter();
const route = useRoute();
const currentLocale = computed({
  get: () => locale.value,
  set: (val) => {
    locale.value = val;
    localStorage.setItem('user-locale', val);
    document.querySelector('html')?.setAttribute('lang', val);
  }
});
const availableLocales = ['en', 'pt-BR'];
const languageDropdownBtn = ref(null);

const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

onMounted(() => {
  // Initialize the language dropdown
  if (languageDropdownBtn.value) {
    new Dropdown(languageDropdownBtn.value);
  }
});

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

const changeLocale = (newLocale: string) => {
  if (locale.value !== newLocale) {
    locale.value = newLocale;
    localStorage.setItem('user-locale', newLocale);
    document.querySelector('html')?.setAttribute('lang', newLocale);
  }
};

// Watch for locale changes and update HTML lang attribute
watchEffect(() => {
  document.querySelector('html')?.setAttribute('lang', locale.value);
});

const logout = () => {
  router.push('/');
  auth.logout();
}

const navigateToSection = async (sectionId: string) => {
  if (route.path !== '/') {
    await router.push('/');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({behavior: 'smooth'});
  }
};

const footerColumns = [
  {
    key: 'boards',
    links: [{
      path: '/my-boards',
      label: 'link1',
    },
      {
        path: '#',
        label: 'link2',
      }]
  },
  {
    key: 'account',
    links: [{
      path: '/login',
      label: 'link1'
    }, {
      path: '/register',
      label: 'link2'
    }]
  },
  {
    key: 'terms',
    links: [{
      path: '/terms',
      label: 'link2'
    }, {
      path: '/privacy-policy',
      label: 'link1'
    }]
  },
  {
    key: 'status',
    links: [
      {
        target: '_blank',
        path: 'https://github.com/FredericoSFerreira/Open-Sprint-Retro/issues/new',
        label: 'link1'
      },
      {
        target: '_blank',
        path: 'https://stats.uptimerobot.com/aeBUanxj9O/798023901',
        label: 'link2'
      },
    ]
  },
];


const getFirstAndLastName = (): string  => {
  const parts = auth.user?.name?.trim().split(/\s+/) || '';
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first} ${last}`;
}
</script>

<style>
/* Dark mode styles */
.dark-mode {
  background-color: #121212;
  color: #ffffff;
}

.dark-mode .card {
  background-color: #1e1e1e;
  border-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .card-header {
  background-color: #2d2d2d;
  border-bottom-color: #363636;
  color: #ffffff;
}

.dark-mode .modal-content {
  background-color: #1e1e1e;
  color: #ffffff;
}

.dark-mode .modal-header {
  border-bottom-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .modal-footer {
  border-top-color: #2d2d2d;
}

.dark-mode .form-control {
  background-color: #2d2d2d;
  border-color: #363636;
  color: #ffffff;
}

.dark-mode .form-control:focus {
  background-color: #363636;
  border-color: #4a4a4a;
  color: #ffffff;
}

.dark-mode .form-floating > label {
  color: #a0a0a0;
}

.dark-mode .form-floating > .form-control:focus ~ label,
.dark-mode .form-floating > .form-control:not(:placeholder-shown) ~ label {
  color: #ffffff;
}

.dark-mode .form-check-input {
  background-color: #2d2d2d;
  border-color: #363636;
}

.dark-mode .form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.dark-mode .form-check-label {
  color: #ffffff;
}

.dark-mode .dropdown-menu {
  background-color: #1e1e1e;
  border-color: #2d2d2d;
}

.dark-mode .dropdown-item {
  color: #ffffff;
}

.dark-mode .dropdown-item:hover {
  background-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .dropdown-item.active {
  background-color: var(--bs-primary);
  color: #ffffff;
}

.dark-mode .bg-light {
  background-color: #121212 !important;
  color: #ffffff !important;
}

.dark-mode .bg-white {
  background-color: #1e1e1e !important;
  color: #ffffff !important;
}

.dark-mode .text-muted {
  color: #a0a0a0 !important;
}

.dark-mode .text-dark {
  color: #ffffff !important;
}

.dark-mode .lead {
  color: #ffffff;
}

.dark-mode h1,
.dark-mode h2,
.dark-mode h3,
.dark-mode h4,
.dark-mode h5,
.dark-mode h6,
.dark-mode .h1,
.dark-mode .h2,
.dark-mode .h3,
.dark-mode .h4,
.dark-mode .h5,
.dark-mode .h6 {
  color: #ffffff;
}

.dark-mode .btn-light {
  background-color: #2d2d2d;
  border-color: #363636;
  color: #ffffff;
}

.dark-mode .btn-light:hover {
  background-color: #363636;
  border-color: #404040;
  color: #ffffff;
}

.dark-mode .btn-outline-secondary {
  color: #ffffff;
  border-color: #404040;
}

.dark-mode .btn-outline-secondary:hover {
  background-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.dark-mode .border-top {
  border-color: #2d2d2d !important;
}

.dark-mode .shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.15) !important;
}

/* Navigation link cursor */
.nav-link {
  cursor: pointer;
}

/* Dropdown styles */
.dropdown-menu {
  margin-top: 0.5rem;
}

.dropdown-toggle::after {
  vertical-align: middle;
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item:active,
.dropdown-item:focus {
  outline: none;
}
</style>
