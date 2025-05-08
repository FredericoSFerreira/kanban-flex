<template>

  <div class="content">
    <i class="bi bi-wrench-adjustable icon-logo"></i>
    <h1>404</h1>
    <p class="mt-3 mb-4">{{ $t('error.notFound') }}</p>
     <a href="/" class="btn btn-primary btn-lg">{{ $t('error.back') }}</a>
  </div>

</template>
<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<style scoped>
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
      font-size: 100px;
      color: #007bff; /* cor do ícone */
    }
</style>
