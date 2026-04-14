<template>
  <div class="modal fade" id="cardModal" tabindex="-1" ref="cardModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg">
        <!-- Modal Header -->
        <div class="modal-header border-0 pb-0">
          <div class="d-flex align-items-center">
            <div>
              <h4 class="modal-title mb-0">
                {{ isEditing ? t('boardV2.editCard') : t('boardV2.newCard') }}
                <span v-if="cardData.archived" class="badge bg-warning text-dark ms-2" style="font-size: 0.8rem;">
                  {{ t('board.archivedMode') }}
                </span>
              </h4>
            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-0">
          <div class="row g-0">
            <!-- Left Panel - Form -->
            <div class="col-lg-8 border-end">
              <div class="modal-body-panel p-3 pt-2">
                <!-- Card Title -->
                <div class="mb-2" v-if="boardConfig.showTitle">
                  <label class="form-label fw-semibold">
                    <FileText size="16" class="me-2"/>
                    {{ $t('boardV2.title') }}
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="cardData.title"
                    :placeholder="$t('boardV2.titlePlaceholder')"
                  />
                </div>

                <!-- Card Description -->
                <div class="mb-2" v-if="boardConfig.showDescription">
                  <label class="form-label fw-semibold">
                    <AlignLeft size="16" class="me-2"/>
                    {{ $t('boardV2.description') }}
                  </label>
                  <textarea
                    class="form-control"
                    rows="6"
                    v-model="cardData.description"
                    :placeholder="$t('boardV2.descriptionPlaceholder')"
                  ></textarea>
                </div>
                <!-- Labels -->
                <div class="mb-2" v-if="boardConfig.showTags">
                  <label class="form-label fw-semibold">
                    <Tag size="16" class="me-2"/>
                    {{ $t('boardV2.labels') }}
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

                <!-- Assign Members -->
                <div class="mb-2">
                  <label class="form-label fw-semibold">
                    <Users size="16" class="me-2"/>
                    {{ t('boardV2.assignedMembers') || 'Membro Atribuído' }}
                  </label>

                  <!-- Selected Member -->
                  <div class="selected-members mb-3" v-if="cardData.assigned_users && cardData.assigned_users.length > 0">
                    <div class="d-flex flex-wrap gap-2">
                      <div class="member-chip d-flex align-items-center border p-1 rounded-pill pe-2 bg-light" v-for="member in cardData.assigned_users" :key="member.id">
                        <img
                          :src="member.avatar"
                          :alt="member.name"
                          class="rounded-circle me-2"
                          width="24"
                          height="24"
                        />
                        <span class="me-2 small fw-medium">{{ member.name }}</span>
                        <button
                          type="button"
                          class="btn-close"
                          style="font-size: 0.6rem;"
                          @click="unassignMember(member.id, member.name)"
                        ></button>
                      </div>
                    </div>
                  </div>

                  <!-- Member Search Dropdown -->
                  <div class="member-search dropdown">
                    <button class="btn btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" @click.prevent>
                      <span class="text-muted"><Search size="16" class="me-2"/> Buscar membro</span>
                    </button>
                    <div class="dropdown-menu w-100 p-2 shadow" style="max-height: 250px; overflow-y: auto;">
                      <div class="input-group mb-2">
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          v-model="memberSearch"
                          :placeholder="'Buscar...'"
                          @click.stop
                        />
                      </div>

                      <div v-if="filteredMembers.length > 0">
                        <button
                          v-for="member in filteredMembers"
                          :key="member.userId"
                          type="button"
                          class="dropdown-item d-flex align-items-center rounded mb-1"
                          @click="assignMember(member)"
                        >
                          <img
                            :src="member.avatar"
                            :alt="member.name"
                            class="rounded-circle me-3"
                            width="28"
                            height="28"
                          />
                          <div class="flex-grow-1">
                            <div class="fw-semibold small">{{ member.name }}</div>
                            <small class="text-muted" style="font-size: 0.70rem;">{{ member.email || 'Membro do Board' }}</small>
                          </div>
                        </button>
                      </div>
                      <div v-else class="text-muted small text-center p-2">
                        <span v-if="isOwner">Membro não encontrado... Vá nas configurações para convidar.</span>
                        <span v-else>Membro não encontrado... Peça ao proprietário para convidar.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!--                 Attachments -->
                <div class="mb-2">
                  <label class="form-label fw-semibold">
                    <Paperclip size="16" class="me-2"/>
                    {{ $t('boardV2.attachments') }}
                  </label>
                  <div
                    @click="triggerFileInput"
                    class="attachment-area border border-dashed rounded p-2 text-center"
                    @dragover.prevent="onDragOver"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onFileDrop"
                    :class="{ 'drag-over': isDragging }"
                  >
                    <input
                      type="file"
                      ref="fileInput"
                      @change="onFileSelected"
                      multiple
                      class="d-none"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xlsx"
                    />
                    <Upload size="20" class="text-muted mb-1"/>
                    <p class="text-muted small mb-0">{{ $t('boardV2.dragFilesHere') }}</p>
<!--                    <button type="button" class="btn btn-outline-primary btn-sm" @click="triggerFileInput">-->
<!--                      {{ $t('boardV2.selectFiles') }}-->
<!--                    </button>-->
                    <div v-if="uploadError" class="alert alert-danger mt-2">
                      {{ uploadError }}
                    </div>
                    <div v-if="isUploading" class="mt-3">
                      <div class="progress">
                        <div
                          class="progress-bar"
                          role="progressbar"
                          :style="{ width: `${uploadProgress}%` }"
                          :aria-valuenow="uploadProgress"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {{ uploadProgress }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel - Tabs -->
            <div class="col-lg-4 d-flex flex-column">
              <div class="tabs-container flex-grow-1 d-flex flex-column overflow-hidden" style="max-height: calc(100vh - 120px); min-height: 100%;">
                <!-- Tab Navigation -->
                <div class="tab-nav border-bottom">
                  <nav class="nav nav-tabs border-0">
                    <button
                      v-for="tab in tabs"
                      :key="tab.id"
                      class="nav-link border-0 px-2 py-2 small"
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
                <div class="tab-content p-0 flex-grow-1 d-flex flex-column overflow-hidden">
                  <!-- Comments -->
                  <div v-if="activeTab === 'comments'" class="tab-pane active h-100 d-flex flex-column overflow-hidden">
                    <!-- Add Comment (Fixed) -->
                    <div class="add-comment p-3 border-bottom">
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
                              :placeholder="$t('boardV2.writeComment')"
                            ></textarea>
                            <div class="d-flex justify-content-end mt-2">
                              <button
                                class="btn btn-primary btn-sm"
                                @click="addComment"
                                :disabled="!newComment.trim()"
                              >
                                <Send size="14" class="me-1"/>
                                {{ $t('boardV2.addComment') }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Comments List (Scrollable) -->
                      <div class="comments-list flex-grow-1 p-3 overflow-auto">
                        <div v-if="cardData.comments && cardData.comments.length === 0"
                             class="text-center text-muted py-4">
                          <MessageSquare size="32" class="mb-2"/>
                          <p>{{ $t('boardV2.noComments') }}</p>
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

                  <!-- Activity -->
                  <div v-if="activeTab === 'activity'" class="tab-pane active h-100 d-flex flex-column overflow-hidden">
                    <div class="activity-section flex-grow-1 p-3 overflow-auto">
                      <div v-if="cardData.history.length === 0" class="text-center text-muted py-4">
                        <Activity size="32" class="mb-2"/>
                        <p>{{ $t('boardV2.noActivity') }}</p>
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
                                {{ $t('boardV2.createdCard') }}
                              </div>
                              <div v-else-if="activity.action == 'archive_card'">
                                {{ $t('boardV2.activityArchived') }}
                              </div>
                              <div v-else-if="activity.action == 'unarchive_card'">
                                {{ $t('boardV2.activityUnarchived') }}
                              </div>
                              <div v-else-if="activity.action == 'assign_member'">
                                Atribuiu para <span class="fw-semibold">{{ activity.data?.assigneeName }}</span>
                              </div>
                              <div v-else-if="activity.action == 'unassign_member'">
                                Removeu a atribuição de <span class="fw-semibold">{{ activity.data?.unassigneeName || 'um Membro' }}</span>
                              </div>
                              <div v-else>
                                {{
                                  $t('boardV2.movedCard', {
                                    source: activity.data?.source?.columnName || '...',
                                    target: activity.data?.target?.columnName || '...'
                                  })
                                }}
                              </div>

                            </div>
                            <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Checklist -->
                  <div v-if="activeTab === 'checklist'" class="tab-pane active h-100 d-flex flex-column overflow-hidden">
                    <!-- Checklist Header (Fixed) -->
                    <div class="p-3 border-bottom bg-light bg-opacity-10">
                      <!-- Add Checklist Item -->
                      <div class="add-checklist-item mb-3">
                        <div class="input-group">
                          <input
                            type="text"
                            class="form-control"
                            v-model="newChecklistItem"
                            @keydown.enter.prevent="addChecklistItem"
                            :placeholder="$t('boardV2.addItemPlaceholder')"
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
                      <div v-if="cardData?.checklist && cardData.checklist.length > 0" class="checklist-progress">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span class="fw-semibold small">{{ $t('boardV2.progress') }}</span>
                          <span class="text-muted small">{{ completedItems }}/{{ cardData.checklist.length }}</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                          <div
                            class="progress-bar"
                            :style="{ width: `${progressPercentage}%` }"
                          ></div>
                        </div>
                      </div>
                    </div>

                    <!-- Checklist Items (Scrollable) -->
                    <div class="checklist-items flex-grow-1 p-3 overflow-auto">
                      <div v-if="cardData?.checklist && cardData.checklist.length === 0"
                           class="text-center text-muted py-4">
                        <CheckSquare size="32" class="mb-2"/>
                        <p>{{ $t('boardV2.noChecklistItems') }}</p>
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

                  <!-- Attachments Tab -->
                  <div v-if="isEditing && activeTab === 'attachments'" class="tab-pane active">
                    <div class="attachments-section">
<!--                      <div class="add-attachment mb-4">-->
<!--                        <div class="attachment-area border border-dashed rounded p-3 text-center"-->
<!--                             @dragover.prevent="onDragOver"-->
<!--                             @dragleave.prevent="onDragLeave"-->
<!--                             @drop.prevent="onFileDrop"-->
<!--                             :class="{ 'drag-over': isDragging }">-->
<!--                          <input-->
<!--                            type="file"-->
<!--                            ref="fileInput"-->
<!--                            @change="onFileSelected"-->
<!--                            multiple-->
<!--                            class="d-none"-->
<!--                            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xlsx"-->
<!--                          />-->
<!--                          <Upload size="32" class="text-muted mb-2"/>-->
<!--                          <p class="text-muted mb-2">{{ $t('boardV2.dragFilesHere') }}</p>-->
<!--                          <button type="button" class="btn btn-outline-primary btn-sm" @click="triggerFileInput">-->
<!--                            {{ $t('boardV2.selectFiles') }}-->
<!--                          </button>-->
<!--                        </div>-->
<!--                        <div v-if="uploadError" class="alert alert-danger mt-2">-->
<!--                          {{ uploadError }}-->
<!--                        </div>-->
<!--                        <div v-if="isUploading" class="mt-3">-->
<!--                          <div class="progress">-->
<!--                            <div-->
<!--                              class="progress-bar"-->
<!--                              role="progressbar"-->
<!--                              :style="{ width: `${uploadProgress}%` }"-->
<!--                              :aria-valuenow="uploadProgress"-->
<!--                              aria-valuemin="0"-->
<!--                              aria-valuemax="100"-->
<!--                            >-->
<!--                              {{ uploadProgress }}%-->
<!--                            </div>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->

                      <!-- Attachments List -->
                      <div class="attachments-list">
                        <div v-if="cardData?.attachments && cardData?.attachments?.length === 0"
                             class="text-center text-muted py-4">
                          <Paperclip size="32" class="mb-2"/>
                          <p>{{ $t('boardV2.noAttachments') || 'No attachments yet' }}</p>
                        </div>
                        <div v-else>
<!--                          <h6 class="mb-3">{{ cardData?.attachments?.length }}-->
<!--                            {{-->
<!--                              cardData?.attachments?.length === 1 ? $t('boardV2.attachment') : $t('boardV2.attachments')-->
<!--                            }}</h6>-->

                          <div v-for="attachment in cardData.attachments" :key="attachment.id"
                               class="attachment-item mb-2">
                            <div class="card">
                              <div class="card-body p-3">
                                <div class="d-flex align-items-center">
                                  <div
                                    class="attachment-icon me-3 d-flex align-items-center justify-content-center bg-light rounded"
                                    style="width: 60px; height: 60px;">
                                    <FileText v-if="attachment.type === 'application/pdf'" size="24"
                                              class="text-danger"/>
                                    <FileImage v-else-if="attachment.type.includes('image')" size="24"
                                               class="text-gray-200"/>
                                    <FileText v-else-if="attachment.type.includes('word')" size="24"
                                              class="text-primary"/>
                                    <FileText v-else-if="attachment.type.includes('excel')" size="24"
                                              class="text-success"/>
                                    <File v-else size="24" class="text-secondary"/>
                                  </div>

                                  <div class="flex-grow-1">
                                    <h6 class="mb-1 text-ellipsis" :title="attachment.name">
                                      {{ attachment.name }}
                                    </h6>
                                    <div class="d-flex align-items-center text-muted small">
                                      <span class="me-2">{{ formatFileSize(attachment.size) }}</span>
                                      <span>{{ formatDate(attachment.createdAt) }}</span>
                                    </div>
                                  </div>

                                  <div class="attachment-actions">
                                    <button @click="downloadAttachment(attachment.id)"
                                            class="btn btn-sm btn-outline-primary me-1">
                                      <Download size="14"/>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-danger"
                                            @click="removeAttachment(attachment.id)">
                                      <Trash2 size="14"/>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
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
                          {{ $t('boardV2.createdOn') }}
                        </div>
                        <div class="detail-value">{{ formatDate(cardData.createdAt) }}</div>
                      </div>

                      <div class="detail-item mb-3" v-if="cardData.updatedAt">
                        <div class="detail-label">
                          <Clock size="16" class="me-2"/>
                          {{ $t('boardV2.lastUpdate') }}
                        </div>
                        <div class="detail-value">{{ formatDate(cardData.updatedAt) }}</div>
                      </div>

                      <div class="detail-item mb-3">
                        <div class="detail-label">
                          <User size="16" class="me-2"/>
                          {{ $t('boardV2.createdBy') }}
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
                          {{ $t('boardV2.cardId') }}
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
                {{ $t('boardV2.deleteCard') }}
              </button>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                {{ $t('boardV2.cancel') }}
              </button>
              <button type="button" class="btn btn-primary" @click="handleSave">
                <Save size="16" class="me-2"/>
                {{ isEditing ? t('boardV2.save') : t('boardV2.createCard') }}
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
  Trash2, Save, Clock, User, BarChart3, Hash, ArrowRight, Edit, Move,
  File, Download, FileImage
} from 'lucide-vue-next';
import {useI18n} from 'vue-i18n';
import {useAuthStore} from "@/stores/auth";
import {getUserLoggedAvatar} from "@/utils/utils";
import {uniqueId} from "@/utils/uuid";
import {configDefault} from "@/utils/templates";
import api from '@/utils/api';
import {useRoute} from 'vue-router';
import {useSwal} from "@/utils/swal";

const $swal = useSwal();
const auth = useAuthStore();
const {t, locale} = useI18n();
const route = useRoute();

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
        checklist: [],
        attachments: []
      })
  },
  boardConfig: {
    type: Object,
    default: () => (configDefault)
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
  },
  availableMembers: {
    type: Array,
    default: () => []
  },
  isOwner: {
    type: Boolean,
    default: false
  }
});

const avatar = ref(getUserLoggedAvatar());

const emit = defineEmits(['save', 'edit', 'delete', 'deleteComment', 'saveComment']);

const handleSave = () => {
  if (props.isEditing) {
    emit('edit', {...props.cardData});
  } else {
    emit('save', {...props.cardData});
    // Reset do cardData após criar um novo card
    setTimeout(() => {
      const defaultCardData = {
        id: '',
        title: '',
        description: '',
        labels: [],
        createdAt: '',
        updatedAt: '',
        comments: [],
        history: [],
        checklist: [],
        attachments: []
      };

      Object.keys(defaultCardData).forEach(key => {
        if (props.cardData[key] !== undefined) {
          if (Array.isArray(defaultCardData[key])) {
            props.cardData[key] = [];
          } else {
            props.cardData[key] = defaultCardData[key];
          }
        }
      });
    }, 100);
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

// File upload related data
const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadProgress = ref(0);
const uploadError = ref('');
const isUploading = ref(false);
const isDragging = ref(false);
const maxFileSize = ref(5 * 1024 * 1024); // Default 5MB, will be updated from backend
const maxTotalSize = 10 * 1024 * 1024; // 10MB in bytes
const allowedImageTypes = ref(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const allowedDocumentTypes = ref(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
const filteredMembers = computed(() => {
  let members = props.availableMembers;
  if (props.cardData.assigned_users && props.cardData.assigned_users.length > 0) {
    const assignedIds = props.cardData.assigned_users.map(u => u.id);
    members = members.filter(m => !assignedIds.includes(m.userId));
  }

  if (!memberSearch.value) return members;
  const search = memberSearch.value.toLowerCase();
  return members.filter(m =>
    m.name?.toLowerCase().includes(search) ||
    m.email?.toLowerCase().includes(search)
  );
});

const assignMember = (member) => {
  if (!props.cardData.assigned_users) props.cardData.assigned_users = [];
  props.cardData.assigned_users.push({ id: member.userId, name: member.name, avatar: member.avatar });
  memberSearch.value = '';
  // Add history event
  if (!props.cardData.history) props.cardData.history = [];
  props.cardData.history.push({
    id: uniqueId(),
    user: { name: auth.user.name, avatar: avatar.value },
    action: 'assign_member',
    timestamp: new Date().toISOString(),
    data: { assigneeName: member.name }
  });
};

const unassignMember = (memberId, memberName) => {
  if (!props.cardData.assigned_users) return;
  props.cardData.assigned_users = props.cardData.assigned_users.filter(m => m.id !== memberId);
  // Add history event
  if (!props.cardData.history) props.cardData.history = [];
  props.cardData.history.push({
    id: uniqueId(),
    user: { name: auth.user.name, avatar: avatar.value },
    action: 'unassign_member',
    timestamp: new Date().toISOString(),
    data: { unassigneeName: memberName || 'Membro' }
  });
};



// Tabs configuration
const tabs = computed(() => {
  const tabsAarray = [
    {
      id: 'comments',
      name: t('boardV2.comments'),
      icon: MessageSquare,
      count: props.cardData?.comments ? props.cardData.comments?.length : 0,
      visible: props.isEditing
    },
    {
      id: 'activity',
      name: t('boardV2.activity'),
      icon: Activity,
      count: props.cardData?.history ? props.cardData?.history.length : 0,
      visible: true
    },
    {
      id: 'checklist',
      name: t('boardV2.checklist'),
      icon: CheckSquare,
      count: props.cardData?.checklist ? props.cardData?.checklist.length : 0,
      visible: props.isEditing
    },
    {
      id: 'attachments',
      name: t('boardV2.attachments'),
      icon: Paperclip,
      count: props.cardData?.attachments ? props.cardData?.attachments.length : 0,
      visible: props.isEditing
    },
    {
      id: 'details',
      name: t('boardV2.details'),
      icon: FileText,
      visible: props.isEditing
    }
  ]
  return tabsAarray.filter(tab => tab.visible);
});

// Computed properties

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

//

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
  resetModalState();

  if (!props.isEditing) {
    const defaultCardData = {
      id: '',
      title: '',
      description: '',
      labels: [],
      createdAt: '',
      updatedAt: '',
      comments: [],
      history: [],
      checklist: [],
      attachments: []
    };

    Object.keys(defaultCardData).forEach(key => {
      if (props.cardData[key] !== undefined) {
        if (Array.isArray(defaultCardData[key])) {
          props.cardData[key] = [];
        } else {
          props.cardData[key] = defaultCardData[key];
        }
      }
    });
  }
};

const onModalShow = () => {
  console.log('Modal show');
  activeTab.value = props.initialTab;
  setTimeout(fetchAttachments, 1000);
}

const fetchAttachments = async () => {
  try {
    if (!props.isEditing || !props.cardData?.id) return;
    const {data} = await api.get(`/attachments/item/${props.cardData.id}`);
    if (data?.success && Array.isArray(data.attachments)) {
      props.cardData.attachments = data.attachments;
    }
  } catch (e) {
    console.error('Error fetching attachments:', e);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onFileDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  handleFiles(files);
};

const onFileSelected = (event) => {
  const files = event.target.files;
  handleFiles(files);
  event.target.value = '';
};

const handleFiles = (files) => {
  uploadError.value = '';

  const fileArray = Array.from(files);

  const validFiles = [];
  let totalSize = 0;

  for (const file of fileArray) {
    const validationResult = validateFile(file);
    if (validationResult.valid) {
      validFiles.push(file);
      totalSize += file.size;
    } else {
      uploadError.value = validationResult.error;
      return;
    }
  }

  const currentAttachmentsSize = props.cardData?.attachments?.reduce((sum, attachment) => sum + (attachment.size || 0), 0);
  if (currentAttachmentsSize + totalSize > maxTotalSize) {
    uploadError.value = t('boardV2.errors.totalSizeExceeded', { maxSize: maxTotalSize / (1024 * 1024) });
    return;
  }

  selectedFiles.value = [...selectedFiles.value, ...validFiles];

  uploadFiles(validFiles);
};

const validateFile = (file) => {
  if (file.size > maxFileSize.value) {
    return {
      valid: false,
      error: t('boardV2.errors.fileSizeExceeded', { fileName: file.name, maxSize: maxFileSize.value / (1024 * 1024) })
    };
  }

  const isImage = allowedImageTypes.value.includes(file.type);
  const isDocument = allowedDocumentTypes.value.includes(file.type);

  if (!isImage && !isDocument) {
    return {
      valid: false,
      error: t('boardV2.errors.fileTypeNotSupported')
    };
  }

  return {valid: true};
};

const uploadFiles = async (files) => {
  try {
    if (!props.isEditing || !props.cardData?.id) {
      uploadError.value = t ? t('boardV2.errors.uploadOnlyInEdit') || 'Uploads are only available when editing an existing card' : 'Uploads are only available when editing an existing card';
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('boardId', (route.params?.id || '').toString());
      formData.append('itemId', props.cardData.id);

      const {data} = await api.post('/attachments/upload', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: (evt) => {
          if (evt.total) {
            const perFile = evt.loaded / evt.total;
            uploadProgress.value = Math.min(100, Math.round(((i + perFile) / totalFiles) * 100));
          }
        }
      });

      if (data?.success && data?.attachment) {
        props.cardData.attachments.push(data.attachment);
      } else {
        throw new Error(data?.message || t('boardV2.errors.uploadFailed'));
      }
    }

    uploadProgress.value = 100;
    if (activeTab.value !== 'attachments') {
      activeTab.value = 'attachments';
    }
  } catch (e) {
    console.error('Upload error:', e);
    uploadError.value = e?.response?.data?.message || e?.message || t('boardV2.errors.errorUploadingFile');
  } finally {
    isUploading.value = false;
  }
};


const downloadAttachment = async (attachmentId) => {
  try {
    const {data} = await api.get(`/attachments/${attachmentId}/download`);

    const filename = data.url.split('/').pop().split('?')[0];
    const a = document.createElement('a');
    a.href = data.url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (e) {
    console.error('Error download attachment:', e);
    uploadError.value = e?.response?.data?.message || e?.message || t('boardV2.errors.errorDownloadingAttachment');
  }
};

const removeAttachment = async (attachmentId) => {
  $swal.fire({
    title: t('boardV2.confirmations.removeAttachment'),
    icon: "question",
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: t('boardV2.confirmations.yes'),
    denyButtonText: t('boardV2.confirmations.no')
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/attachments/${attachmentId}`);
        const index = props.cardData.attachments.findIndex(attachment => attachment.id === attachmentId);
        if (index !== -1) {
          // If the attachment has a temporary URL, revoke it to free up memory
          if (typeof props.cardData.attachments[index].url === 'string' && props.cardData.attachments[index].url.startsWith('blob:')) {
            URL.revokeObjectURL(props.cardData.attachments[index].url);
          }
          props.cardData.attachments.splice(index, 1);
        }
      } catch (e) {
        console.error('Error deleting attachment:', e);
        uploadError.value = e?.response?.data?.message || e?.message || 'Error deleting attachment';
      }
    }
  });
};


const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const resetModalState = () => {
  newLabel.value = '';
  memberSearch.value = '';
  newComment.value = '';
  newChecklistItem.value = '';
  uploadError.value = '';
  uploadProgress.value = 0;
  isUploading.value = false;
  isDragging.value = false;
  selectedFiles.value = [];
};

const fetchUploadSizeConfig = async () => {
  try {
    const { data } = await api.get('/attachments/user/size');
    if (data?.success) {
      maxFileSize.value = data.maxFileSize;
      allowedImageTypes.value = data.allowedImageTypes;
      allowedDocumentTypes.value = data.allowedDocumentTypes
    }
  } catch (error) {
    console.error('Error fetching upload size config:', error);
  }
};

onMounted(() => {
  fetchUploadSizeConfig();

  if (cardModal.value) {
    cardModal.value.addEventListener('hide.bs.modal', onModalHide);
    cardModal.value.addEventListener('show.bs.modal', onModalShow);
  }

  activeTab.value = props.initialTab;
});

watch(() => props.initialTab, (newInitialTab) => {
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

.modal-body-panel {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  scroll-behavior: smooth;
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
  background: var(--bg-board);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.875rem;
}

.member-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--bg-card);
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
  background: var(--bg-board);
}

.tab-nav {
  background: var(--bg-card);
}

.nav-tabs .nav-link {
  color: var(--text-muted);
  font-weight: 500;
  border-radius: 0;
  border-bottom: 3px solid transparent;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  background: var(--bg-board);
}

.nav-tabs .nav-link.active {
  color: var(--bs-primary);
  background: var(--bg-card);
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
    background-color: var(--bg-card);
    color: var(--text-main);
  }

  .modal-header, .modal-footer {
    border-color: var(--border-color);
  }

  .form-control,
  .form-select {
    background-color: var(--bg-card);
    border-color: var(--border-color);
    color: var(--text-main);
  }

  .form-control:focus,
  .form-select:focus {
    background-color: var(--bg-card);
    border-color: var(--bs-primary);
    color: var(--text-main);
  }

  .tabs-container {
    background-color: var(--bg-board);
  }

  .tab-nav {
    background-color: var(--bg-card);
  }

  .nav-tabs .nav-link.active {
    background-color: var(--bg-card);
    color: var(--bs-primary);
  }

  .member-chip {
    background-color: var(--bg-board);
    border-color: var(--border-color);
  }

  .member-results {
    border-color: var(--border-color);
    background-color: var(--bg-card);
  }

  .list-group-item {
    background-color: var(--bg-board);
    border-color: var(--border-color);
    color: var(--text-main);
  }

  .list-group-item:hover {
    background-color: var(--bg-card);
  }

  .dropdown-menu {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }

  .dropdown-item {
    color: var(--text-main);
  }

  .dropdown-item:hover {
    background-color: var(--bg-board);
    color: var(--text-main);
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
.tab-content::-webkit-scrollbar,
.modal-body-panel::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track,
.modal-body-panel::-webkit-scrollbar-track {
  background: transparent;
}

.tab-content::-webkit-scrollbar-thumb,
.modal-body-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb:hover,
.modal-body-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-track,
:deep(.dark-mode) .modal-body-panel::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-thumb,
:deep(.dark-mode) .modal-body-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-thumb:hover,
:deep(.dark-mode) .modal-body-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.text-ellipsis {
  display: inline-block; /* ou block/flex item */
  max-width: 200px; /* defina um limite fixo ou relativo */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle; /* opcional, deixa alinhado */
}
</style>
