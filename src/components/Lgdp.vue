<template>
  <div v-if="!hasConsent" class="cookie-consent" :class="{ 'show': isVisible }">
    <div class="container">
      <div class="cookie-content">
        <p class="mb-0">
          {{ $t('cookies.message') }}
          <router-link to="/privacy-policy" class="cookie-link">{{ $t('cookies.privacyPolicy') }}</router-link>
        </p>
        <div class="cookie-buttons">
          <button @click="acceptCookies" class="btn btn-primary">{{ $t('cookies.accept') }}</button>
          <button @click="rejectCookies" class="btn btn-outline-light">{{ $t('cookies.reject') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const hasConsent = ref(false);
const isVisible = ref(false);

onMounted(() => {
  const consent = localStorage.getItem('cookie-consent');
  hasConsent.value = consent === 'accepted' || consent === 'rejected';

  // Show banner with a slight delay for smooth animation
  setTimeout(() => {
    isVisible.value = true;
  }, 500);
});

const acceptCookies = () => {
  localStorage.setItem('cookie-consent', 'accepted');
  hasConsent.value = true;
};

const rejectCookies = () => {
  localStorage.setItem('cookie-consent', 'rejected');
  hasConsent.value = true;
};
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(33, 37, 41, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 1rem 0;
  z-index: 1050;
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cookie-consent.show {
  transform: translateY(0);
}

.cookie-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cookie-buttons {
  display: flex;
  gap: 0.5rem;
}

.cookie-link {
  color: var(--bs-primary);
  text-decoration: none;
}

.cookie-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    text-align: center;
  }

  .cookie-buttons {
    margin-top: 1rem;
  }
}

/* Dark mode compatibility */
:deep(.dark-mode) .cookie-consent {
  background: rgba(18, 18, 18, 0.95);
  border-top-color: rgba(255, 255, 255, 0.05);
}

:deep(.dark-mode) .btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
