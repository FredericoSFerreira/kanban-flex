<template>
  <!-- Template Selection Modal -->
  <div class="modal fade" id="templateModal" tabindex="-1" ref="templateModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h4 class="modal-title">{{ $t('templates.chooseStart') }}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-0">
          <!-- Step 1: Template Selection -->
          <div v-if="step === 1" class="p-4">
            <div class="row g-4">
              <!-- Blank Board Option -->
              <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm template-card" @click="selectTemplate('blank')">
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
                  <div class="card h-100 border template-option" @click="selectTemplate('template', template)">
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

          <!-- Step 2: Permissions and Members -->
          <div v-else-if="step === 2" class="p-4">
            <div class="mb-4">
              <label class="form-label fw-bold d-block mb-3">{{ $t('createBoard.visibilityLabel') }}</label>
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="card border p-3 visibility-option" :class="{ 'active border-primary bg-light': isPublic }" @click="isPublic = true">
                    <div class="d-flex align-items-center">
                      <div class="icon-circle bg-primary-subtle text-primary me-3">
                        <Globe :size="20" />
                      </div>
                      <div>
                        <div class="fw-bold">{{ $t('board.settingsPublic') }}</div>
                        <small class="text-muted" style="font-size: 0.75rem;">{{ $t('board.settingsPublicDescription') }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="card border p-3 visibility-option" :class="{ 'active border-primary bg-light': !isPublic }" @click="isPublic = false">
                    <div class="d-flex align-items-center">
                      <div class="icon-circle bg-warning-subtle text-warning me-3">
                        <Lock :size="20" />
                      </div>
                      <div>
                        <div class="fw-bold">{{ $t('board.settingsPrivate') }}</div>
                        <small class="text-muted" style="font-size: 0.75rem;">{{ $t('board.settingsPrivateDescription') }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-3 text-muted small d-flex align-items-center gap-2 alert alert-info py-2">
                <Info :size="16" class="text-primary" />
                <span>{{ $t('createBoard.visibilityWarning') }}</span>
              </div>
            </div>

            <div v-if="!isPublic" class="mb-4">
              <label class="form-label fw-bold mb-2">{{ $t('createBoard.inviteLabel') }}</label>
              <div class="input-group mb-3">
                <input 
                  v-model="newMemberEmail" 
                  type="email" 
                  class="form-control" 
                  :placeholder="$t('board.settingsInviteMemberPlaceholder')"
                  @keyup.enter="handleAddMember"
                >
                <button class="btn btn-primary" type="button" @click="handleAddMember" :disabled="isCheckingEmail">
                  <span v-if="isCheckingEmail" class="spinner-border spinner-border-sm me-1"></span>
                  {{ $t('createBoard.addEmail') }}
                </button>
              </div>

              <!-- Members List -->
              <div v-if="localMembers.length > 0 || pendingInvites.length > 0" class="member-list rounded border p-2">
                <div v-for="member in localMembers" :key="member.id" class="d-flex align-items-center justify-content-between p-2 rounded hover-bg mb-1">
                  <div class="d-flex align-items-center">
                    <img :src="member.avatar || userDefault" class="rounded-circle me-2" width="32" height="32">
                    <div>
                      <div class="fw-bold small">{{ member.name }}</div>
                      <div class="text-muted tiny">{{ member.email }}</div>
                    </div>
                  </div>
                  <button class="btn btn-link btn-sm text-danger" @click="removeMember(member.id)">
                    <X :size="16" />
                  </button>
                </div>
                <div v-for="email in pendingInvites" :key="email" class="d-flex align-items-center justify-content-between p-2 rounded hover-bg mb-1 bg-light-subtle italic">
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                      <Mail :size="16" class="text-white" />
                    </div>
                    <div>
                      <div class="fw-bold small">{{ email }}</div>
                      <span class="badge bg-info text-white tiny px-1">{{ $t('board.settingsInviteMember') }}</span>
                    </div>
                  </div>
                  <button class="btn btn-link btn-sm text-danger" @click="removePending(email)">
                    <X :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button class="btn btn-outline-secondary d-flex align-items-center gap-1" @click="step = 1">
                <ArrowLeft :size="18" />
                {{ $t('createBoard.back') }}
              </button>
              <button class="btn btn-primary btn-lg" @click="finalizeBoardCreation" :disabled="isCreating">
                <span v-if="isCreating" class="spinner-border spinner-border-sm me-2"></span>
                {{ $t('createBoard.create') }}
              </button>
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
  Globe,
  Lock,
  Mail,
  X,
  ArrowLeft,
  Info
} from "lucide-vue-next";
import {Modal} from 'bootstrap';
import {useRouter} from "vue-router";
import {useAuthStore} from '@/stores/auth'
import {useSwal} from "@/utils/swal";
import {useI18n} from "vue-i18n";
import {getTemplate, getTemplates} from "@/utils/templates";
import { useCloudFunctions } from '@/composables/useCloudFunctions'
const { callFunction } = useCloudFunctions()

const templateModal = ref(null);
const Swal = useSwal();

const auth = useAuthStore()
const {t} = useI18n();
let templateModalInstance: Modal | null = null;
const showingTemplates = ref(false);
const router = useRouter()
const templates = getTemplates().filter(template => template.type !== 'demo')
const userDefault = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

const step = ref(1);
const isPublic = ref(true);
const selectedTemplateData = ref(null);
const newMemberEmail = ref('');
const localMembers = ref([]);
const pendingInvites = ref([]);
const isCheckingEmail = ref(false);
const isCreating = ref(false);

onMounted(() => {
});

const showTemplateModal = () => {
  if (!auth.isAuthenticated) {
    return router.push('/login').then(() => {
      window.scrollTo({top: 0, behavior: 'smooth'})
    })
  }

  step.value = 1;
  showingTemplates.value = false;
  localMembers.value = [];
  pendingInvites.value = [];
  isPublic.value = true;
  if (!templateModalInstance) {
    templateModalInstance = new Modal(templateModal.value);
  }
  templateModalInstance.show();
};

const hideTemplateModal = () => {
  templateModalInstance?.hide();
}

const selectTemplate = (type: 'blank' | 'template', template?: any) => {
  selectedTemplateData.value = getTemplate(type === 'blank' ? 0 : template.id);
  step.value = 2;
};

const handleAddMember = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!newMemberEmail.value || !emailRegex.test(newMemberEmail.value)) {
    return toast.error(t('board.invalidEmailText') || 'Por favor, insira um endereço de e-mail válido.');
  }
  
  const email = newMemberEmail.value.trim().toLowerCase();
  if (localMembers.value.some(m => m.email === email) || pendingInvites.value.includes(email)) {
    newMemberEmail.value = '';
    return;
  }

  isCheckingEmail.value = true;
  try {
    const response = await callFunction('checkMemberEmail', { email });
    if (response.exists) {
      localMembers.value.push({
        id: response.id,
        email,
        name: response.name,
        avatar: response.avatar
      });
    } else {
      const confirm = await Swal.fire({
        title: t('board.inviteNotRegistered'),
        text: t('board.sendInviteConfirm'),
        icon: 'question',
        showCancelButton: true,
      });

      if (confirm.isConfirmed) {
        pendingInvites.value.push(email);
      }
    }
  } catch (error) {
    console.error('Error checking email:', error);
  } finally {
    isCheckingEmail.value = false;
    newMemberEmail.value = '';
  }
};

const removeMember = (id) => {
  localMembers.value = localMembers.value.filter(m => m.id !== id);
};

const removePending = (email) => {
  pendingInvites.value = pendingInvites.value.filter(e => e !== email);
};

const finalizeBoardCreation = async () => {
  isCreating.value = true;
  try {
    const members = [...localMembers.value];
    // Adiciona o dono como membro se não estiver na lista
    if (!members.some(m => m.userId === auth.user?.id)) {
      members.push({
        userId: auth.user?.id,
        email: auth.user?.email,
        name: auth.user?.name,
        avatar: auth.user?.avatar || userDefault
      });
    }

    const payload = { 
      template: selectedTemplateData.value,
      is_public: isPublic.value,
      members: members,
      pendingInviteEmails: pendingInvites.value
    };

    const response: any = await callFunction('createBoard', payload);
    const boardDatabase = response.board;
    templateModalInstance?.hide();
    
    await Swal.fire({
      icon: "success",
      title: t('createBoard.success'),
      showConfirmButton: true,
    });
    
    router.push(`/board/${boardDatabase.id}`);
  } catch (error: any) {
    console.error('Failed to create board:', error);
    Swal.fire({
      icon: "error",
      title: t('createBoard.error.title'),
      text: t('createBoard.error.message'),
    });
  } finally {
    isCreating.value = false;
  }
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

.visibility-option {
  cursor: pointer;
  transition: all 0.2s ease;
}

.visibility-option:hover {
  background-color: #f8f9fa;
  border-color: var(--bs-primary) !important;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-list {
  max-height: 200px;
  overflow-y: auto;
}

.hover-bg:hover {
  background-color: #f8f9fa;
}

.tiny {
  font-size: 0.7rem;
}

.italic {
  font-style: italic;
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
