<template>
  <!-- Template Selection Modal -->
  <div class="modal fade" id="templateModal" tabindex="-1" ref="templateModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h4 class="modal-title">{{ $t('templates.chooseStart') }}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-4">
            <!-- Blank Board Option -->
            <div class="col-md-6">
              <div class="card h-100 border-0 shadow-sm template-card" @click="createBoard('blank')">
                <div class="card-body p-4 text-center">
                  <Layout :size="48" class="text-primary mb-3"/>
                  <h5 class="mb-3">{{ $t('templates.blankBoard.title') }}</h5>
                  <p class="text-muted mb-0">{{ $t('templates.blankBoard.description') }}</p>
                </div>
              </div>
            </div>

            <!-- Template Option -->
            <div class="col-md-6">
              <div class="card h-100 border-0 shadow-sm template-card" @click="showTemplates">
                <div class="card-body p-4 text-center">
                  <FileTemplate :size="48" class="text-primary mb-3"/>
                  <h5 class="mb-3">{{ $t('templates.useTemplate.title') }}</h5>
                  <p class="text-muted mb-0">{{ $t('templates.useTemplate.description') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Templates Section (Initially Hidden) -->
          <div v-if="showingTemplates" class="mt-4">
            <h5 class="mb-3">{{ $t('templates.popularTemplates') }}</h5>
            <div class="row g-3">
              <div v-for="template in templates" :key="template.id" class="col-md-4">
                <div class="card h-100 border template-option" @click="createBoard('template', template)">
                  <div class="card-body p-3">
                    <component :is="template.icon" :size="24" class="text-primary mb-2"/>
                    <h6 class="mb-2">{{ $t(`templates.types.${template.type}.name`) }}</h6>
                    <p class="small text-muted mb-0">{{ $t(`templates.types.${template.type}.description`) }}</p>
                  </div>
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
import {ref, onMounted} from 'vue';
import {
  Layout,
  BookTemplate as FileTemplate,
} from "lucide-vue-next";
import {Modal} from 'bootstrap';
import {useRouter} from "vue-router";
import Parse from 'parse/dist/parse.min.js';
import {useAuthStore} from '@/stores/auth'
import {useSwal} from "@/utils/swal";
import {useI18n} from "vue-i18n";
import {getTemplate, getTemplates} from "@/utils/templates";

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const templateModal = ref(null);
const Swal = useSwal();

const auth = useAuthStore()
const {t} = useI18n();
let templateModalInstance: Modal | null = null;
const showingTemplates = ref(false);
const router = useRouter()
const Boards = Parse.Object.extend("boards");
const board = new Boards();
const templates = getTemplates()

onMounted(() => {
});

const showTemplateModal = () => {

  if (!auth.isAuthenticated) {
    return router.push('/login').then(() => {
      window.scrollTo({top: 0, behavior: 'smooth'}) // ou behavior: 'auto'
    })
  }

  showingTemplates.value = false;
  if (!templateModalInstance) {
    templateModalInstance = new Modal(templateModal.value);
  }
  templateModalInstance.show();
};

const hideTemplateModal = () => {
  templateModalInstance?.hide();
}

const createBoard = (type: 'blank' | 'template', template?: any) => {

  board.save(getTemplate(type === 'blank' ? 0 : template.id))
    .then(async (boardDatabase: any) => {

      templateModalInstance?.hide();
      localStorage.setItem("user", JSON.stringify({
        'name': auth.user?.name,
        'id': auth.user?.id,
        'email': auth.user?.email
      }))

      Swal.fire({
        icon: "success",
        title: "Board criado com sucesso!",
        showConfirmButton: true,
      }).then(() => {
        router.push(`/board/${boardDatabase.id}`)
      });

    }, (error: any) => {
      console.log('Failed to create new object, with error code: ' + error.message)
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Ocorreu um erro ao criar o board!",
      })
    })

};

const showTemplates = () => {
  showingTemplates.value = true;
};

defineExpose({
  showTemplateModal,
  hideTemplateModal
})

</script>

<style scoped>
.template-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.template-option {
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-option:hover {
  transform: translateY(-2px);
  border-color: var(--bs-primary) !important;
}

</style>
