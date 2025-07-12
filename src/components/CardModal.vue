<template>
  <div class="modal fade" id="cardModal" tabindex="-1" ref="cardModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <!-- Modal Header -->
        <div class="modal-header border-0 pb-0">
          <div class="d-flex align-items-center">
            <div>
              <h4 class="modal-title mb-0">{{ isEditing ? t('boardV2.editCard') : t('boardV2.newCard') }}</h4>
              <small class="text-muted">{{
                  isEditing ? t('boardV2.editCardDescription') : t('boardV2.newCardDescription')
                }}</small>

            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-0">
          <div class="row g-0">
            <!-- Left Panel - Form -->
            <div class="col-lg-8 border-end">
              <div class="p-4">
                <!-- Card Title -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <FileText size="16" class="me-2"/>
                    {{$t('boardV2.title')}}
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    v-model="cardData.title"
                    placeholder="Digite o título do card..."
                  />
                </div>

                <!-- Card Description -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <AlignLeft size="16" class="me-2"/>
                    {{ $t('boardV2.description') }}
                  </label>
                  <textarea
                    class="form-control"
                    rows="4"
                    v-model="cardData.description"
                    placeholder="Descreva os detalhes do card..."
                  ></textarea>
                </div>

                <!-- Row with Priority and Due Date -->
                <!--                <div class="row g-3 mb-4">-->
                <!--                  <div class="col-md-6">-->
                <!--                    <label class="form-label fw-semibold">-->
                <!--                      <AlertCircle size="16" class="me-2"/>-->
                <!--                      Prioridade-->
                <!--                    </label>-->
                <!--                    <select class="form-select" v-model="cardData.priority">-->
                <!--                      <option value="">Selecionar prioridade</option>-->
                <!--                      <option value="low">🟢 Baixa</option>-->
                <!--                      <option value="medium">🟡 Média</option>-->
                <!--                      <option value="high">🔴 Alta</option>-->
                <!--                      <option value="urgent">🚨 Urgente</option>-->
                <!--                    </select>-->
                <!--                  </div>-->
                <!--                  <div class="col-md-6">-->
                <!--                    <label class="form-label fw-semibold">-->
                <!--                      <Calendar size="16" class="me-2"/>-->
                <!--                      Data de Vencimento-->
                <!--                    </label>-->
                <!--                    <input-->
                <!--                      type="date"-->
                <!--                      class="form-control"-->
                <!--                      v-model="cardData.dueDate"-->
                <!--                    />-->
                <!--                  </div>-->
                <!--                </div>-->

                <!-- Labels -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <Tag size="16" class="me-2"/>
                    {{$t('boardV2.labels')}}
                  </label>
                  <div class="labels-input-container">
                    <div class="selected-labels mb-2" v-if="cardData.labels.length > 0">
                      <span
                        v-for="(label, index) in cardData.labels"
                        :key="index"
                        class="badge me-2 mb-2"
                        :class="getLabelClass(label)"
                      >
                        {{ label }}
                        <button
                          type="button"
                          class="btn-close btn-close-white ms-2"
                          style="font-size: 0.6rem;"
                          @click="removeLabel(index)"
                        ></button>
                      </span>
                    </div>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        v-model="newLabel"
                        @keydown.enter.prevent="addLabel"
                        :placeholder="t('boardV2.labelsPlaceholder')"
                      />
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        @click="addLabel"
                      >
                        <Plus size="16"/>
                      </button>
                    </div>
                  </div>
                </div>

                <!--                &lt;!&ndash; Assign Members &ndash;&gt;-->
                <!--                <div class="mb-4">-->
                <!--                  <label class="form-label fw-semibold">-->
                <!--                    <Users size="16" class="me-2"/>-->
                <!--                    Membros Atribuídos-->
                <!--                  </label>-->

                <!--                  &lt;!&ndash; Selected Members &ndash;&gt;-->
                <!--                  <div class="selected-members mb-3" v-if="cardData.assignedMembers.length > 0">-->
                <!--                    <div class="d-flex flex-wrap gap-2">-->
                <!--                      <div-->
                <!--                        v-for="member in cardData.assignedMembers"-->
                <!--                        :key="member.id"-->
                <!--                        class="member-chip d-flex align-items-center"-->
                <!--                      >-->
                <!--                        <img-->
                <!--                          :src="member.avatar"-->
                <!--                          :alt="member.name"-->
                <!--                          class="rounded-circle me-2"-->
                <!--                          width="24"-->
                <!--                          height="24"-->
                <!--                        />-->
                <!--                        <span class="me-2">{{ member.name }}</span>-->
                <!--                        <button-->
                <!--                          type="button"-->
                <!--                          class="btn-close"-->
                <!--                          style="font-size: 0.6rem;"-->
                <!--                          @click="removeMember(member.id)"-->
                <!--                        ></button>-->
                <!--                      </div>-->
                <!--                    </div>-->
                <!--                  </div>-->

                <!--                  &lt;!&ndash; Member Search &ndash;&gt;-->
                <!--                  <div class="member-search">-->
                <!--                    <div class="input-group">-->
                <!--                      <span class="input-group-text">-->
                <!--                        <Search size="16"/>-->
                <!--                      </span>-->
                <!--                      <input-->
                <!--                        type="text"-->
                <!--                        class="form-control"-->
                <!--                        v-model="memberSearch"-->
                <!--                        @input="searchMembers"-->
                <!--                        placeholder="Buscar membros..."-->
                <!--                      />-->
                <!--                    </div>-->

                <!--                    &lt;!&ndash; Search Results &ndash;&gt;-->
                <!--                    <div v-if="filteredMembers.length > 0 && memberSearch" class="member-results mt-2">-->
                <!--                      <div class="list-group">-->
                <!--                        <button-->
                <!--                          v-for="member in filteredMembers"-->
                <!--                          :key="member.id"-->
                <!--                          type="button"-->
                <!--                          class="list-group-item list-group-item-action d-flex align-items-center"-->
                <!--                          @click="assignMember(member)"-->
                <!--                          :disabled="isAlreadyAssigned(member.id)"-->
                <!--                        >-->
                <!--                          <img-->
                <!--                            :src="member.avatar"-->
                <!--                            :alt="member.name"-->
                <!--                            class="rounded-circle me-3"-->
                <!--                            width="32"-->
                <!--                            height="32"-->
                <!--                          />-->
                <!--                          <div class="flex-grow-1">-->
                <!--                            <div class="fw-semibold">{{ member.name }}</div>-->
                <!--                            <small class="text-muted">{{ member.email }}</small>-->
                <!--                          </div>-->
                <!--                          <div v-if="isAlreadyAssigned(member.id)" class="text-success">-->
                <!--                            <Check size="16"/>-->
                <!--                          </div>-->
                <!--                        </button>-->
                <!--                      </div>-->
                <!--                    </div>-->
                <!--                  </div>-->
                <!--                </div>-->

                <!-- Attachments -->
                <!--                <div class="mb-4">-->
                <!--                  <label class="form-label fw-semibold">-->
                <!--                    <Paperclip size="16" class="me-2"/>-->
                <!--                    Anexos-->
                <!--                  </label>-->
                <!--                  <div class="attachment-area border border-dashed rounded p-3 text-center">-->
                <!--                    <Upload size="32" class="text-muted mb-2"/>-->
                <!--                    <p class="text-muted mb-2">Arraste arquivos aqui ou clique para selecionar</p>-->
                <!--                    <button type="button" class="btn btn-outline-primary btn-sm">-->
                <!--                      Selecionar Arquivos-->
                <!--                    </button>-->
                <!--                  </div>-->
                <!--                </div>-->
              </div>
            </div>

            <!-- Right Panel - Tabs -->
            <div class="col-lg-4">
              <div class="tabs-container h-100">
                <!-- Tab Navigation -->
                <div class="tab-nav border-bottom">
                  <nav class="nav nav-tabs border-0">
                    <button
                      v-for="tab in tabs"
                      :key="tab.id"
                      class="nav-link border-0 px-3 py-3"
                      :class="{ active: activeTab === tab.id }"
                      @click="changeTab(tab.id)"
                    >
                      <component :is="tab.icon" size="16" class="me-2"/>
                      {{ tab.name }}
                      <span v-if="tab.count" class="badge bg-primary ms-2">{{ tab.count }}</span>
                    </button>
                  </nav>
                </div>

                <!-- Tab Content -->
                <div class="tab-content p-3" style="height: calc(100% - 60px); overflow-y: auto;">
                  <!-- Comments Tab -->
                  <div v-if="activeTab === 'comments'" class="tab-pane active">
                    <div class="comments-section">
                      <!-- Add Comment -->
                      <div class="add-comment mb-4">
                        <div class="d-flex align-items-start">
                          <img
                            :src="avatar"
                            alt="You"
                            class="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          <div class="flex-grow-1">
                            <textarea
                              class="form-control"
                              rows="3"
                              v-model="newComment"
                              placeholder="Escreva um comentário..."
                            ></textarea>
                            <div class="d-flex justify-content-end mt-2">
                              <button
                                class="btn btn-primary btn-sm"
                                @click="addComment"
                                :disabled="!newComment.trim()"
                              >
                                <Send size="14" class="me-1"/>
                                Comentar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Comments List -->
                      <div class="comments-list">
                        <div v-if="cardData.comments && cardData.comments.length === 0"
                             class="text-center text-muted py-4">
                          <MessageSquare size="32" class="mb-2"/>
                          <p>Nenhum comentário ainda</p>
                        </div>
                        <div v-else>

                          <div
                            v-for="comment in cardData.comments"
                            :key="comment.id"
                            class="comment-item mb-3"
                          >
                            <div class="d-flex align-items-start">
                              <img
                                :src="comment.avatar"
                                :alt="comment.userName"
                                class="rounded-circle me-2"
                                width="32"
                                height="32"
                              />
                              <div class="flex-grow-1">
                                <div class="comment-header d-flex align-items-center mb-1">
                                  <span class="fw-semibold me-2">{{ comment.userName }}</span>
                                  <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                                </div>
                                <div class="comment-text">{{ comment.text }}</div>
                              </div>
                              <div class="d-flex gap-2">
                                <button
                                  v-if="comment.userId === auth.user.id"
                                  class="btn btn-sm btn-link p-0 text-danger text-decoration-none"
                                  @click="deleteComment(comment.id)"
                                >
                                  {{ $t('boardV2.delete') }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Activity Tab -->
                  <div v-if="activeTab === 'activity'" class="tab-pane active">
                    <div class="activity-section">
                      <div v-if="cardData.history.length === 0" class="text-center text-muted py-4">
                        <Activity size="32" class="mb-2"/>
                        <p>Nenhuma atividade registrada</p>
                      </div>
                      <div v-else class="activity-timeline">
                        <div
                          v-for="activity in cardData.history"
                          :key="activity.id"
                          class="activity-item d-flex align-items-start mb-3"
                        >
                          <div class="activity-icon me-1">
                            <div class="rounded-circle p-1">
                              <img
                                :src="activity.user.avatar"
                                :alt="activity.user.name"
                                class="rounded-circle me-2"
                                width="34"
                                height="34"
                              />
                            </div>
                          </div>
                          <div class="flex-grow-1">
                            <div class="activity-content">
                              <span class="fw-semibold">{{ activity.user.name }}</span>
                              <div v-if="activity.action == 'create_card'">
                                    Criou o card.
                              </div>
                              <div v-else>
                                Movel o card de "{{ activity.data?.source.columnName }}" para "{{ activity.data?.target.columnName}}"
                              </div>

                            </div>
                            <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Checklist Tab -->
                  <div v-if="activeTab === 'checklist'" class="tab-pane active">
                    <div class="checklist-section">
                      <!-- Add Checklist Item -->
                      <div class="add-checklist-item mb-4">
                        <div class="input-group">
                          <input
                            type="text"
                            class="form-control"
                            v-model="newChecklistItem"
                            @keydown.enter.prevent="addChecklistItem"
                            placeholder="Adicionar item..."
                          />
                          <button
                            class="btn btn-outline-primary"
                            type="button"
                            @click="addChecklistItem"
                            :disabled="!newChecklistItem.trim()"
                          >
                            <Plus size="16"/>
                          </button>
                        </div>
                      </div>

                      <!-- Progress Bar -->
                      <div v-if="cardData?.checklist && cardData.checklist.length > 0" class="checklist-progress mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="fw-semibold">Progresso</span>
                          <span class="text-muted">{{ completedItems }}/{{ cardData.checklist.length }}</span>
                        </div>
                        <div class="progress">
                          <div
                            class="progress-bar"
                            :style="{ width: `${progressPercentage}%` }"
                          ></div>
                        </div>
                      </div>

                      <!-- Checklist Items -->
                      <div class="checklist-items">
                        <div v-if="cardData?.checklist && cardData.checklist.length === 0" class="text-center text-muted py-4">
                          <CheckSquare size="32" class="mb-2"/>
                          <p>Nenhum item na lista</p>
                        </div>
                        <div v-else>
                          <div
                            v-for="(item, index) in cardData.checklist"
                            :key="item.id"
                            class="checklist-item d-flex align-items-center mb-2"
                          >
                            <div class="form-check me-2">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                v-model="item.completed"
                                :id="`check-${item.id}`"
                              />
                            </div>
                            <div class="flex-grow-1">
                              <label
                                :for="`check-${item.id}`"
                                class="form-check-label"
                                :class="{ 'text-decoration-line-through text-muted': item.completed }"
                              >
                                {{ item.text }}
                              </label>
                            </div>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              @click="removeChecklistItem(index)"
                            >
                              <Trash2 size="14"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Details Tab -->
                  <div v-if="activeTab === 'details'" class="tab-pane active">
                    <div class="details-section">
                      <div class="detail-item mb-3" v-if="cardData.createdAt">
                        <div class="detail-label">
                          <Calendar size="16" class="me-2"/>
                          Criado em
                        </div>
                        <div class="detail-value">{{ formatDate(cardData.createdAt) }}</div>
                      </div>

                      <div class="detail-item mb-3" v-if="cardData.updatedAt">
                        <div class="detail-label">
                          <Clock size="16" class="me-2"/>
                          Última atualização
                        </div>
                        <div class="detail-value">{{ formatDate(cardData.updatedAt) }}</div>
                      </div>

                      <div class="detail-item mb-3">
                        <div class="detail-label">
                          <User size="16" class="me-2"/>
                          Criado por
                        </div>
                        <div class="detail-value d-flex align-items-center">
                          <img
                            :src="cardData.avatar"
                            :alt="cardData.name"
                            class="rounded-circle me-2"
                            width="24"
                            height="24"
                          />
                          {{ cardData.name }}
                        </div>
                      </div>

                      <div class="detail-item mb-3">
                        <div class="detail-label">
                          <Hash size="16" class="me-2"/>
                          ID do Card
                        </div>
                        <div class="detail-value">
                          <code>{{ cardData.id }}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer border-0 pt-0" style="z-index: 100">
          <div class="d-flex justify-content-between w-100">
            <div class="d-flex gap-2">
              <button v-if="isEditing" type="button" class="btn btn-outline-danger" @click="handleDelete">
                <Trash2 size="16" class="me-2"/>
                Excluir Card
              </button>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" @click="handleSave">
                <Save size="16" class="me-2"/>
                {{ isEditing ? t('boardV2.save') : 'Criar Card' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, defineProps, defineEmits, watch} from 'vue';
import {
  CreditCard, FileText, AlignLeft, AlertCircle, Calendar, Tag, Users, Search,
  Plus, Check, Paperclip, Upload, MessageSquare, Send, Activity, CheckSquare,
  Trash2, Save, Clock, User, BarChart3, Hash, ArrowRight, Edit, Move
} from 'lucide-vue-next';
import {useI18n} from 'vue-i18n';
import {useAuthStore} from "@/stores/auth";
import {getUserLoggedAvatar} from "@/utils/utils";
import {uniqueId} from "@/utils/uuid";

const auth = useAuthStore();
const {t, locale} = useI18n();

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false
  },
  cardData: {
    type: Object,
    default: () => (
      {
        id: '',
        title: '',
        description: '',
        labels: [],
        createdAt: '',
        updatedAt: '',
        comments: [],
        history: [],
        checklist: []
      })
  },
  columnId: {
    type: [String, Number],
    required:
      true
  },
  initialTab: {
    type: String,
    default:
      'details' // Ou qualquer valor padrão que faça sentido
  }
});

const avatar = ref(getUserLoggedAvatar());

const emit = defineEmits(['save', 'edit', 'delete', 'deleteComment', 'saveComment']);

const handleSave = () => {
  if (props.isEditing) {
    emit('edit', {...props.cardData});
  } else {
    emit('save', {...props.cardData});
  }
}

const handleDelete = () => {
  emit('delete', props.columnId, props.cardData.id);
}

const deleteComment = (commentId) => {
  emit('deleteComment', {commentId, ...props.cardData});
}
const changeTab = (tabId) => {
  activeTab.value = tabId;
};

// Reactive data
const cardModal = ref(null);
const activeTab = ref(props.initialTab);
const newLabel = ref('');
const memberSearch = ref('');
const newComment = ref('');
const newChecklistItem = ref('');

// Mock data for team members
const teamMembers = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  }
]);


// Checklist
const checklist = ref([
  {id: 1, text: 'Revisar requisitos', completed: true},
  {id: 2, text: 'Criar mockups', completed: true},
  {id: 3, text: 'Implementar funcionalidade', completed: false},
  {id: 4, text: 'Testes unitários', completed: false},
  {id: 5, text: 'Documentação', completed: false}
]);

// Tabs configuration
const tabs = computed(() => {
  const tabsAarray = [
    {
      id: 'comments',
      name: 'Comentários',
      icon: MessageSquare,
      count: props.cardData?.comments ? props.cardData.comments?.length : 0,
      visible: props.isEditing
    },
    {
      id: 'activity',
      name: 'Atividade',
      icon: Activity,
      count: props.cardData?.history ? props.cardData?.history.length : 0,
      visible: true
    },
    {
      id: 'checklist',
      name: 'Checklist',
      icon: CheckSquare,
      count: props.cardData?.checklist ? props.cardData?.checklist.length : 0,
      visible: props.isEditing
    },
    {
      id: 'details',
      name: 'Detalhes',
      icon: FileText,
      visible: props.isEditing
    }
  ]
  return tabsAarray.filter(tab => tab.visible);
});

// Computed properties
const filteredMembers = computed(() => {
  if (!memberSearch.value) return [];
  return teamMembers.value.filter(member =>
    member.name.toLowerCase().includes(memberSearch.value.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearch.value.toLowerCase())
  );
});

const completedItems = computed(() =>
  props.cardData.checklist.filter(item => item.completed).length
);

const progressPercentage = computed(() =>
  props.cardData.checklist.length > 0 ? (completedItems.value / props.cardData.checklist.length) * 100 : 0
);

// Methods
const addLabel = () => {
  if (newLabel.value.trim() && !props.cardData.labels.includes(newLabel.value.trim())) {
    props.cardData.labels.push(newLabel.value.trim());
    newLabel.value = '';
  }
};

const removeLabel = (index) => {
  props.cardData.labels.splice(index, 1);
};

const getLabelClass = (label) => {
  const hash = label.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash % 6);
  return `bg-${['primary', 'success', 'info', 'warning', 'danger', 'secondary'][index]}`;
};

const searchMembers = () => {
  // Search is handled by computed property
};

const assignMember = (member) => {
  if (!isAlreadyAssigned(member.id)) {
    props.cardData.assignedMembers.push(member);
    memberSearch.value = '';
  }
};

const removeMember = (memberId) => {
  props.cardData.assignedMembers = props.cardData.assignedMembers.filter(
    member => member.id !== memberId
  );
};

const isAlreadyAssigned = (memberId) => {
  return props.cardData.assignedMembers.some(member => member.id === memberId);
};

const addComment = () => {
  if (newComment.value.trim()) {

    const comment = {
      id: uniqueId(),
      userId: auth.user.id,
      userName: auth.user.name,
      text: newComment.value,
      avatar: avatar.value,
      createdAt: new Date().toISOString()
    };
    props.cardData.comments.push(comment);
    newComment.value = '';
    emit('saveComment', comment, {...props.cardData});
  }
};

const addChecklistItem = () => {
  if (newChecklistItem.value.trim()) {
    props.cardData.checklist.push({
      id: uniqueId(),
      text: newChecklistItem.value.trim(),
      completed: false
    });
    newChecklistItem.value = '';
  }
};

const removeChecklistItem = (index) => {
  props.cardData.checklist.splice(index, 1);
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'create_card':
      return Plus;
    case 'move_card':
      return ArrowRight;
    default:
      return Activity;
  }
};

const formatDate = computed(() => {
  return (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return t('date.now');
    if (diffInHours < 24) return t('date.hoursAgo', {hours: diffInHours});
    if (diffInDays === 1) return t('date.yesterday');
    if (diffInDays < 7) return t('date.daysAgo', {days: diffInDays});
    return date.toLocaleDateString(locale.value);
  };
});

const onModalHide = () => {
  console.log('Modal hidden');
  // Resetar o estado do modal
  resetModalState();
};

const onModalShow = () => {
  console.log('Modal show');
  activeTab.value = props.initialTab;
}

const resetModalState = () => {
  // Limpar campos de formulário
  newLabel.value = '';
  memberSearch.value = '';
  newComment.value = '';
  newChecklistItem.value = '';
};

onMounted(() => {

  if (cardModal.value) {
    cardModal.value.addEventListener('hide.bs.modal', onModalHide);
    cardModal.value.addEventListener('show.bs.modal', onModalShow);
  }

  // Inicializar activeTab com o valor de initialTab
  activeTab.value = props.initialTab;
});

// Observar mudanças em initialTab para manter activeTab sincronizado
watch(() => props.initialTab, (newInitialTab) => {
  // Atualizar activeTab quando initialTab mudar (exceto durante edição pelo usuário)
  activeTab.value = newInitialTab;
});

onUnmounted(() => {
  if (cardModal.value) {
    cardModal.value.removeEventListener('hide.bs.modal', onModalHide);
    cardModal.value.removeEventListener('show.bs.modal', onModalShow);
  }
});
</script>

<style scoped>

.comments-list, .activity-section, .checklist-items {
  max-height: 300px;
  overflow-y: auto;
}

.modal-dialog {
  max-width: 1200px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(45deg, var(--bs-primary), var(--bs-info));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.labels-input-container .selected-labels {
  min-height: 32px;
}

.member-chip {
  background: var(--bs-light);
  border: 1px solid var(--bs-border-color);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.875rem;
}

.member-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
}

.attachment-area {
  transition: all 0.2s ease;
  cursor: pointer;
}

.attachment-area:hover {
  border-color: var(--bs-primary);
  background-color: var(--bs-primary-bg-subtle);
}

.tabs-container {
  background: var(--bs-light);
}

.tab-nav {
  background: white;
}

.nav-tabs .nav-link {
  color: var(--bs-secondary);
  font-weight: 500;
  border-radius: 0;
  border-bottom: 3px solid transparent;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  background: var(--bs-light);
}

.nav-tabs .nav-link.active {
  color: var(--bs-primary);
  background: white;
  border-color: transparent transparent var(--bs-primary);
}

.comment-item {
  padding: 12px;
  background: var(--bs-light);
  border-radius: 8px;
  border-left: 3px solid var(--bs-primary);
}

.activity-timeline {
  position: relative;
}

.activity-item {
  position: relative;
}

.activity-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: -12px;
  width: 2px;
  background: var(--bs-border-color);
}

.checklist-item {
  padding: 8px 12px;
  background: var(--bs-light);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.checklist-item:hover {
  background: var(--bs-primary-bg-subtle);
}

.checklist-progress .progress {
  height: 8px;
}

.detail-item {
  padding: 12px;
  background: var(--bs-light);
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  color: var(--bs-secondary);
  font-size: 0.875rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.detail-value {
  color: var(--bs-body-color);
}

/* Dark mode compatibility */
:deep(.dark-mode) {
  .modal-content {
    background-color: #1e1e1e;
    color: #ffffff;
  }

  .modal-header {
    border-bottom-color: #2d2d2d;
  }

  .modal-footer {
    border-top-color: #2d2d2d;
  }

  .form-control,
  .form-select {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .form-control:focus,
  .form-select:focus {
    background-color: #363636;
    border-color: #4a4a4a;
    color: #ffffff;
  }

  .tabs-container {
    background-color: #2d2d2d;
  }

  .tab-nav {
    background-color: #1e1e1e;
  }

  .nav-tabs .nav-link.active {
    background-color: #1e1e1e;
    color: var(--bs-primary);
  }

  .comment-item,
  .checklist-item,
  .detail-item {
    background-color: #2d2d2d;
  }

  .member-chip {
    background-color: #2d2d2d;
    border-color: #404040;
  }

  .member-results {
    border-color: #404040;
  }

  .list-group-item {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .list-group-item:hover {
    background-color: #363636;
  }

  .attachment-area {
    border-color: #404040;
  }

  .attachment-area:hover {
    border-color: var(--bs-primary);
    background-color: rgba(var(--bs-primary-rgb), 0.1);
  }
}

/* Custom scrollbar */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-thumb {
  background: #4a4a4a;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}
</style>
